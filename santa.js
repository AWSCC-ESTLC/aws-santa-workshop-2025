// ==================== CONFIGURATION ====================
const API_BASE_URL = 'https://6220jrfx30.execute-api.us-east-1.amazonaws.com/prod';
const CHRISTMAS_DATE = new Date(new Date().getFullYear(), 11, 25); // Dec 25

// ==================== DOM ELEMENTS ====================
const elements = {
    // Countdown & Time
    christmasCountdown: document.getElementById('christmas-countdown'),
    currentTime: document.getElementById('current-time'),
    lastUpdated: document.getElementById('last-updated'),
    apiStatus: document.getElementById('api-status'),
    
    // Stats Cards
    totalToys: document.getElementById('totalToys'),
    activeLines: document.getElementById('activeLines'),
    stockAlerts: document.getElementById('stockAlerts'),
    regionsStocked: document.getElementById('regionsStocked'),
    toyTrend: document.getElementById('toyTrend'),
    
    // Tables & Lists
    inventoryTable: document.getElementById('inventoryTable'),
    productionGrid: document.getElementById('productionGrid'),
    alertsList: document.getElementById('alertsList'),
    alertCount: document.getElementById('alertCount'),
    
    // Alert Banner
    alertBanner: document.getElementById('alertBanner'),
    alertMessage: document.getElementById('alertMessage'),
    
    // Chart
    stockChart: null
};

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎅 Santa\'s Toy Factory Dashboard Initializing...');
    console.log('API Base URL:', API_BASE_URL);
    
    // Initialize real-time updates
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
    
    updateChristmasCountdown();
    setInterval(updateChristmasCountdown, 1000);
    
    // Load dashboard data from REAL API
    loadDashboardData();
    
    // Auto-refresh every 30 seconds
    setInterval(loadDashboardData, 30000);
    
    // Initialize chart
    initializeChart();
});

// ==================== REAL-TIME UPDATES ====================
function updateCurrentTime() {
    const now = new Date();
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    };
    elements.currentTime.textContent = now.toLocaleDateString('en-US', options);
    elements.lastUpdated.textContent = `Last Updated: ${now.toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'})}`;
}

