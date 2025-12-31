interface ProgressChartProps {
  data: { label: string; value: number; color: string }[];
  title: string;
}

const ProgressChart = ({ data, title }: ProgressChartProps) => {
  const total = data.reduce((acc, item) => acc + item.value, 0);

  return (
    <div className="rounded-2xl bg-card border border-border p-6 card-hover animate-fade-in">
      <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
      
      {/* Bar Chart */}
      <div className="flex h-8 w-full overflow-hidden rounded-full bg-muted mb-4">
        {data.map((item, index) => (
          <div
            key={item.label}
            className="h-full transition-all duration-1000 progress-animate"
            style={{
              width: total > 0 ? `${(item.value / total) * 100}%` : '0%',
              backgroundColor: item.color,
              animationDelay: `${index * 200}ms`,
            }}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-3">
        {data.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm text-muted-foreground">
              {item.label}: <span className="font-semibold text-foreground">{item.value}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressChart;
