"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius-2xl)",
          "--success-bg": "color-mix(in oklch, var(--success) 10%, var(--card))",
          "--success-text": "var(--foreground)",
          "--success-border": "color-mix(in oklch, var(--success) 30%, transparent)",
          "--error-bg": "color-mix(in oklch, var(--destructive) 8%, var(--card))",
          "--error-text": "var(--destructive)",
          "--error-border": "color-mix(in oklch, var(--destructive) 30%, transparent)",
          "--info-bg": "var(--secondary)",
          "--info-text": "var(--foreground)",
          "--info-border": "color-mix(in oklch, var(--primary) 20%, transparent)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
