// Blaze Sports Intel - Button Component
// Version: 1.0.0
// Updated: 2025-09-26

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { colors } from '../tokens/colors';
import { typography } from '../tokens/typography';
import { spacing } from '../tokens/spacing';

const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        // Primary variants
        primary: 'bg-blaze-primary text-white hover:bg-blaze-primaryDark active:bg-blaze-primaryDark shadow-lg',
        secondary: 'bg-primary-200 text-primary-900 hover:bg-primary-300 active:bg-primary-400',
        ghost: 'hover:bg-primary-100 text-primary-700 active:bg-primary-200',
        outline: 'border-2 border-blaze-primary text-blaze-primary hover:bg-blaze-primary hover:text-white',
        danger: 'bg-semantic-error text-white hover:bg-red-600 active:bg-red-700',

        // Sport-specific variants
        baseball: 'bg-sports-baseball-diamond text-white hover:bg-sports-baseball-grass active:bg-sports-baseball-leather shadow-md',
        football: 'bg-sports-football-field text-white hover:bg-sports-football-endzone active:bg-sports-football-pigskin shadow-md',
        basketball: 'bg-sports-basketball-court text-white hover:bg-sports-basketball-paint active:bg-sports-basketball-rim shadow-md',
        track: 'bg-sports-track-track text-white hover:bg-sports-track-starting active:bg-sports-track-field shadow-md'
      },
      size: {
        xs: 'h-7 px-2 text-xs gap-1',
        sm: 'h-9 px-3 text-sm gap-1.5',
        md: 'h-11 px-4 text-base gap-2',
        lg: 'h-13 px-6 text-lg gap-2.5',
        xl: 'h-16 px-8 text-xl gap-3',

        // Sport-specific sizes
        'sport-hero': 'h-20 px-12 text-2xl gap-4 font-bold tracking-wide',
        'sport-stat': 'h-8 px-2 text-xs gap-1 font-mono'
      },
      shape: {
        rounded: 'rounded-lg',
        pill: 'rounded-full',
        square: 'rounded-none',
        stadium: 'rounded-[100px]' // Baseball-inspired
      },
      state: {
        default: '',
        loading: 'opacity-75 cursor-wait',
        success: 'bg-semantic-success text-white',
        error: 'bg-semantic-error text-white'
      }
    },
    compoundVariants: [
      // Baseball with sport-hero size gets special treatment
      {
        variant: 'baseball',
        size: 'sport-hero',
        class: 'font-["Roboto_Mono"] tracking-wider uppercase shadow-xl'
      },
      // Football with sport-hero gets bold treatment
      {
        variant: 'football',
        size: 'sport-hero',
        class: 'font-["Bebas_Neue"] tracking-widest uppercase shadow-xl'
      },
      // Basketball gets dynamic hover effect
      {
        variant: 'basketball',
        size: ['lg', 'xl', 'sport-hero'],
        class: 'hover:scale-105 active:scale-100 transition-transform'
      },
      // Track gets speed effect
      {
        variant: 'track',
        size: ['md', 'lg', 'xl'],
        class: 'hover:translate-x-1 transition-transform'
      }
    ],
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      shape: 'rounded',
      state: 'default'
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  sport?: 'baseball' | 'football' | 'basketball' | 'track';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant,
    size,
    shape,
    state,
    asChild = false,
    icon,
    iconPosition = 'left',
    loading = false,
    sport,
    children,
    disabled,
    ...props
  }, ref) => {
    // Override variant if sport is specified
    const finalVariant = sport || variant;
    const finalState = loading ? 'loading' : state;

    return (
      <button
        className={buttonVariants({
          variant: finalVariant,
          size,
          shape,
          state: finalState,
          className
        })}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
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
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {icon && iconPosition === 'left' && !loading && icon}
        {children}
        {icon && iconPosition === 'right' && !loading && icon}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };