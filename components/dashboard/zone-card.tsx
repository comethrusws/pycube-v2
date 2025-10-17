interface ZoneCardProps {
  name: string
  color: string
}

export default function ZoneCard({ name, color }: ZoneCardProps) {
  return (
    <div className="flex items-center gap-3 p-3 bg-background rounded-lg hover:bg-border transition-colors">
      <div className={`w-8 h-8 rounded-full ${color}`}></div>
      <span className="text-sm text-navy font-light">{name}</span>
    </div>
  )
}
