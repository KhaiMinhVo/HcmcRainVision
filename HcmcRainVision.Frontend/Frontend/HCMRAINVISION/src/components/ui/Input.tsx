import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from './cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  /** When type="password", show toggle visibility */
  showPasswordToggle?: boolean;
  error?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    className,
    leftIcon,
    rightIcon,
    showPasswordToggle,
    type = 'text',
    error,
    id,
    ...props
  },
  ref,
) {
  const [showPassword, setShowPassword] = useState(false);
  const hasPasswordToggle = type === 'password' && showPasswordToggle;
  const inputType = hasPasswordToggle ? (showPassword ? 'text' : 'password') : type;

  const paddingLeft = leftIcon ? 'pl-10' : 'pl-3';
  const paddingRight = hasPasswordToggle || rightIcon ? 'pr-10' : 'pr-3';

  return (
    <div className="relative w-full">
      {leftIcon && (
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
          {leftIcon}
        </span>
      )}
      <input
        ref={ref}
        id={id}
        type={inputType}
        className={cn(
          'w-full rounded-lg border border-gray-300 bg-white py-2 text-gray-900 shadow-sm transition-all duration-200',
          'placeholder:text-gray-400',
          'focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30',
          'disabled:cursor-not-allowed disabled:bg-gray-50',
          error && 'border-red-400 focus:border-red-500 focus:ring-red-500/30',
          paddingLeft,
          paddingRight,
          className,
        )}
        {...props}
      />
      {hasPasswordToggle && (
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShowPassword((v) => !v)}
          className="absolute inset-y-0 right-2 flex items-center rounded-lg p-1 text-gray-500 transition-colors hover:text-gray-700"
          aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      )}
      {!hasPasswordToggle && rightIcon && (
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
          {rightIcon}
        </span>
      )}
    </div>
  );
});

export default Input;
