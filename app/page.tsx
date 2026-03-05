import { redirect } from "next/navigation"

// Root redirect: send visitors to the client dashboard (default role in dev)
export default function RootPage() {
  redirect("/client/dashboard")
}
