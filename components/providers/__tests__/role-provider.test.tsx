import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { RoleProvider, useRole } from "../role-provider"

function RoleDisplay() {
  const { role, orgId, userId, orgName, orgFlags } = useRole()
  return (
    <div>
      <span data-testid="role">{role}</span>
      <span data-testid="orgId">{orgId}</span>
      <span data-testid="userId">{userId}</span>
      <span data-testid="orgName">{orgName}</span>
      <span data-testid="is_practice">{String(orgFlags.is_practice)}</span>
      <span data-testid="can_design">{String(orgFlags.can_design)}</span>
      <span data-testid="is_super_admin">{String(orgFlags.is_super_admin)}</span>
    </div>
  )
}

describe("RoleProvider", () => {
  it("provides client role by default", () => {
    render(
      <RoleProvider>
        <RoleDisplay />
      </RoleProvider>
    )
    expect(screen.getByTestId("role")).toHaveTextContent("client")
    expect(screen.getByTestId("orgName")).toHaveTextContent("Smith Dental Clinic")
    expect(screen.getByTestId("is_practice")).toHaveTextContent("true")
    expect(screen.getByTestId("can_design")).toHaveTextContent("false")
  })

  it("exposes 3 profiles and setProfileIndex", () => {
    function ProfileInfo() {
      const { profiles } = useRole()
      return <span data-testid="count">{profiles.length}</span>
    }
    render(
      <RoleProvider>
        <ProfileInfo />
      </RoleProvider>
    )
    expect(screen.getByTestId("count")).toHaveTextContent("3")
  })

  it("switches roles via setProfileIndex", async () => {
    const user = userEvent.setup()
    function Switcher() {
      const { role, orgName, orgFlags, setProfileIndex } = useRole()
      return (
        <div>
          <span data-testid="role">{role}</span>
          <span data-testid="orgName">{orgName}</span>
          <span data-testid="can_design">{String(orgFlags.can_design)}</span>
          <span data-testid="is_super_admin">{String(orgFlags.is_super_admin)}</span>
          <button onClick={() => setProfileIndex(1)}>to-provider</button>
          <button onClick={() => setProfileIndex(2)}>to-admin</button>
        </div>
      )
    }
    render(
      <RoleProvider>
        <Switcher />
      </RoleProvider>
    )

    await user.click(screen.getByText("to-provider"))
    expect(screen.getByTestId("role")).toHaveTextContent("provider")
    expect(screen.getByTestId("orgName")).toHaveTextContent("ClearCAD Studio")
    expect(screen.getByTestId("can_design")).toHaveTextContent("true")

    await user.click(screen.getByText("to-admin"))
    expect(screen.getByTestId("role")).toHaveTextContent("admin")
    expect(screen.getByTestId("is_super_admin")).toHaveTextContent("true")
  })
})

describe("useRole", () => {
  it("throws when used outside RoleProvider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {})
    expect(() => render(<RoleDisplay />)).toThrow(
      "useRole must be used inside RoleProvider"
    )
    spy.mockRestore()
  })
})
