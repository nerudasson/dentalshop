import type { Metadata } from "next"
import "./globals.css"
import { RoleProvider } from "@/components/providers/role-provider"

export const metadata: Metadata = {
  title: "SAGA.DENTAL — Dental Design Marketplace",
  description: "Digital design services marketplace for dental prosthetics",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <RoleProvider>{children}</RoleProvider>
      </body>
    </html>
  )
}
