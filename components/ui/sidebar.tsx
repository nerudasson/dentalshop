"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { PanelLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// ─── Context ─────────────────────────────────────────────────────────────────

interface SidebarContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  isMobile: boolean
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null)

export function useSidebar() {
  const ctx = React.useContext(SidebarContext)
  if (!ctx) throw new Error("useSidebar must be used inside SidebarProvider")
  return ctx
}

// ─── Provider ────────────────────────────────────────────────────────────────

interface SidebarProviderProps {
  children: React.ReactNode
  defaultOpen?: boolean
  className?: string
}

export function SidebarProvider({
  children,
  defaultOpen = true,
  className,
}: SidebarProviderProps) {
  const [open, setOpen] = React.useState(defaultOpen)
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)")
    const handler = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches)
      if (e.matches) setOpen(false)
    }
    setIsMobile(mq.matches)
    if (mq.matches) setOpen(false)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  return (
    <SidebarContext.Provider value={{ open, setOpen, isMobile }}>
      <div
        className={cn(
          "flex min-h-screen w-full",
          className
        )}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  )
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
}

export function Sidebar({ children, className, ...props }: SidebarProps) {
  const { open, isMobile } = useSidebar()

  if (isMobile) {
    return open ? (
      <>
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar text-sidebar-foreground shadow-xl",
            className
          )}
          {...props}
        >
          {children}
        </aside>
        {/* Backdrop */}
        <MobileBackdrop />
      </>
    ) : null
  }

  return (
    <aside
      className={cn(
        "relative flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-200",
        open ? "w-64" : "w-0 overflow-hidden",
        // On tablet (md) show a narrow icon bar
        "md:flex",
        className
      )}
      {...props}
    >
      <div className={cn("flex h-full flex-col", !open && "hidden")}>
        {children}
      </div>
    </aside>
  )
}

function MobileBackdrop() {
  const { setOpen } = useSidebar()
  return (
    <div
      className="fixed inset-0 z-40 bg-black/50"
      onClick={() => setOpen(false)}
    />
  )
}

// ─── SidebarInset ─────────────────────────────────────────────────────────────

export function SidebarInset({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-1 flex-col overflow-hidden", className)} {...props}>
      {children}
    </div>
  )
}

// ─── Trigger ─────────────────────────────────────────────────────────────────

export function SidebarTrigger({ className, ...props }: React.ComponentPropsWithoutRef<typeof Button>) {
  const { open, setOpen } = useSidebar()
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("h-8 w-8", className)}
      onClick={() => setOpen(!open)}
      {...props}
    >
      <PanelLeft className="h-4 w-4" />
      <span className="sr-only">Toggle sidebar</span>
    </Button>
  )
}

// ─── Structural sub-components ────────────────────────────────────────────────

export function SidebarHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col gap-2 p-4", className)}
      {...props}
    />
  )
}

export function SidebarContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-1 flex-col gap-2 overflow-y-auto p-2", className)}
      {...props}
    />
  )
}

export function SidebarFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col gap-2 p-4 mt-auto", className)}
      {...props}
    />
  )
}

export function SidebarGroup({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col gap-1", className)} {...props} />
  )
}

export function SidebarGroupLabel({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "px-2 py-1 text-xs font-medium uppercase tracking-widest text-sidebar-foreground/50",
        className
      )}
      {...props}
    />
  )
}

// ─── Menu ────────────────────────────────────────────────────────────────────

export function SidebarMenu({
  className,
  ...props
}: React.HTMLAttributes<HTMLUListElement>) {
  return <ul className={cn("flex flex-col gap-0.5", className)} {...props} />
}

export function SidebarMenuItem({
  className,
  ...props
}: React.HTMLAttributes<HTMLLIElement>) {
  return <li className={cn("", className)} {...props} />
}

interface SidebarMenuButtonProps extends React.HTMLAttributes<HTMLElement> {
  asChild?: boolean
  isActive?: boolean
  tooltip?: string
}

export const SidebarMenuButton = React.forwardRef<
  HTMLElement,
  SidebarMenuButtonProps
>(({ asChild = false, isActive = false, className, children, tooltip: _tooltip, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      ref={ref as React.Ref<HTMLButtonElement>}
      className={cn(
        "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/80 transition-colors",
        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-semibold",
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  )
})
SidebarMenuButton.displayName = "SidebarMenuButton"
