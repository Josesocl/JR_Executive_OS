import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-[#1a1a2e] text-white hover:bg-[#16213e]',
        secondary:
          'border-transparent bg-[#e8b86d] text-[#1a1a2e] hover:bg-[#d4a35a]',
        outline:
          'border-[#1a1a2e] text-[#1a1a2e] bg-transparent',
        destructive:
          'border-transparent bg-red-600 text-white hover:bg-red-700',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
