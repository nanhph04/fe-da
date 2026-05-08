// @ts-nocheck
import { useState, forwardRef, ReactNode } from "react";
import { cn } from "@/design-system/tokens";
import { variants } from "@/design-system/tokens";
import { Button } from "../buttons";

export interface TableColumn<T> {
  key: keyof T;
  title: string;
  sortable?: boolean;
  render?: (value: T[keyof T], record: T) => ReactNode;
  width?: string;
  align?: "left" | "center" | "right";
  className?: string;
}

export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  className?: string;
  variant?: "default" | "striped" | "bordered";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  emptyMessage?: string;
  rowClassName?: (record: T, index: number) => string;
  onRowClick?: (record: T) => void;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  sortField?: keyof T;
  sortOrder?: "asc" | "desc";
  onSort?: (field: keyof T, order: "asc" | "desc") => void;
  rowKey?: keyof T;
  selectedRows?: T[keyof T][];
  onRowSelect?: (selected: T[keyof T][], record: T) => void;
  headerActions?: ReactNode;
}

const Table = forwardRef<HTMLDivElement, TableProps<any>>(
  ({
    data,
    columns,
    className,
    variant = "default",
    size = "md",
    loading = false,
    emptyMessage = "No data available",
    rowClassName,
    onRowClick,
    pagination,
    sortField,
    sortOrder,
    onSort,
    rowKey = "id",
    selectedRows = [],
    onRowSelect,
    headerActions,
    ...props
  }, ref) => {
    const [hoveredRow, setHoveredRow] = useState<number | null>(null);

    const handleSort = (field: string) => {
      if (!onSort || !columns.find(col => col.key === field)?.sortable) return;

      let newOrder: "asc" | "desc" = "asc";
      if (sortField === field && sortOrder === "asc") {
        newOrder = "desc";
      }
      onSort(field as any, newOrder);
    };

    const handleRowSelect = (record: any) => {
      const isSelected = selectedRows.includes(record[rowKey]);
      const newSelection = isSelected
        ? selectedRows.filter(id => id !== record[rowKey])
        : [...selectedRows, record[rowKey]];
      onRowSelect?.(newSelection, record);
    };

    const sortedData = [...data];
    if (sortField && sortOrder) {
      sortedData.sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];

        if (aValue === bValue) return 0;
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        if (sortOrder === "asc") {
          return aValue < bValue ? -1 : 1;
        } else {
          return aValue > bValue ? -1 : 1;
        }
      });
    }

    const getSizeClasses = () => {
      switch (size) {
        case "sm":
          return "text-xs";
        case "lg":
          return "text-lg";
        default:
          return "text-sm";
      }
    };

    const getCellPadding = () => {
      switch (size) {
        case "sm":
          return "p-2";
        case "lg":
          return "p-4";
        default:
          return "p-3";
      }
    };

    return (
      <div ref={ref} className={cn("w-full", className)} {...props}>
        {/* Table header with actions */}
        {headerActions && (
          <div className="mb-4 flex items-center justify-between">
            {headerActions}
          </div>
        )}

        {/* Table container */}
        <div className="overflow-x-auto">
          <table
            className={cn(
              variants.table[variant],
              "w-full",
              "border-collapse",
              "relative",
              getSizeClasses()
            )}
          >
            {/* Header */}
            <thead>
              <tr className={cn(
                "border-b",
                "bg-gray-50",
                "text-left",
                "font-semibold",
                "text-gray-700"
              )}>
                {onRowSelect && (
                  <th className={cn(
                    "p-2",
                    "w-10",
                    "border-r",
                    "border-gray-200"
                  )}>
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={selectedRows.length === data.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          onRowSelect(data.map(item => item[rowKey]), data[0]);
                        } else {
                          onRowSelect([], data[0]);
                        }
                      }}
                    />
                  </th>
                )}
                {columns.map((column, index) => (
                  <th
                    key={column.key as string}
                    className={cn(
                      getCellPadding(),
                      "whitespace-nowrap",
                      "relative",
                      column.sortable && "cursor-pointer hover:bg-gray-100",
                      column.align === "center" && "text-center",
                      column.align === "right" && "text-right",
                      column.className,
                      index === 0 && "sticky left-0 z-10",
                      "border-r",
                      "border-gray-200"
                    )}
                    style={{ width: column.width }}
                    onClick={() => column.sortable && handleSort(column.key as string)}
                  >
                    <div className="flex items-center space-x-1">
                      {column.title}
                      {column.sortable && (
                        <svg
                          className={cn(
                            "h-4 w-4",
                            sortField === column.key
                              ? sortOrder === "asc"
                                ? "transform rotate-180"
                                : ""
                              : "opacity-50"
                          )}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={columns.length + (onRowSelect ? 1 : 0)}
                    className={cn(
                      "p-8",
                      "text-center",
                      "text-gray-500"
                    )}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <svg
                        className="animate-spin h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>Loading data...</span>
                    </div>
                  </td>
                </tr>
              ) : sortedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (onRowSelect ? 1 : 0)}
                    className={cn(
                      "p-8",
                      "text-center",
                      "text-gray-500"
                    )}
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                sortedData.map((record, index) => (
                  <tr
                    key={rowKey ? record[rowKey] : index}
                    className={cn(
                      "border-b",
                      "border-gray-200",
                      "hover:bg-gray-50",
                      onRowClick && "cursor-pointer transition-colors",
                      selectedRows.includes(record[rowKey])
                        ? "bg-blue-50"
                        : "",
                      rowClassName?.(record, index),
                      hoveredRow === index && "bg-gray-100"
                    )}
                    onMouseEnter={() => setHoveredRow(index)}
                    onMouseLeave={() => setHoveredRow(null)}
                    onClick={() => {
                      if (onRowSelect) {
                        handleRowSelect(record);
                      } else if (onRowClick) {
                        onRowClick(record);
                      }
                    }}
                  >
                    {onRowSelect && (
                      <td className={cn(
                        "p-2",
                        "border-r",
                        "border-gray-200",
                        "w-10"
                      )}>
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          checked={selectedRows.includes(record[rowKey])}
                          onClick={(e) => e.stopPropagation()}
                          onChange={() => handleRowSelect(record)}
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td
                        key={column.key as string}
                        className={cn(
                          getCellPadding(),
                          "border-r",
                          "border-gray-200",
                          column.align === "center" && "text-center",
                          column.align === "right" && "text-right",
                          column.className
                        )}
                        style={{ width: column.width }}
                      >
                        {column.render
                          ? column.render(record[column.key], record)
                          : record[column.key]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {(pagination.current - 1) * pagination.pageSize + 1} to{" "}
              {Math.min(pagination.current * pagination.pageSize, pagination.total)}{" "}
              of {pagination.total} results
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onChange(Math.max(1, pagination.current - 1), pagination.pageSize)}
                disabled={pagination.current === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-700">
                Page {pagination.current} of {Math.ceil(pagination.total / pagination.pageSize)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onChange(Math.min(Math.ceil(pagination.total / pagination.pageSize), pagination.current + 1), pagination.pageSize)}
                disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }
);

Table.displayName = "Table";

// Table wrapper with title and actions
export interface TableWrapperProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

const TableWrapper = forwardRef<HTMLDivElement, TableWrapperProps>(
  ({ title, description, children, className }, ref) => (
    <div ref={ref} className={cn("space-y-4", className)}>
      {(title || description) && (
        <div className="space-y-2">
          {title && (
            <h3 className="text-lg font-semibold leading-6">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-gray-500">
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  )
);

TableWrapper.displayName = "TableWrapper";

// Enhanced table with actions
export const DataTable = forwardRef<
  HTMLDivElement,
  Omit<TableProps<any>, 'headerActions'> & {
    actions?: ReactNode;
    bulkActions?: ReactNode;
    selectionInfo?: string;
  }
>(({ actions, bulkActions, selectionInfo, ...props }, ref) => (
  <Table
    ref={ref}
    headerActions={
      <div className="flex items-center space-x-3">
        {actions}
        {bulkActions && selectedRows.length > 0 && bulkActions}
        {selectionInfo && selectedRows.length > 0 && (
          <span className="text-sm text-gray-500">
            {selectionInfo}
          </span>
        )}
      </div>
    }
    {...props}
  />
));

DataTable.displayName = "DataTable";

export { Table, TableWrapper, DataTable };