function updateChristmasCountdown() {
    const now = new Date();
    const christmas = new Date(CHRISTMAS_DATE);
    
    // If Christmas has passed, set for next year
    if (now > christmas) {
        christmas.setFullYear(christmas.getFullYear() + 1);
    }
    
    const diff = christmas - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    elements.christmasCountdown.textContent = 
        `${days.toString().padStart(2, '0')}:${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// ==================== REAL API INTEGRATION ====================
async function fetchFromAPI(endpoint) {
    try {
        console.log(`🌐 Fetching: ${API_BASE_URL}${endpoint}`);
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }
        
        const data = await response.json();
        console.log(`✅ ${endpoint}: Loaded ${Array.isArray(data) ? data.length + ' items' : 'data'}`);
        return data;
    } catch (error) {
        console.error(`❌ API Error (${endpoint}):`, error);
        return null;
    }
}

async function loadDashboardData() {
    console.log('🔄 Loading REAL data from Toy Factory API...');
    showLoading(true);
    
    try {
        // Load ALL real data from your API
        const [inventory, productionLines, alerts, stats] = await Promise.all([
            fetchFromAPI('/inventory'),
            fetchFromAPI('/production'),
            fetchFromAPI('/alerts'),
            fetchFromAPI('/stats')
        ]);
        
        // Update dashboard with REAL data
        if (inventory && Array.isArray(inventory)) {
            updateInventoryTable(inventory);
        } else {
            console.warn('⚠️ No inventory data received');
            useFallbackInventory();
        }
        
        if (productionLines && Array.isArray(productionLines)) {
            updateProductionLines(productionLines);
        } else {
            console.warn('⚠️ No production data received');
            useFallbackProduction();
        }
        
        if (alerts && Array.isArray(alerts)) {
            updateAlertsList(alerts);
        } else {
            console.warn('⚠️ No alerts data received');
            useFallbackAlerts();
        }
        
        if (stats) {
            updateDashboardStats(stats);
        } else {
            console.warn('⚠️ No stats data received');
            calculateStatsFromInventory(inventory || []);
        }
        
        // Update API status
        elements.apiStatus.textContent = 'Connected';
        elements.apiStatus.className = 'status-good';
        
        showAlert('success', 'Dashboard updated with real factory data');
        
    } catch (error) {
        console.error('❌ Error loading dashboard:', error);
        elements.apiStatus.textContent = 'Connection Error';
        elements.apiStatus.className = 'status-error';
        showAlert('error', 'Failed to load data. Showing cached information.');
        
        // Load fallback data
        loadFallbackData();
    } finally {
        showLoading(false);
    }
}

// ==================== DASHBOARD UPDATERS ====================
function updateInventoryTable(inventory) {
    const tableBody = elements.inventoryTable;
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    inventory.forEach(item => {
        const row = document.createElement('tr');
        
        // Determine status class
        let statusClass = 'status-instock';
        let statusText = 'In Stock';
        
        if (item.status === 'LOW_STOCK') {
            statusClass = 'status-lowstock';
            statusText = 'Low Stock';
        } else if (item.status === 'OUT_OF_STOCK') {
            statusClass = 'status-outstock';
            statusText = 'Out of Stock';
        }
        
        row.innerHTML = `
            <td>
                <div class="toy-info">
                    <strong>${item.toyName || 'Unknown Toy'}</strong>
                    <small>ID: ${item.toyId || 'N/A'}</small>
                </div>
            </td>
            <td>
                <div class="region-info">
                    <div>${item.region || 'Unknown Region'}</div>
                    <small>${item.city || 'Unknown City'}</small>
                </div>
            </td>
            <td>
                <div class="stock-info">
                    <strong>${(item.currentStock || 0).toLocaleString()}</strong>
                    <small>Min: ${(item.minimumStock || 0).toLocaleString()}</small>
                </div>
            </td>
            <td>
                <span class="status-badge ${statusClass}">${statusText}</span>
            </td>
            <td>${item.restockETA || '--:--'}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action" title="Restock" onclick="restockToy('${item.toyId}')">
                        <i class="fas fa-truck-loading"></i>
                    </button>
                    <button class="btn-action" title="Details" onclick="showToyDetails('${item.toyId}')">
                        <i class="fas fa-info-circle"></i>
                    </button>
                    <button class="btn-action" title="Alert" onclick="createAlert('${item.toyId}')">
                        <i class="fas fa-bell"></i>
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

function updateProductionLines(lines) {
    const productionGrid = elements.productionGrid;
    if (!productionGrid) return;
    
    productionGrid.innerHTML = '';
    
    let activeCount = 0;
    
    lines.forEach(line => {
        if (line.status === 'ACTIVE') activeCount++;
        
        const lineElement = document.createElement('div');
        lineElement.className = 'production-line';
        
        let statusClass = 'status-idle';
        if (line.status === 'ACTIVE') statusClass = 'status-active';
        if (line.status === 'MAINTENANCE') statusClass = 'status-maintenance';
        
        lineElement.innerHTML = `
            <div class="line-header">
                <div class="line-name">${line.lineName || 'Unknown Line'}</div>
                <span class="line-status ${statusClass}">${line.status || 'UNKNOWN'}</span>
            </div>
            <div class="line-stats">
                <div>
                    <div class="stat-label">Output</div>
                    <div class="stat-value">${line.outputPerHour || 0}/hr</div>
                </div>
                <div>
                    <div class="stat-label">Quality</div>
                    <div class="stat-value">${line.qualityScore || 0}%</div>
                </div>
                <div>
                    <div class="stat-label">Type</div>
                    <div>${line.toyType || 'Unknown'}</div>
                </div>
                <div>
                    <div class="stat-label">ID</div>
                    <div>${line.lineId || 'N/A'}</div>
                </div>
            </div>
        `;
        
        productionGrid.appendChild(lineElement);
    });
    
    // Update active lines counter
    animateCounter(elements.activeLines, activeCount);
}

function updateAlertsList(alerts) {
    const alertsList = elements.alertsList;
    if (!alertsList) return;
    
    alertsList.innerHTML = '';
    
    alerts.forEach(alert => {
        const alertElement = document.createElement('div');
        alertElement.className = 'alert-item';
        
        let icon = 'fa-exclamation-circle';
        if (alert.severity === 'CRITICAL') icon = 'fa-skull-crossbones';
        if (alert.severity === 'MEDIUM') icon = 'fa-exclamation-triangle';
        if (alert.severity === 'LOW') icon = 'fa-info-circle';
        
        const timeAgo = getTimeAgo(alert.createdAt);
        
        alertElement.innerHTML = `
            <i class="fas ${icon}"></i>
            <div class="alert-content">
                <div class="alert-message">${alert.message || 'New alert'}</div>
                <div class="alert-time">${timeAgo}</div>
            </div>
            <button class="btn-action" onclick="resolveAlert('${alert.alertId}')" title="Mark as resolved">
                <i class="fas fa-check"></i>
            </button>
        `;
        
        alertsList.appendChild(alertElement);
    });
    
    // Update alert count
    const alertCount = alerts.length;
    elements.alertCount.textContent = alertCount;
    animateCounter(elements.stockAlerts, alertCount);
}

function updateDashboardStats(stats) {
    if (!stats) return;
    
    // Update main counters from stats API
    if (stats.totalToys !== undefined) {
        animateCounter(elements.totalToys, stats.totalToys);
    }
    
    if (stats.productionStats) {
        animateCounter(elements.activeLines, stats.productionStats.activeLines || 0);
    }
    
    if (stats.alertStats) {
        animateCounter(elements.stockAlerts, stats.alertStats.total || 0);
    }
    
    if (stats.regionStats) {
        const regionCount = Object.keys(stats.regionStats).length;
        animateCounter(elements.regionsStocked, regionCount);
    }
    
    // Update trend
    if (stats.totalToys) {
        const todayIncrease = Math.floor(stats.totalToys * 0.05); // 5% for demo
        elements.toyTrend.textContent = `+${todayIncrease.toLocaleString()} today`;
    }
    
    // Update chart with inventory data
    if (stats.inventoryStatus) {
        updateChartFromStats(stats);
    }
}

function calculateStatsFromInventory(inventory) {
    if (!inventory || !Array.isArray(inventory)) return;
    
    const stats = {
        totalToys: inventory.reduce((sum, item) => sum + (item.currentStock || 0), 0),
        productionStats: { activeLines: 0, totalLines: 0 },
        alertStats: { total: 0 },
        regionStats: {}
    };
    
    updateDashboardStats(stats);
}

// ==================== CHART FUNCTIONS ====================
function initializeChart() {
    const ctx = document.getElementById('stockChart');
    if (!ctx) return;
    
    elements.stockChart = new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'In Stock',
                    backgroundColor: '#4CAF50',
                    data: []
                },
                {
                    label: 'Low Stock',
                    backgroundColor: '#FF9800',
                    data: []
                },
                {
                    label: 'Out of Stock',
                    backgroundColor: '#F44336',
                    data: []
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)'
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: 'rgba(255, 255, 255, 0.7)'
                    }
                }
            }
        }
    });
}

