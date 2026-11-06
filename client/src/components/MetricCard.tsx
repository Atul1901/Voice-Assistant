import { Icon, type IconName } from './Icon'

export interface Metric {
  period: string
  icon: IconName
  tone: 'blue' | 'green' | 'violet'
  value: string
  unit?: string
  label: string
  note: string
}

export function MetricCard({ metric }: { metric: Metric }) {
  return (
    <article className="stat-card">
      <div className="stat-top">
        <span className={`stat-icon ${metric.tone}`}>
          <Icon name={metric.icon} />
        </span>
        <span className="stat-period">{metric.period}</span>
      </div>
      <div className="stat-value">
        {metric.value}
        {metric.unit && <span className="stat-unit"> {metric.unit}</span>}
      </div>
      <div className="stat-label">{metric.label}</div>
      <div className="stat-foot">{metric.note}</div>
    </article>
  )
}
