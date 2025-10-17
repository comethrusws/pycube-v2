interface ProgressBarProps {
  value: number
  max: number
}

export default function ProgressBar({ value, max }: ProgressBarProps) {
  const percentage = (value / max) * 100

  return (
    <div className="w-full bg-background rounded-full h-3 overflow-hidden">
      <div
        className="bg-gradient-to-r from-primary to-accent h-full rounded-full transition-all duration-300"
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  )
}
