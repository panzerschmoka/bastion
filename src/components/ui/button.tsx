import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-[13px] font-sans font-medium uppercase tracking-[0.08em] ring-offset-background transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-40 rounded-sm active:translate-y-[1px]",
  {
    variants: {
      variant: {
        default: "bg-accent text-paper hover:bg-ink hover:text-paper shadow-none border border-transparent",
        destructive: "bg-accent text-paper hover:bg-ink hover:text-paper",
        outline: "border border-line bg-transparent text-foreground hover:border-accent hover:text-accent shadow-none",
        secondary: "border border-line bg-[var(--paper)] text-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--paper)] shadow-[inset_0_1px_1px_rgba(255,255,255,1)]",
        ghost: "text-foreground/70 hover:text-foreground hover:bg-line/20",
        link: "text-foreground underline-offset-4 hover:text-accent hover:underline",
        propaganda: "border border-accent bg-transparent text-accent font-display text-lg tracking-[0.1em] hover:bg-accent hover:text-paper",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 px-4",
        lg: "h-14 px-8 text-[14px]",
        xl: "h-16 px-12 text-[15px]",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
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
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
