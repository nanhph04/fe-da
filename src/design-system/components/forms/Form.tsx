// @ts-nocheck
import { forwardRef, ReactNode, useState } from "react";
import { cn } from "@/design-system/tokens";
import { Button } from "../buttons";
import { Input } from "../inputs";
import { Select } from "../selects";

export interface FormField {
  name: string;
  label: string;
  type: "input" | "textarea" | "select";
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: string) => string | null;
  };
  helper?: string;
  error?: string;
}

export interface FormProps {
  fields: FormField[];
  onSubmit: (data: Record<string, string>) => void;
  className?: string;
  loading?: boolean;
  submitText?: string;
  cancelText?: string;
  onCancel?: () => void;
  layout?: "vertical" | "horizontal" | "inline";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  initialValues?: Record<string, string>;
}

const Form = forwardRef<HTMLDivElement, FormProps>(
  ({
    fields,
    onSubmit,
    className,
    loading = false,
    submitText = "Submit",
    cancelText = "Cancel",
    onCancel,
    layout = "vertical",
    size = "md",
    disabled = false,
    initialValues = {},
  }, ref) => {
    const [formData, setFormData] = useState<Record<string, string>>(
      fields.reduce((acc, field) => {
        acc[field.name] = initialValues[field.name] || "";
        return acc;
      }, {} as Record<string, string>)
    );
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    const validateField = (name: string, value: string): string | null => {
      const field = fields.find(f => f.name === name);
      if (!field) return null;

      const validation = field.validation;
      if (!validation) return null;

      if (validation.required && !value.trim()) {
        return `${field.label} is required`;
      }

      if (validation.minLength && value.length < validation.minLength) {
        return `${field.label} must be at least ${validation.minLength} characters`;
      }

      if (validation.maxLength && value.length > validation.maxLength) {
        return `${field.label} must be at most ${validation.maxLength} characters`;
      }

      if (validation.pattern && !validation.pattern.test(value)) {
        return `${field.label} format is invalid`;
      }

      if (validation.custom) {
        const customError = validation.custom(value);
        if (customError) return customError;
      }

      return null;
    };

    const validateForm = (): boolean => {
      const newErrors: Record<string, string> = {};
      let isValid = true;

      fields.forEach(field => {
        const error = validateField(field.name, formData[field.name]);
        if (error) {
          newErrors[field.name] = error;
          isValid = false;
        }
      });

      setErrors(newErrors);
      return isValid;
    };

    const handleInputChange = (name: string, value: string) => {
      setFormData(prev => ({ ...prev, [name]: value }));

      if (touched[name]) {
        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error || "" }));
      }
    };

    const handleBlur = (name: string) => {
      setTouched(prev => ({ ...prev, [name]: true }));
      const error = validateField(name, formData[name]);
      setErrors(prev => ({ ...prev, [name]: error || "" }));
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();

      if (validateForm()) {
        onSubmit(formData);
      }
    };

    const handleCancel = () => {
      if (onCancel) {
        onCancel();
      } else {
        // Reset form
        setFormData(
          fields.reduce((acc, field) => {
            acc[field.name] = "";
            return acc;
          }, {} as Record<string, string>)
        );
        setErrors({});
        setTouched({});
      }
    };

    const getLayoutClasses = () => {
      switch (layout) {
        case "vertical":
          return "space-y-6";
        case "horizontal":
          return "grid grid-cols-1 md:grid-cols-2 gap-6";
        case "inline":
          return "flex flex-wrap items-end gap-4";
        default:
          return "space-y-6";
      }
    };

    const getFormClasses = () => {
      switch (layout) {
        case "inline":
          return "flex space-x-4 space-y-0";
        default:
          return "";
      }
    };

    return (
      <form
        ref={ref}
        className={cn("w-full", getFormClasses(), className)}
        onSubmit={handleSubmit}
        disabled={disabled}
      >
        <div className={getLayoutClasses()}>
          {fields.map((field) => (
            <div
              key={field.name}
              className={cn(
                layout === "inline" ? "flex-1 min-w-[200px]" : "",
                layout === "horizontal" && "md:col-span-1"
              )}
            >
              {field.type === "input" && (
                <Input
                  label={field.label}
                  type="text"
                  value={formData[field.name] || ""}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  onBlur={() => handleBlur(field.name)}
                  error={errors[field.name]}
                  helper={field.helper}
                  required={field.required}
                  size={size}
                  disabled={disabled}
                  placeholder={field.placeholder}
                />
              )}

              {field.type === "textarea" && (
                <Input
                  label={field.label}
                  as="textarea"
                  value={formData[field.name] || ""}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  onBlur={() => handleBlur(field.name)}
                  error={errors[field.name]}
                  helper={field.helper}
                  required={field.required}
                  size={size}
                  disabled={disabled}
                  placeholder={field.placeholder}
                />
              )}

              {field.type === "select" && (
                <Select
                  label={field.label}
                  options={field.options || []}
                  value={formData[field.name] || ""}
                  onValueChange={(value) => handleInputChange(field.name, value)}
                  error={errors[field.name]}
                  helper={field.helper}
                  required={field.required}
                  disabled={disabled}
                  placeholder={field.placeholder}
                />
              )}
            </div>
          ))}
        </div>

        {/* Form actions */}
        <div
          className={cn(
            "flex items-center justify-end space-x-3 mt-6",
            layout === "inline" && "mt-4"
          )}
        >
          {cancelText && (
            <Button
              variant="ghost"
              onClick={handleCancel}
              disabled={disabled}
            >
              {cancelText}
            </Button>
          )}
          <Button
            type="submit"
            loading={loading}
            disabled={disabled}
            size={size}
          >
            {submitText}
          </Button>
        </div>
      </form>
    );
  }
);

