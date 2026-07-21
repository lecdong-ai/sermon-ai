import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-foreground text-background hover:bg-foreground/90 shadow-sm hover:shadow-md active:scale-[0.98]',
        outline:
          'border border-border-strong bg-transparent text-foreground hover:bg-surface-2 hover:border-foreground/30 active:bg-surface-muted',
        ghost:
          'text-foreground-muted hover:text-foreground hover:bg-surface-2 active:bg-surface-muted',
        link: 'text-accent underline-offset-4 hover:underline hover:text-accent/80',
        subtle:
          'bg-surface-2 text-foreground-muted hover:bg-surface-muted hover:text-foreground active:bg-surface-2',
        'accent-soft':
          'bg-accent-soft text-accent hover:bg-accent-muted active:bg-accent-soft',
      },
      size: {
        sm: 'h-9 px-4 text-xs',
        md: 'h-11 px-6 text-sm',
        lg: 'h-12 px-8 text-base',
        xl: 'h-14 px-10 text-lg',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
