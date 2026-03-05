export default function SignUpPage() {
  return (
    <div className="rounded-lg border border-border bg-card p-8 shadow-sm">
      <h1 className="mb-1 text-xl font-semibold text-foreground">Create account</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Registration via Clerk — coming soon.
      </p>
      <div className="rounded-md bg-muted/60 p-4 text-center text-sm text-muted-foreground">
        Clerk Auth integration not yet configured.
        <br />
        Use the dev role switcher (bottom-right) to explore the app.
      </div>
    </div>
  )
}
