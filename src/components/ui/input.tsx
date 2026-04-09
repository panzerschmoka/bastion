import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full border border-line bg-transparent px-4 py-2 font-sans text-[14px] text-foreground placeholder:text-steel/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-40 transition-colors duration-150 rounded-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
