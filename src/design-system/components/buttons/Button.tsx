// @ts-nocheck
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/design-system/tokens";
import { variants } from "@/design-system/tokens";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: variants.button.primary,
        secondary: variants.button.secondary,
        ghost: variants.button.ghost,
        destructive: variants.button.destructive,
        outline: variants.button.outline,
        link: variants.button.link,
      },
      size: {
        xs: "h-7 px-2 text-xs",
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-base",
        lg: "h-12 px-6 text-lg",
        xl: "h-14 px-8 text-xl",
        icon: "h-10 w-10 p-0",
      },
      intent: {
        primary: variants.intent.primary,
        secondary: variants.intent.secondary,
        success: variants.intent.success,
        warning: variants.intent.warning,
        danger: variants.intent.danger,
        info: variants.intent.info,
      },
      loading: {
        true: "relative pointer-events-none opacity-70",
        false: "",
      },
      fullWidth: {
        true: "w-full justify-center",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      loading: false,
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  loadingText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  accessibleLabel?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant,
    size,
    intent,
    loading,
    loadingText,
    leftIcon,
    rightIcon,
    accessibleLabel,
    children,
    disabled,
    ...props
  }, ref) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        className={cn(
          buttonVariants({ variant, size, intent, loading, fullWidth: props.fullWidth }),
          className,
          // Accessibility classes
          "focus:ring-offset-2 focus:ring-2 focus:outline-none",
          // Animation classes
          "transition-all duration-200 ease-in-out",
          // Disabled state
          isDisabled ? "pointer-events-none opacity-50" : "",
          // Hover effects
          !isDisabled && "hover:scale-[1.02] active:scale-[0.98]"
        )}
        disabled={isDisabled}
        aria-label={accessibleLabel}
        aria-busy={loading}
        {...props}
      >
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <svg
              className="animate-spin h-4 w-4 text-current"
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
          </span>
        )}
        {!loading && leftIcon && (
          <span className="flex-shrink-0">{leftIcon}</span>
        )}
        {loading ? loadingText || "Loading..." : children}
        {!loading && rightIcon && (
          <span className="flex-shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };

// Specialized button variants
export const IconButton = forwardRef<
  HTMLButtonElement,
  Omit<ButtonProps, 'loadingText' | 'children'> & {
    icon: ReactNode;
    "aria-label": string;
  }
>(({ icon, ...props }, ref) => (
  <Button
    ref={ref}
    {...props}
    leftIcon={icon}
    size="icon"
    accessibleLabel={props.accessibleLabel}
  />
));

IconButton.displayName = "IconButton";

export const TextButton = forwardRef<
  HTMLButtonElement,
  Omit<ButtonProps, 'loadingText' | 'leftIcon' | 'rightIcon'> & {
    as?: "button" | "a";
    href?: string;
  }
>(({ as: _as = "button", href: _href, ...props }, ref) => {
  return <Button ref={ref} {...props} />;
});

TextButton.displayName = "TextButton";

// Group component for button groups
export const ButtonGroup = ({ className, children, ...props }: { className?: string; children: React.ReactNode }) => (
  <div className={cn("flex items-center space-x-1", className)} {...props}>
    {children}
  </div>
);
