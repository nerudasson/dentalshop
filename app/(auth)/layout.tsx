import React from "react"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <span className="text-3xl font-bold tracking-tight text-foreground">
            SAGA
            <span className="text-[#3BAF99]">.</span>
            <span className="text-primary">DENTAL</span>
          </span>
          <p className="mt-1 text-sm text-muted-foreground">
            Dental design services marketplace
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
