// @ts-nocheck
import { forwardRef, ReactNode } from "react";
import { cn } from "@/design-system/tokens";
import { variants } from "@/design-system/tokens";
import { Button } from "../buttons";

export interface ModalProps {
  open?: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  variant?: "default" | "dark";
  size?: "sm" | "md" | "lg" | "xl" | "full";
  closable?: boolean;
  showCloseButton?: boolean;
  overlayClassName?: string;
  className?: string;
  footer?: ReactNode;
  preventCloseOnOverlay?: boolean;
  preventCloseOnEscape?: boolean;
}

const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({
    open,
    onClose,
    title,
    description,
    children,
    variant = "default",
    size = "md",
    closable = true,
    showCloseButton = true,
    overlayClassName,
    className,
    footer,
    preventCloseOnOverlay = false,
    preventCloseOnEscape = false,
  }, ref) => {
    const handleOverlayClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget && !preventCloseOnOverlay && closable) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !preventCloseOnEscape && closable) {
        onClose();
      }
    };

    // Add/Remove event listener for escape key
    if (typeof window !== "undefined") {
      if (open) {
        document.addEventListener("keydown", handleKeyDown);
      } else {
        document.removeEventListener("keydown", handleKeyDown);
      }
    }

    if (!open) return null;

    return (
      <>
        {/* Backdrop */}
        <div
          className={cn(
            variants.modal.overlay,
            "fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300",
            overlayClassName
          )}
          onClick={handleOverlayClick}
        >
          {/* Modal container */}
          <div
            ref={ref}
            className={cn(
              "relative z-10 transform transition-all duration-300",
              "rounded-lg bg-white",
              variant === "dark" ? "bg-gray-900 text-white" : "text-gray-900",
              size === "sm" && "max-w-sm mx-4",
              size === "md" && "max-w-md mx-4",
              size === "lg" && "max-w-lg mx-4",
              size === "xl" && "max-w-2xl mx-4",
              size === "full" && "max-w-full mx-0 h-full max-h-full",
              "shadow-2xl",
              "animate-in fade-in",
              "scale-95 animate-in duration-300 ease-out",
              open ? "scale-100" : "scale-95 opacity-0",
              className
            )}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div
                className={cn(
                  "flex items-center justify-between p-6 border-b",
                  variant === "dark" ? "border-gray-700" : "border-gray-200"
                )}
              >
                <div className="flex-1">
                  {title && (
                    <h3 className="text-lg font-semibold leading-6">
                      {title}
                    </h3>
                  )}
                  {description && (
                    <p className="mt-1 text-sm text-gray-500">
                      {description}
                    </p>
                  )}
                </div>
                {showCloseButton && (
                  <button
                    type="button"
                    className={cn(
                      "text-gray-400 hover:text-gray-600 focus:outline-none",
                      variant === "dark" && "hover:text-gray-300",
                      "transition-colors",
                      "p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800",
                      "focus:ring-2 focus:ring-blue-500"
                    )}
                    onClick={onClose}
                    aria-label="Close modal"
                  >
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
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
            )}

            {/* Content */}
            <div
              className={cn(
                "p-6",
                size === "full" ? "h-full overflow-y-auto" : ""
              )}
            >
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div
                className={cn(
                  "flex items-center justify-end space-x-3 p-6 border-t",
                  variant === "dark" ? "border-gray-700" : "border-gray-200"
                )}
              >
                {footer}
              </div>
            )}
          </div>
        </div>
      </>
    );
  }
);

Modal.displayName = "Modal";

// Confirm Modal
export interface ConfirmModalProps extends Omit<ModalProps, 'children'> {
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  confirmButtonVariant?: "primary" | "destructive";
  isLoading?: boolean;
  confirmDisabled?: boolean;
}

const ConfirmModal = forwardRef<HTMLDivElement, ConfirmModalProps>(
  ({
    title = "Confirm Action",
    description = "Are you sure you want to proceed?",
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm,
    confirmButtonVariant = "primary",
    isLoading = false,
    confirmDisabled = false,
    ...props
  }, ref) => (
    <Modal
      ref={ref}
      title={title}
      description={description}
      {...props}
      footer={
        <>
          <Button variant="ghost" onClick={props.onClose}>
            {cancelText}
          </Button>
          <Button
            variant={confirmButtonVariant}
            onClick={onConfirm}
            loading={isLoading}
            disabled={confirmDisabled}
          >
            {confirmText}
          </Button>
        </>
      }
    />
  )
);

ConfirmModal.displayName = "ConfirmModal";

// Alert Modal
export interface AlertModalProps extends Omit<ModalProps, 'children'> {
  alertType?: "info" | "success" | "warning" | "error";
  buttonText?: string;
}

const AlertModal = forwardRef<HTMLDivElement, AlertModalProps>(
  ({
    title,
    description,
    alertType = "info",
    buttonText = "Got it",
    ...props
  }, ref) => {
    const getAlertIcon = () => {
      switch (alertType) {
        case "success":
          return (
            <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          );
        case "warning":
          return (
            <svg className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          );
        case "error":
          return (
            <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          );
        default:
          return (
            <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          );
      }
    };

    return (
      <Modal
        ref={ref}
        title={title}
        description={description}
        {...props}
        footer={
          <Button onClick={props.onClose}>
            {buttonText}
          </Button>
        }
      >
        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900">
          {getAlertIcon()}
        </div>
      </Modal>
    );
  }
);

AlertModal.displayName = "AlertModal";

// Drawer for mobile-friendly side panels
export interface DrawerProps extends Omit<ModalProps, 'size'> {
  position?: "left" | "right" | "top" | "bottom";
}

const Drawer = forwardRef<HTMLDivElement, DrawerProps>(
  ({
    position = "right",
    ...props
  }, ref) => (
    <Modal
      ref={ref}
      size="full"
      className={cn(
        "max-h-full max-w-full",
        position === "left" && "left-0 top-0 h-full max-w-sm",
        position === "right" && "right-0 top-0 h-full max-w-sm",
        position === "top" && "top-0 left-0 right-0 max-h-48",
        position === "bottom" && "bottom-0 left-0 right-0 max-h-48"
      )}
      {...props}
    />
  )
);

Drawer.displayName = "Drawer";

export { Modal, ConfirmModal, AlertModal, Drawer };
