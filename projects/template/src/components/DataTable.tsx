import { cn } from '@/lib/utils';

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
}

function DataTable<T extends { id: string }>({ 
  columns, 
  data, 
  onRowClick,
  isLoading 
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="rounded-2xl bg-card border border-border overflow-hidden">
        <div className="p-6 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-card border border-border overflow-hidden animate-fade-in">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={cn(
                    "px-6 py-4 text-left text-sm font-semibold text-foreground",
                    column.className
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  "border-b border-border last:border-0 transition-colors",
                  onRowClick && "cursor-pointer hover:bg-muted/50"
                )}
                style={{ animationDelay: `${rowIndex * 50}ms` }}
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className={cn(
                      "px-6 py-4 text-sm text-foreground",
                      column.className
                    )}
                  >
                    {typeof column.accessor === 'function'
                      ? column.accessor(row)
                      : (row[column.accessor] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;
