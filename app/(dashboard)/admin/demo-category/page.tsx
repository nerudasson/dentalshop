import CategoryDemo from "./category-demo"

export default function DemoCategoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          CategorySelector
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Entry point for order creation. Selecting{" "}
          <span className="font-medium text-teal-700">Aligner Design</span>{" "}
          forks the wizard to the aligner track — all other categories use the
          prosthetics track.
        </p>
      </div>

      <CategoryDemo />
    </div>
  )
}