function updateChartFromStats(stats) {
    if (!elements.stockChart || !stats.inventoryStatus) return;
    
    const status = stats.inventoryStatus;
    elements.stockChart.data.labels = ['Stock Status'];
    elements.stockChart.data.datasets[0].data = [status.IN_STOCK || 0];
    elements.stockChart.data.datasets[1].data = [status.LOW_STOCK || 0];
    elements.stockChart.data.datasets[2].data = [status.OUT_OF_STOCK || 0];
    elements.stockChart.update();
}

// ==================== HELPER FUNCTIONS ====================
function animateCounter(element, target) {
    if (!element) return;
    
    const current = parseInt(element.textContent.replace(/,/g, '')) || 0;
    const duration = 1000;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.floor(current + (target - current) * easeOut);
        
        element.textContent = currentValue.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

function getTimeAgo(timestamp) {
    if (!timestamp) return 'Recently';
    
    const now = new Date();
    const past = new Date(timestamp);
    const diff = now - past;
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
}

function showAlert(type, message) {
    if (!elements.alertMessage || !elements.alertBanner) return;
    
    elements.alertMessage.textContent = message;
    elements.alertBanner.style.display = 'flex';
    
    if (type === 'error') {
        elements.alertBanner.style.background = 'linear-gradient(90deg, #ff6b6b, #ff8e53)';
    } else if (type === 'success') {
        elements.alertBanner.style.background = 'linear-gradient(90deg, #4CAF50, #8BC34A)';
    } else {
        elements.alertBanner.style.background = 'linear-gradient(90deg, #2196F3, #03A9F4)';
    }
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        closeAlert();
    }, 5000);
}

