import ToothChartDemo from "./tooth-chart-demo"

export default function DemoToothChartPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">ToothChart</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Interactive dental chart using FDI notation. Used in prosthetics order
          creation step 2 — select which teeth need design work.
        </p>
      </div>

      <ToothChartDemo />
    </div>
  )
}
