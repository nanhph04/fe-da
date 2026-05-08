// @ts-nocheck
import { useState, forwardRef, ReactNode } from "react";
import { cn } from "@/design-system/tokens";
import { Button } from "../buttons";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  helper?: string;
  required?: boolean;
  disabled?: boolean;
  loading?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  multiple?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  optionClassName?: (option: SelectOption) => string;
  containerClassName?: string;
  renderOption?: (option: SelectOption) => ReactNode;
  renderValue?: (value: string | string[]) => ReactNode;
}

const Select = forwardRef<HTMLDivElement, SelectProps>(
  ({
    options,
    value,
    onValueChange,
    placeholder = "Select an option",
    label,
    error,
    helper,
    required,
    disabled,
    loading,
    searchable,
    clearable = true,
    multiple = false,
    size = "md",
    className,
    optionClassName,
    containerClassName,
    renderOption,
    renderValue,
    ...props
  }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedOptions, setSelectedOptions] = useState<SelectOption[]>([]);
    const [searchInput, setSearchInput] = useState("");

    const handleValueChange = (newValue: string) => {
      if (multiple) {
        const newSelected = selectedOptions.some(opt => opt.value === newValue)
          ? selectedOptions.filter(opt => opt.value !== newValue)
          : [...selectedOptions, options.find(opt => opt.value === newValue)!];
        setSelectedOptions(newSelected);
        onValueChange(newSelected.map(opt => opt.value).join(","));
      } else {
        setSelectedOptions([]);
        onValueChange(newValue);
      }
      setSearchQuery("");
      setSearchInput("");
      setIsOpen(false);
    };

    const handleClear = () => {
      setSelectedOptions([]);
      onValueChange("");
      setSearchQuery("");
      setSearchInput("");
    };

    const filteredOptions = options.filter(option => {
      if (!searchQuery) return true;
      return option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
             option.value.toLowerCase().includes(searchQuery.toLowerCase());
    });

    // Group options
    const groupedOptions = filteredOptions.reduce((acc, option) => {
      if (option.group && !acc[option.group]) {
        acc[option.group] = [];
      }
      if (option.group) {
        acc[option.group].push(option);
      } else {
        if (!acc["ungrouped"]) acc["ungrouped"] = [];
        acc["ungrouped"].push(option);
      }
      return acc;
    }, {} as Record<string, SelectOption[]>);

    const selectedValue = multiple
      ? selectedOptions.map(opt => opt.value).join(",")
      : value;

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    return (
      <div
        ref={ref}
        className={cn("relative w-full", containerClassName)}
        {...props}
      >
        {label && (
          <label
            className={cn(
              "text-sm font-medium flex items-center gap-1.5 mb-2 block",
              error ? "text-red-600" : "text-gray-700"
            )}
          >
            {label}
            {required && <span className="text-red-500">*</span>}
          </label>
        )}

        {/* Select button */}
        <div className="relative">
          {/* Search input if enabled */}
          {searchable && isOpen && (
            <div className="mb-2">
              <input
                type="text"
                className={cn(
                  "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                  "disabled:cursor-not-allowed disabled:opacity-50"
                )}
                placeholder="Search..."
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setSearchQuery(e.target.value);
                }}
                onKeyDown={handleKeyDown}
                disabled={disabled}
              />
            </div>
          )}

          <Button
            variant="outline"
            className={cn(
              "w-full flex items-center justify-between",
              "text-left",
              "border-gray-300",
              "hover:border-gray-400",
              "focus:border-blue-500",
              "focus:ring-2",
              "focus:ring-blue-500",
              "disabled:cursor-not-allowed",
              "disabled:opacity-50",
              "transition-colors",
              error && "border-red-300 focus:border-red-500 focus:ring-red-500",
              size === "sm" && "h-8 text-xs px-2",
              size === "md" && "h-10 text-sm px-3",
              size === "lg" && "h-12 text-lg px-4",
              className
            )}
            onClick={() => setIsOpen(!isOpen)}
            disabled={disabled || loading}
          >
            <div className="flex items-center gap-2 flex-1">
              {selectedValue ? (
                renderValue ? (
                  renderValue(multiple ? selectedValue.split(",") : selectedValue)
                ) : (
                  <span>
                    {multiple
                      ? selectedOptions.map(opt => opt.label).join(", ")
                      : options.find(opt => opt.value === selectedValue)?.label
                      || placeholder}
                  </span>
                )
              ) : (
                <span className="text-gray-500">{placeholder}</span>
              )}
              {(selectedValue && clearable) && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                  }}
                  className="ml-2 p-1 rounded hover:bg-gray-100"
                >
                  <svg
                    className="h-4 w-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
            <svg
              className={cn(
                "h-4 w-4 text-gray-400",
                "ml-2",
                "transform transition-transform",
                isOpen ? "rotate-180" : ""
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </Button>

          {/* Options dropdown */}
          {isOpen && (
            <div className={cn(
              "absolute z-50",
              "top-full left-0 right-0",
              "mt-1",
              "bg-white",
              "border",
              "border-gray-200",
              "rounded-md",
              "shadow-lg",
              "max-h-60",
              "overflow-y-auto",
              "animate-in fade-in duration-200",
              "fade-in slide-down"
            )}>
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-2 text-sm text-gray-500">
                  No options found
                </div>
              ) : (
                Object.entries(groupedOptions).map(([group, groupOptions]) => (
                  <div key={group}>
                    {group !== "ungrouped" && (
                      <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50">
                        {group}
                      </div>
                    )}
                    {groupOptions.map((option) => (
                      <button
                        key={option.value}
                        className={cn(
                          "w-full px-3 py-2 text-left",
                          "text-sm",
                          "hover:bg-gray-50",
                          "transition-colors",
                          "flex items-center gap-2",
                          option.disabled && "opacity-50 cursor-not-allowed",
                          optionClassName?.(option),
                          selectedValue === option.value && "bg-blue-50 text-blue-600 font-medium"
                        )}
                        onClick={() => !option.disabled && handleValueChange(option.value)}
                        disabled={option.disabled}
                      >
                        <input
                          type="checkbox"
                          checked={multiple ? selectedOptions.some(opt => opt.value === option.value) : selectedValue === option.value}
                          onChange={() => !option.disabled && handleValueChange(option.value)}
                          className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          disabled={option.disabled}
                        />
                        {renderOption ? renderOption(option) : option.label}
                      </button>
                    ))}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Helper text */}
        {helper && !error && (
          <p className="text-sm text-gray-500 mt-1">
            {helper}
          </p>
        )}

        {/* Error message */}
        {error && (
          <p className="text-sm text-red-600 mt-1">
            {error}
          </p>
        )}

        {/* Loading indicator */}
        {loading && (
          <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
            <svg
              className="animate-spin h-4 w-4 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
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
          </div>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

// MultiSelect component
export const MultiSelect = forwardRef<
  HTMLDivElement,
  Omit<SelectProps, "multiple" | "value" | "onValueChange"> & {
    values: string[];
    onValuesChange: (values: string[]) => void;
  }
>(({ values, onValuesChange, ...props }, ref) => (
  <Select
    ref={ref}
    multiple={true}
    value={values.join(",")}
    onValueChange={(value) => onValuesChange(value.split(","))}
    {...props}
  />
));

MultiSelect.displayName = "MultiSelect";

// GroupedSelect component
export const GroupedSelect = forwardRef<
  HTMLDivElement,
  SelectProps & {
    groupBy?: (option: SelectOption) => string;
  }
>(({ groupBy, ...props }, ref) => (
  <Select
    ref={ref}
    {...props}
    options={props.options}
  />
));

GroupedSelect.displayName = "GroupedSelect";

// AsyncSelect component
export const AsyncSelect = forwardRef<
  HTMLDivElement,
  Omit<SelectProps, "options"> & {
    loadOptions: (query: string) => Promise<SelectOption[]>;
    defaultOptions?: SelectOption[];
    debounceMs?: number;
  }
>(({ loadOptions, defaultOptions = [], debounceMs = 300, ...props }, ref) => {
  const [options, setOptions] = useState<SelectOption[]>(defaultOptions);
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  const handleSearch = async (query: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const newOptions = await loadOptions(query);
        setOptions(newOptions);
      } catch (error) {
        console.error("Failed to load options:", error);
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);

    if (!query) {
      setOptions(defaultOptions);
    }
  };

  return (
    <Select
      ref={ref}
      options={options}
      loading={isLoading}
      searchable={true}
      onSearch={handleSearch}
      {...props}
    />
  );
});

AsyncSelect.displayName = "AsyncSelect";

export { Select, MultiSelect, GroupedSelect, AsyncSelect };
