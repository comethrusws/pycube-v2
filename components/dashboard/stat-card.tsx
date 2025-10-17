interface StatCardProps {
  title: string
  subtitle: string
  value: string
  color: "primary" | "accent"
}

export default function StatCard({ title, subtitle, value, color }: StatCardProps) {
  const bgColor = color === "primary" ? "bg-primary" : "bg-accent"

  return (
    <div className="bg-white rounded-lg p-6 border border-border hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-navy mb-1">{title}</p>
          <p className="text-xs text-text-secondary mb-4">{subtitle}</p>
          <p className="text-4xl font-light text-navy">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-lg ${bgColor} opacity-10`}></div>
      </div>
    </div>
  )
}
