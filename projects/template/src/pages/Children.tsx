import { useEffect, useState } from 'react';
import { Search, Plus, Gift, MapPin, Calendar, Star, X } from 'lucide-react';
import { api, Child } from '@/services/api';
import DataTable from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import PageTransition from '@/components/PageTransition';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Children = () => {
  const [children, setChildren] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'nice' | 'naughty'>('all');
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    country: '',
    status: 'nice' as 'nice' | 'naughty',
    niceScore: '75',
    wishlist: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchChildren = async () => {
      setIsLoading(true);
      const data = searchQuery 
        ? await api.searchChildren(searchQuery)
        : await api.getChildren();
      setChildren(data);
      setIsLoading(false);
    };
    
    const debounce = setTimeout(fetchChildren, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const filteredChildren = filter === 'all' 
    ? children 
    : children.filter(c => c.status === filter);

  const niceCount = children.filter(c => c.status === 'nice').length;
  const naughtyCount = children.filter(c => c.status === 'naughty').length;

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim() || formData.name.length > 100) {
      errors.name = 'Name is required (max 100 characters)';
    }
    const age = parseInt(formData.age);
    if (isNaN(age) || age < 1 || age > 18) {
      errors.age = 'Age must be between 1 and 18';
    }
    if (!formData.country.trim() || formData.country.length > 100) {
      errors.country = 'Country is required (max 100 characters)';
    }
    const score = parseInt(formData.niceScore);
    if (isNaN(score) || score < 0 || score > 100) {
      errors.niceScore = 'Score must be between 0 and 100';
    }
    if (!formData.wishlist.trim()) {
      errors.wishlist = 'At least one wishlist item is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddChild = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      const wishlistItems = formData.wishlist.split(',').map(item => item.trim()).filter(Boolean);
      const newChild: Omit<Child, 'id'> = {
        name: formData.name.trim(),
        age: parseInt(formData.age),
        country: formData.country.trim(),
        status: formData.status,
        niceScore: parseInt(formData.niceScore),
        wishlist: wishlistItems,
      };
      
      const result = await api.addChild(newChild);
      setChildren(prev => [...prev, result.child]);
      
      toast({
        title: "🎅 Child Added!",
        description: result.gifts.length > 0 
          ? `${result.child.name} added with ${result.gifts.length} gift(s) in production!`
          : `${result.child.name} has been added to the list.`,
      });
      
      setIsAddModalOpen(false);
      setFormData({ name: '', age: '', country: '', status: 'nice', niceScore: '75', wishlist: '' });
      setFormErrors({});
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add child. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mobile card view
  const MobileChildCard = ({ child, index }: { child: Child; index: number }) => (
    <div 
      className="rounded-xl bg-card border border-border p-4 animate-fade-in hover-lift cursor-pointer"
      style={{ animationDelay: `${index * 30}ms` }}
      onClick={() => setSelectedChild(child)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
            {child.name.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-foreground text-sm">{child.name}</p>
            <p className="text-xs text-muted-foreground">{child.country} • Age {child.age}</p>
          </div>
        </div>
        <span className={cn(
          "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
          child.status === 'nice' 
            ? 'bg-nice/10 text-nice' 
            : 'bg-naughty/10 text-naughty'
        )}>
          {child.status === 'nice' ? 'Nice' : 'Naughty'}
        </span>
      </div>
      
      {/* Score Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-muted-foreground">Nice Score</span>
          <span className="font-medium">{child.niceScore}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-500"
            style={{ 
              width: `${child.niceScore}%`,
              backgroundColor: child.niceScore >= 70 ? 'hsl(var(--nice))' : 'hsl(var(--naughty))'
            }}
          />
        </div>
      </div>
      
      {/* Wishlist */}
      <div className="flex flex-wrap gap-1">
        {child.wishlist.slice(0, 3).map((item, i) => (
          <span 
            key={i}
            className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground"
          >
            {item}
          </span>
        ))}
        {child.wishlist.length > 3 && (
          <span className="text-xs text-muted-foreground px-2 py-1">+{child.wishlist.length - 3}</span>
        )}
      </div>
    </div>
  );

  const columns = [
    {
      header: 'Name',
      accessor: (row: Child) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
            {row.name.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-foreground text-sm">{row.name}</p>
            <p className="text-xs text-muted-foreground">{row.country}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Age',
      accessor: 'age' as keyof Child,
      className: 'text-center text-sm',
    },
    {
      header: 'Status',
      accessor: (row: Child) => (
        <span className={cn(
          "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
          row.status === 'nice' 
            ? 'bg-nice/10 text-nice' 
            : 'bg-naughty/10 text-naughty'
        )}>
          {row.status === 'nice' ? 'Nice' : 'Naughty'}
        </span>
      ),
    },
    {
      header: 'Score',
      accessor: (row: Child) => (
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ 
                width: `${row.niceScore}%`,
                backgroundColor: row.niceScore >= 70 ? 'hsl(var(--nice))' : 'hsl(var(--naughty))'
              }}
            />
          </div>
          <span className="text-xs font-medium text-muted-foreground w-8">{row.niceScore}%</span>
        </div>
      ),
    },
    {
      header: 'Wishlist',
      accessor: (row: Child) => (
        <div className="flex gap-1">
          {row.wishlist.slice(0, 2).map((item, i) => (
            <span 
              key={i}
              className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground"
            >
              {item}
            </span>
          ))}
          {row.wishlist.length > 2 && (
            <span className="text-xs text-muted-foreground">+{row.wishlist.length - 2}</span>
          )}
        </div>
      ),
    },
    {
      header: '',
      accessor: (row: Child) => (
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs text-primary h-7 press-effect"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedChild(row);
          }}
        >
          View
        </Button>
      ),
      className: 'text-right',
    },
  ];

  return (
    <PageTransition>
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg md:text-xl font-semibold text-foreground">Children</h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              {children.length} children on the list
            </p>
          </div>
          <Button 
            size="sm" 
            className="bg-primary hover:bg-primary/90 text-primary-foreground press-effect w-full sm:w-auto"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add Child
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg bg-muted py-2 pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-background transition-all duration-200"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { key: 'all', label: 'All', count: children.length },
              { key: 'nice', label: 'Nice', count: niceCount },
              { key: 'naughty', label: 'Naughty', count: naughtyCount },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setFilter(item.key as typeof filter)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 whitespace-nowrap press-effect",
                  filter === item.key 
                    ? "bg-foreground text-background" 
                    : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label} ({item.count})
              </button>
            ))}
          </div>
        </div>

        {/* Stats - More compact on mobile */}
        <div className="grid grid-cols-3 gap-2 md:gap-3">
          <div className="rounded-lg bg-card border border-border p-3 md:p-4 text-center hover-lift">
            <p className="text-xl md:text-2xl font-semibold text-foreground">{children.length}</p>
            <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">Total</p>
          </div>
          <div className="rounded-lg bg-nice/5 border border-nice/10 p-3 md:p-4 text-center hover-lift">
            <p className="text-xl md:text-2xl font-semibold text-nice">{niceCount}</p>
            <p className="text-[10px] md:text-xs text-nice/80 mt-0.5">Nice</p>
          </div>
          <div className="rounded-lg bg-naughty/5 border border-naughty/10 p-3 md:p-4 text-center hover-lift">
            <p className="text-xl md:text-2xl font-semibold text-naughty">{naughtyCount}</p>
            <p className="text-[10px] md:text-xs text-naughty/80 mt-0.5">Naughty</p>
          </div>
        </div>

        {/* Mobile: Card View */}
        <div className="md:hidden space-y-3">
          {isLoading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="skeleton h-32 rounded-xl" />
            ))
          ) : (
            filteredChildren.map((child, index) => (
              <MobileChildCard key={child.id} child={child} index={index} />
            ))
          )}
        </div>

        {/* Desktop: Table */}
        <div className="hidden md:block">
          <DataTable 
            columns={columns} 
            data={filteredChildren} 
            isLoading={isLoading}
          />
        </div>

        {/* Child Detail Modal */}
        <Dialog open={!!selectedChild} onOpenChange={() => setSelectedChild(null)}>
          <DialogContent className="sm:max-w-md bg-card border-border">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-semibold text-primary">
                  {selectedChild?.name.charAt(0)}
                </div>
                <div>
                  <span className="text-foreground">{selectedChild?.name}</span>
                  <p className="text-sm font-normal text-muted-foreground mt-0.5">
                    {selectedChild?.status === 'nice' ? '🌟 Nice List' : '⚠️ Naughty List'}
                  </p>
                </div>
              </DialogTitle>
            </DialogHeader>
            
            {selectedChild && (
              <div className="space-y-4 mt-2">
                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-muted/50 p-3">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <MapPin className="h-3.5 w-3.5" />
                      <span className="text-xs">Country</span>
                    </div>
                    <p className="text-sm font-medium text-foreground">{selectedChild.country}</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span className="text-xs">Age</span>
                    </div>
                    <p className="text-sm font-medium text-foreground">{selectedChild.age} years old</p>
                  </div>
                </div>

                {/* Nice Score */}
                <div className="rounded-lg bg-muted/50 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Star className="h-3.5 w-3.5" />
                      <span className="text-xs">Nice Score</span>
                    </div>
                    <span className={cn(
                      "text-sm font-semibold",
                      selectedChild.niceScore >= 70 ? "text-nice" : "text-naughty"
                    )}>
                      {selectedChild.niceScore}%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-background overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-700"
                      style={{ 
                        width: `${selectedChild.niceScore}%`,
                        backgroundColor: selectedChild.niceScore >= 70 ? 'hsl(var(--nice))' : 'hsl(var(--naughty))'
                      }}
                    />
                  </div>
                </div>

                {/* Wishlist */}
                <div className="rounded-lg bg-muted/50 p-3">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Gift className="h-3.5 w-3.5" />
                    <span className="text-xs">Wishlist ({selectedChild.wishlist.length} items)</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedChild.wishlist.map((item, i) => (
                      <span 
                        key={i}
                        className="text-xs bg-background px-2.5 py-1 rounded-full text-foreground border border-border"
                      >
                        🎁 {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Status Badge */}
                <div className={cn(
                  "rounded-lg p-3 text-center",
                  selectedChild.status === 'nice' 
                    ? "bg-nice/10 border border-nice/20" 
                    : "bg-naughty/10 border border-naughty/20"
                )}>
                  <p className={cn(
                    "text-sm font-medium",
                    selectedChild.status === 'nice' ? "text-nice" : "text-naughty"
                  )}>
                    {selectedChild.status === 'nice' 
                      ? "✨ This child has been very good this year!" 
                      : "📝 This child needs to improve their behavior"}
                  </p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Add Child Modal */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="sm:max-w-md bg-card border-border">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-foreground">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Plus className="h-5 w-5 text-primary" />
                </div>
                Add New Child
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 mt-2">
              {/* Name */}
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs text-muted-foreground">Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter child's name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-muted border-border"
                  maxLength={100}
                />
                {formErrors.name && <p className="text-xs text-naughty">{formErrors.name}</p>}
              </div>

              {/* Age & Country */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="age" className="text-xs text-muted-foreground">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="Age"
                    min={1}
                    max={18}
                    value={formData.age}
                    onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                    className="bg-muted border-border"
                  />
                  {formErrors.age && <p className="text-xs text-naughty">{formErrors.age}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="country" className="text-xs text-muted-foreground">Country *</Label>
                  <Input
                    id="country"
                    placeholder="Country"
                    value={formData.country}
                    onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                    className="bg-muted border-border"
                    maxLength={100}
                  />
                  {formErrors.country && <p className="text-xs text-naughty">{formErrors.country}</p>}
                </div>
              </div>

              {/* Status & Nice Score */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Status *</Label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, status: 'nice' }))}
                      className={cn(
                        "flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all press-effect",
                        formData.status === 'nice' 
                          ? "bg-nice/20 text-nice border border-nice/30" 
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Nice ✨
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, status: 'naughty' }))}
                      className={cn(
                        "flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all press-effect",
                        formData.status === 'naughty' 
                          ? "bg-naughty/20 text-naughty border border-naughty/30" 
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Naughty ⚠️
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="niceScore" className="text-xs text-muted-foreground">Nice Score (0-100) *</Label>
                  <Input
                    id="niceScore"
                    type="number"
                    min={0}
                    max={100}
                    value={formData.niceScore}
                    onChange={(e) => setFormData(prev => ({ ...prev, niceScore: e.target.value }))}
                    className="bg-muted border-border"
                  />
                  {formErrors.niceScore && <p className="text-xs text-naughty">{formErrors.niceScore}</p>}
                </div>
              </div>

              {/* Wishlist */}
              <div className="space-y-1.5">
                <Label htmlFor="wishlist" className="text-xs text-muted-foreground">Wishlist * (comma separated)</Label>
                <Input
                  id="wishlist"
                  placeholder="Teddy Bear, Lego Set, Books"
                  value={formData.wishlist}
                  onChange={(e) => setFormData(prev => ({ ...prev, wishlist: e.target.value }))}
                  className="bg-muted border-border"
                />
                {formErrors.wishlist && <p className="text-xs text-naughty">{formErrors.wishlist}</p>}
                {formData.status === 'nice' && formData.wishlist && (
                  <p className="text-[10px] text-muted-foreground">
                    🎁 {formData.wishlist.split(',').filter(i => i.trim()).length} gift(s) will be added to production
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground press-effect"
                onClick={handleAddChild}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Adding...' : '🎅 Add to Santa\'s List'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
};

export default Children;
