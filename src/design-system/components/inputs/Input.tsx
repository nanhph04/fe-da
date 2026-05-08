// @ts-nocheck
import { forwardRef, InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/design-system/tokens";
import { variants } from "@/design-system/tokens";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helper?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  required?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "filled" | "outlined" | "error" | "success";
  fullWidth?: boolean;
  loading?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    type,
    label,
    error,
    helper,
    leftIcon,
    rightIcon,
    required,
    size = "md",
    variant = "default",
    disabled,
    loading,
    fullWidth = true,
    value,
    ...props
  }, ref) => {
    const hasError = error || variant === "error";
    const isValid = variant === "success" && !hasError;

    return (
      <div className={cn("w-full space-y-1.5", fullWidth && "w-full")}>
        {label && (
          <label
            className={cn(
              "text-sm font-medium flex items-center gap-1.5",
              hasError ? "text-red-600" : isValid ? "text-green-600" : "text-gray-700"
            )}
          >
            {label}
            {required && <span className="text-red-500">*</span>}
          </label>
        )}

        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
              {leftIcon}
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            type={type}
            className={cn(
              variants.input[hasError ? "error" : variant],
              "file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700",
              "placeholder:text-gray-400",
              "disabled:cursor-not-allowed disabled:opacity-50",
              // Focus state
              "focus:outline-none",
              // Size variants
              size === "sm" && "h-9 text-xs px-2 py-1",
              size === "md" && "h-10 text-sm px-3 py-1.5",
              size === "lg" && "h-12 text-lg px-4 py-2",
              // Icon spacing
              (leftIcon || rightIcon) && "pl-10 pr-10",
              leftIcon && !rightIcon && "pr-3",
              !leftIcon && rightIcon && "pl-3",
              loading && "opacity-70 cursor-not-allowed",
              fullWidth && "w-full",
              hasError && "border-red-300 focus:border-red-500 focus:ring-red-500",
              isValid && "border-green-300 focus:border-green-500 focus:ring-green-500",
              className
            )}
            disabled={disabled || loading}
            value={value}
            aria-invalid={hasError}
            aria-describedby={error ? `${props.id}-error` : undefined}
            {...props}
          />

          {/* Right Icon */}
          {rightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}

          {/* Loading indicator */}
          {loading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
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

        {/* Error message */}
        {error && (
          <p id={`${props.id}-error`} className="text-sm text-red-600 mt-1 flex items-center gap-1">
            <svg
              className="h-4 w-4"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}

        {/* Helper text */}
        {helper && !error && (
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
            <svg
              className="h-4 w-4"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            {helper}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

// Textarea component
export interface TextareaProps extends Omit<InputProps, 'type'> {
  rows?: number;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, rows = 4, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        variants.input.default,
        "resize-none",
        "focus:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "text-sm",
        "w-full",
        "p-3",
        "rounded-md",
        "border",
        "border-gray-300",
        "focus:border-blue-500",
        "focus:ring-1",
        "focus:ring-blue-500",
        className
      )}
      rows={rows}
      {...props}
    />
  )
);

Textarea.displayName = "Textarea";

// Select component
export interface SelectProps extends Omit<InputProps, 'type'> {
  options: { value: string; label: string; disabled?: boolean }[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        variants.input.default,
        "focus:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "text-sm",
        "w-full",
        "p-2.5",
        "rounded-md",
        "border",
        "border-gray-300",
        "focus:border-blue-500",
        "focus:ring-1",
        "focus:ring-blue-500",
        "appearance-none",
        "bg-white",
        "pr-10", // Space for chevron
        className
      )}
      {...props}
    >
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
          disabled={option.disabled}
        >
          {option.label}
        </option>
      ))}
    </select>
  )
);

Select.displayName = "Select";

// Group component for related inputs
export const InputGroup = ({ children, className, ...props }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("space-y-4", className)} {...props}>
    {children}
  </div>
);

// Input wrapper for better layout control
export const InputContainer = ({ children, className, ...props }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("relative", className)} {...props}>
    {children}
  </div>
);

export { Input, Textarea, Select, InputGroup, InputContainer };
