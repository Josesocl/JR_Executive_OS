// src/components/ui/tabs.tsx
'use client'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from '@/lib/utils'

const Tabs = TabsPrimitive.Root
const TabsList = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>) => (
  <TabsPrimitive.List
    className={cn(
      'flex border-b border-stone-200 gap-0',
      className,
    )}
    {...props}
  />
)
const TabsTrigger = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>) => (
  <TabsPrimitive.Trigger
    className={cn(
      'px-5 py-2.5 text-sm font-medium text-stone-500 border-b-2 border-transparent -mb-px transition-colors',
      'hover:text-[#1a1a2e]',
      'data-[state=active]:text-[#1a1a2e] data-[state=active]:border-[#e8b86d]',
    )}
    {...props}
  />
)
const TabsContent = TabsPrimitive.Content

export { Tabs, TabsList, TabsTrigger, TabsContent }
