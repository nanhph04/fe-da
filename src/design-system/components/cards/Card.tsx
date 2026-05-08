// @ts-nocheck
import { forwardRef, ReactNode } from "react";
import { cn } from "@/design-system/tokens";
import { variants } from "@/design-system/tokens";

export interface CardProps {
  className?: string;
  variant?: "default" | "elevated" | "outlined" | "ghost";
  children: ReactNode;
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
  clickable?: boolean;
  onClick?: () => void;
  bordered?: boolean;
  shadow?: "none" | "sm" | "md" | "lg" | "xl";
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({
    className,
    variant = "default",
    children,
    padding = "md",
    hover = false,
    clickable = false,
    onClick,
    bordered = false,
    shadow = "sm",
  }, ref) => {
    const handleClick = () => {
      if (clickable && onClick) {
        onClick();
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          variants.card[variant],
          // Shadow variants
          shadow === "none" && "shadow-none",
          shadow === "sm" && "shadow-sm",
          shadow === "md" && "shadow-md",
          shadow === "lg" && "shadow-lg",
          shadow === "xl" && "shadow-xl",
          // Border variants
          bordered && "border-2",
          // Hover effects
          hover && "hover:shadow-lg hover:-translate-y-1 transition-all duration-300",
          // Clickable states
          clickable && "cursor-pointer",
          // Padding variants
          padding === "none" && "",
          padding === "sm" && "p-3",
          padding === "md" && "p-6",
          padding === "lg" && "p-8",
          // Base classes
          "rounded-lg",
          "bg-white",
          "text-gray-900",
          "overflow-hidden",
          "relative",
          className
        )}
        onClick={clickable ? handleClick : undefined}
        tabIndex={clickable ? 0 : undefined}
        role={clickable ? "button" : undefined}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

// Card Header
export interface CardHeaderProps {
  className?: string;
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
}

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, title, description, actions, children }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex flex-col space-y-1.5",
        title || description ? "pb-6" : "",
        actions ? "flex-row items-center justify-between" : "",
        className
      )}
    >
      {title && (
        <h3 className="text-lg font-semibold leading-none tracking-tight">
          {title}
        </h3>
      )}
      {description && (
        <p className="text-sm text-gray-500">
          {description}
        </p>
      )}
      {actions && (
        <div className="flex items-center space-x-2">
          {actions}
        </div>
      )}
      {children}
    </div>
  )
);

CardHeader.displayName = "CardHeader";

// Card Body
export interface CardBodyProps {
  className?: string;
  children: ReactNode;
}

const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(
  ({ className, children }, ref) => (
    <div ref={ref} className={cn("space-y-4", className)}>
      {children}
    </div>
  )
);

CardBody.displayName = "CardBody";

// Card Footer
export interface CardFooterProps {
  className?: string;
  actions?: ReactNode;
  children?: ReactNode;
  align?: "left" | "center" | "right";
}

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, actions, children, align = "right" }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center",
        align === "left" && "justify-start",
        align === "center" && "justify-center",
        align === "right" && "justify-end",
        actions ? "space-x-3" : "",
        "pt-6",
        className
      )}
    >
      {actions && <div className="flex items-center space-x-3">{actions}</div>}
      {children}
    </div>
  )
);

CardFooter.displayName = "CardFooter";

// Card Content for simple cards without header/footer
export interface CardContentProps {
  className?: string;
  children: ReactNode;
}

const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children }, ref) => (
    <div ref={ref} className={cn("", className)}>
      {children}
    </div>
  )
);

CardContent.displayName = "CardContent";

// Grid Card components for layouts
export interface GridCardProps {
  className?: string;
  cols?: number;
  gap?: number;
  children: ReactNode;
}

const GridCard = forwardRef<HTMLDivElement, GridCardProps>(
  ({ className, cols = 1, gap = 4, children }, ref) => (
    <div
      ref={ref}
      className={cn(
        "grid",
        cols === 1 && "grid-cols-1",
        cols === 2 && "grid-cols-2",
        cols === 3 && "grid-cols-3",
        cols === 4 && "grid-cols-4",
        cols === 5 && "grid-cols-5",
        cols === 6 && "grid-cols-6",
        gap === 1 && "gap-1",
        gap === 2 && "gap-2",
        gap === 3 && "gap-3",
        gap === 4 && "gap-4",
        gap === 6 && "gap-6",
        gap === 8 && "gap-8",
        className
      )}
    >
      {children}
    </div>
  )
);

GridCard.displayName = "GridCard";

// Specialized card types
export interface StatCardProps extends Omit<CardProps, 'children'> {
  title: ReactNode;
  value: ReactNode;
  description?: ReactNode;
  trend?: { value: number; isPositive: boolean; label?: string };
  icon?: ReactNode;
}

export const StatCard = forwardRef<HTMLDivElement, StatCardProps>(({ title, value, description, trend, icon, ...props }, ref) => (
  <Card ref={ref} {...props}>
    <CardHeader>
      {title && <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        {icon && <div className="p-2 bg-gray-100 rounded-lg">{icon}</div>}
      </div>}
      {description && <p className="text-sm text-gray-500">{description}</p>}
      {trend && (
        <div className={`flex items-center space-x-2 mt-2 ${
          trend.isPositive ? "text-green-600" : "text-red-600"
        }`}>
          <svg
            className={`h-4 w-4 ${
              trend.isPositive ? "transform rotate-180" : ""
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-sm">
            {trend.value}% {trend.label || "vs previous period"}
          </span>
        </div>
      )}
    </CardHeader>
  </Card>
));

StatCard.displayName = "StatCard";

export { Card, CardHeader, CardBody, CardFooter, CardContent, GridCard };