function closeAlert() {
    if (elements.alertBanner) {
        elements.alertBanner.style.display = 'none';
    }
}

function showLoading(show) {
    // You can implement a loading spinner here
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        loadingElement.style.display = show ? 'block' : 'none';
    }
    
    if (show) {
        console.log('⏳ Loading real factory data...');
    }
}

// ==================== FALLBACK DATA ====================
function useFallbackInventory() {
    const fallbackInventory = [
        {
            toyid: "TOY001",
            toyName: "Teddy Bear",
            region: "Central Africa",
            city: "Douala",
            currentStock: 1500,
            minimumStock: 2000,
            status: "LOW_STOCK",
            restockETA: "02:30"
        }
    ];
    updateInventoryTable(fallbackInventory);
}

function useFallbackProduction() {
    const fallbackProduction = [
        {
            lineId: "LINE001",
            lineName: "Teddy Bear Assembly",
            status: "ACTIVE",
            outputPerHour: 500,
            toyType: "Teddy Bears",
            qualityScore: 98
        }
    ];
    updateProductionLines(fallbackProduction);
}

function useFallbackAlerts() {
    const fallbackAlerts = [
        {
            alertId: "ALERT001",
            severity: "HIGH",
            message: "Teddy Bears running low in Douala (1500/2000)",
            createdAt: new Date().toISOString()
        }
    ];
    updateAlertsList(fallbackAlerts);
}

function loadFallbackData() {
    useFallbackInventory();
    useFallbackProduction();
    useFallbackAlerts();
    showAlert('warning', 'Using fallback data. Check API connection.');
}

// ==================== ACTION FUNCTIONS ====================
async function restockToy(toyid) {
    showAlert('info', `Initiating restock for Toy ID: ${toyid}`);
    
    try {
        // In real implementation, call API to update inventory
        const response = await fetch(`${API_BASE_URL}/inventory`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                toyid: toyid,
                currentStock: 2000, // Restock to full
                action: 'restock'
            })
        });
        
        if (response.ok) {
            showAlert('success', `Toy ${toyid} restocked successfully`);
            loadDashboardData(); // Refresh data
        }
    } catch (error) {
        console.error('Restock error:', error);
    }
}

function showToyDetails(toyid) {
    showAlert('info', `Showing details for Toy ID: ${toyid}`);
    // In real implementation, show modal with details
}

async function createAlert(toyid) {
    showAlert('warning', `Creating alert for Toy ID: ${toyid}`);
    
    try {
        const response = await fetch(`${API_BASE_URL}/alerts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                toyid: toyid,
                severity: "MEDIUM",
                message: `Manual alert created for toy ${toyid}`
            })
        });
        
        if (response.ok) {
            showAlert('success', 'Alert created successfully');
            loadDashboardData(); // Refresh data
        }
    } catch (error) {
        console.error('Create alert error:', error);
    }
}

async function resolveAlert(alertId) {
    showAlert('info', `Resolving alert: ${alertId}`);
    
    try {
        const response = await fetch(`${API_BASE_URL}/alerts`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                alertId: alertId,
                resolved: true
            })
        });
        
        if (response.ok) {
            showAlert('success', 'Alert marked as resolved');
            loadDashboardData(); // Refresh data
        }
    } catch (error) {
        console.error('Resolve alert error:', error);
    }
}

// ==================== UTILITY FUNCTIONS ====================
function filterInventory() {
    const filter = document.getElementById('regionFilter');
    if (!filter) return;
    
    const selectedRegion = filter.value;
    console.log('Filtering inventory by region:', selectedRegion);
    // Implement filtering logic here
}