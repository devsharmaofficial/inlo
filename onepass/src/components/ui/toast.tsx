"use client"

import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { X } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Toast system — design.md §7.9.
 * Toasts report short-lived status only.
 * Important payment/booking outcomes also persist on the page.
 */
const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed bottom-0 right-0 z-[100]",
      "flex max-h-screen w-full flex-col-reverse gap-2 p-4",
      "sm:max-w-[380px]",
      // Account for mobile bottom nav safe area
      "pb-[calc(1rem+env(safe-area-inset-bottom))]",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  [
    "group relative flex w-full items-start gap-3",
    "rounded-[--radius-md] border p-4",
    "shadow-[--shadow-md]",
    "data-[state=open]:animate-in data-[state=closed]:animate-out",
    "data-[swipe=end]:animate-out",
    "data-[state=closed]:fade-out-80 data-[state=open]:slide-in-from-bottom-5",
    "data-[state=closed]:slide-out-to-right-full",
    "data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]",
    "data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-[transform_200ms_ease-out]",
    "duration-[220ms]",
  ],
  {
    variants: {
      variant: {
        default: "bg-[--color-surface] border-[--color-border] text-[--color-foreground]",
        success: "bg-[#DCF3E8] border-[#B6E3CB] text-[--color-success]",
        warning: "bg-[#FDEFD9] border-[#F5D49E] text-[--color-warning]",
        destructive: "bg-[#FAEAE9] border-[#EDBBBA] text-[--color-danger]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => (
  <ToastPrimitives.Root
    ref={ref}
    className={cn(toastVariants({ variant }), className)}
    {...props}
  />
))
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-[--radius-sm]",
      "border border-[--color-border] bg-transparent px-3",
      "text-xs font-[580] text-[--color-foreground]",
      "transition-colors hover:bg-[--color-surface-muted]",
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-[--color-focus-ring]",
      "disabled:pointer-events-none disabled:opacity-50",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 h-7 w-7",
      "inline-flex items-center justify-center rounded-[--radius-sm]",
      "text-[--color-muted] opacity-0 transition-opacity",
      "hover:text-[--color-foreground] group-hover:opacity-100",
      "focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[--color-focus-ring]",
      className
    )}
    aria-label="Dismiss notification"
    toast-close=""
    {...props}
  >
    <X size={14} aria-hidden="true" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-[600]", className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-xs text-[--color-muted] mt-0.5", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

export type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>
export type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}
