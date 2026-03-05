"use client"

import React, { createContext, useContext, useState } from "react"
import type { DummyProfile, RoleContextValue } from "@/lib/types"

// ─── Dummy profiles (used until Clerk is integrated) ─────────────────────────

const DUMMY_PROFILES: DummyProfile[] = [
  {
    role: "client",
    orgId: "org_clinic_01",
    userId: "user_dr_smith",
    orgName: "Smith Dental Clinic",
    displayName: "Dr. A. Smith",
    orgFlags: { is_practice: true, can_design: false, is_super_admin: false },
  },
  {
    role: "provider",
    orgId: "org_design_01",
    userId: "user_design_lead",
    orgName: "ClearCAD Studio",
    displayName: "M. Chen",
    orgFlags: { is_practice: false, can_design: true, is_super_admin: false },
  },
  {
    role: "admin",
    orgId: "org_platform",
    userId: "user_admin_01",
    orgName: "SAGA.DENTAL Platform",
    displayName: "Platform Admin",
    orgFlags: { is_practice: false, can_design: false, is_super_admin: true },
  },
]

// ─── Context ──────────────────────────────────────────────────────────────────

const RoleContext = createContext<RoleContextValue | null>(null)

export function useRole(): RoleContextValue {
  const ctx = useContext(RoleContext)
  if (!ctx) throw new Error("useRole must be used inside RoleProvider")
  return ctx
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [profileIndex, setProfileIndex] = useState(0)
  const profile = DUMMY_PROFILES[profileIndex]

  const value: RoleContextValue = {
    role: profile.role,
    orgId: profile.orgId,
    userId: profile.userId,
    orgName: profile.orgName,
    orgFlags: profile.orgFlags,
    setProfileIndex,
    profiles: DUMMY_PROFILES,
  }

  return (
    <RoleContext.Provider value={value}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <DevRoleSwitcher
          profiles={DUMMY_PROFILES}
          activeIndex={profileIndex}
          onSwitch={setProfileIndex}
        />
      )}
    </RoleContext.Provider>
  )
}

// ─── Dev Role Switcher ────────────────────────────────────────────────────────

interface DevRoleSwitcherProps {
  profiles: DummyProfile[]
  activeIndex: number
  onSwitch: (index: number) => void
}

function DevRoleSwitcher({ profiles, activeIndex, onSwitch }: DevRoleSwitcherProps) {
  const active = profiles[activeIndex]
  const roleColors: Record<string, string> = {
    client: "bg-blue-600",
    provider: "bg-teal-600",
    admin: "bg-rose-600",
  }

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col items-end gap-2">
      <div className="flex items-center gap-2 rounded-full bg-gray-900/90 px-3 py-1.5 text-xs text-white shadow-lg backdrop-blur-sm">
        <span
          className={`h-2 w-2 rounded-full ${roleColors[active.role] ?? "bg-gray-400"}`}
        />
        <span className="font-mono font-semibold">[DEV]</span>
        <span>{active.role}</span>
        <span className="text-gray-400">·</span>
        <span className="text-gray-300">{active.displayName}</span>
      </div>
      <div className="flex gap-1">
        {profiles.map((p, i) => (
          <button
            key={p.role}
            onClick={() => onSwitch(i)}
            className={[
              "rounded-full px-2.5 py-1 text-[10px] font-semibold shadow transition-all",
              i === activeIndex
                ? `${roleColors[p.role]} text-white scale-105`
                : "bg-gray-800/80 text-gray-300 hover:bg-gray-700/80",
            ].join(" ")}
          >
            {p.role}
          </button>
        ))}
      </div>
    </div>
  )
}