Form.displayName = "Form";

// Form wrapper with header and footer
export interface FormWrapperProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
  header?: ReactNode;
}

const FormWrapper = forwardRef<HTMLDivElement, FormWrapperProps>(
  ({ title, description, children, className, footer, header }, ref) => (
    <div ref={ref} className={cn("bg-white rounded-lg shadow-md p-6", className)}>
      {(title || description || header) && (
        <div className="mb-6 space-y-2">
          {header}
          {title && (
            <h2 className="text-2xl font-bold text-gray-900">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-sm text-gray-500">
              {description}
            </p>
          )}
        </div>
      )}
      <div className="space-y-6">
        {children}
      </div>
      {footer && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          {footer}
        </div>
      )}
    </div>
  )
);

FormWrapper.displayName = "FormWrapper";

// Form section component
export interface FormSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  required?: boolean;
}

const FormSection = forwardRef<HTMLDivElement, FormSectionProps>(
  ({ title, description, children, className, required = false }, ref) => (
    <div ref={ref} className={cn("space-y-4", className)}>
      {title && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            {title}
            {required && <span className="text-red-500 ml-1">*</span>}
          </h3>
        </div>
      )}
      {description && (
        <p className="text-sm text-gray-500">
          {description}
        </p>
      )}
      {children}
    </div>
  )
);

FormSection.displayName = "FormSection";

// Form validation hooks
export const useFormValidation = <T extends Record<string, any>>(
  initialValues: T,
  validations: Record<keyof T, (value: any) => string | null>
) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<keyof T, string>>({} as Record<keyof T, string>);
  const [touched, setTouched] = useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>);

  const validateField = (name: keyof T, value: any): string | null => {
    const validation = validations[name];
    return validation ? validation(value) : null;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<keyof T, string> = {};
    let isValid = true;

    (Object.keys(validations) as Array<keyof T>).forEach(key => {
      const error = validateField(key, values[key]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));

    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error || "" }));
    }
  };

  const handleBlur = (name: keyof T) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, values[name]);
    setErrors(prev => ({ ...prev, [name]: error || "" }));
  };

  const handleSubmit = (callback: (values: T) => void) => {
    if (validateForm()) {
      callback(values);
    }
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateForm,
    handleSubmit,
  };
};

// Form stepper component for multi-step forms
export interface FormStep {
  id: string;
  title: string;
  description?: string;
  content: ReactNode;
}

export interface FormStepperProps {
  steps: FormStep[];
  currentStep: number;
  onStepChange: (step: number) => void;
  onSubmit: (data: Record<string, any>) => void;
  className?: string;
}

const FormStepper = forwardRef<HTMLDivElement, FormStepperProps>(
  ({ steps, currentStep, onStepChange, onSubmit, className }, ref) => (
    <div ref={ref} className={cn("w-full", className)}>
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full border-2",
                  currentStep === index
                    ? "border-blue-500 bg-blue-500 text-white"
                    : index < currentStep
                    ? "border-green-500 bg-green-500 text-white"
                    : "border-gray-300 bg-white text-gray-500"
                )}
              >
                {index < currentStep ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">
                  {step.title}
                </h3>
                {step.description && (
                  <p className="text-sm text-gray-500">
                    {step.description}
                  </p>
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "ml-8 w-full h-0.5",
                    index < currentStep ? "bg-green-500" : "bg-gray-300"
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="mb-8">
        {steps[currentStep].content}
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => onStepChange(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
        >
          Previous
        </Button>
        {currentStep === steps.length - 1 ? (
          <Button onClick={() => onSubmit({})}>
            Submit
          </Button>
        ) : (
          <Button onClick={() => onStepChange(currentStep + 1)}>
            Next
          </Button>
        )}
      </div>
    </div>
  )
);

FormStepper.displayName = "FormStepper";

export { Form, FormWrapper, FormSection, FormStepper };
export { useFormValidation };
