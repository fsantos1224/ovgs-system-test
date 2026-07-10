import type { FieldError } from 'react-hook-form';

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: FieldError;
  children: React.ReactNode;
}

export function FormField({ label, required, error, children }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-text-faint uppercase tracking-widest block">
        {label}
        {required && <span className="text-amber-500"> *</span>}
      </label>
      {children}
      {error && (
        <p role="alert" className="text-rose-400 text-xs mt-1">
          {error.message}
        </p>
      )}
    </div>
  );
}
