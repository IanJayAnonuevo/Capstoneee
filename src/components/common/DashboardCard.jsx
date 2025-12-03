import React from 'react'

export default function DashboardCard({
    title,
    value,
    subtitle,
    icon,
    color = 'emerald',
    trend = null,
    onClick = null
}) {
    const colorClasses = {
        emerald: {
            bg: 'bg-emerald-50',
            border: 'border-emerald-100',
            text: 'text-emerald-900',
            icon: 'text-emerald-600',
            subtitle: 'text-emerald-700/70'
        },
        blue: {
            bg: 'bg-blue-50',
            border: 'border-blue-100',
            text: 'text-blue-900',
            icon: 'text-blue-600',
            subtitle: 'text-blue-700/70'
        },
        amber: {
            bg: 'bg-amber-50',
            border: 'border-amber-100',
            text: 'text-amber-900',
            icon: 'text-amber-600',
            subtitle: 'text-amber-700/70'
        },
        red: {
            bg: 'bg-red-50',
            border: 'border-red-100',
            text: 'text-red-900',
            icon: 'text-red-600',
            subtitle: 'text-red-700/70'
        }
    }

    const colors = colorClasses[color] || colorClasses.emerald

    return (
        <div
            className={`${colors.bg} rounded-xl border ${colors.border} shadow-soft p-4 transition-all ${onClick ? 'cursor-pointer hover:shadow-md' : ''}`}
            onClick={onClick}
        >
            <div className="flex items-start justify-between">
                <div className={`text-sm ${colors.text} font-semibold`}>{title}</div>
                {icon && <div className={colors.icon}>{icon}</div>}
            </div>
            <div className={`mt-1 text-4xl font-extrabold tracking-tight ${colors.text} flex items-baseline gap-2`}>
                {value}
                {trend && (
                    <span className={`text-sm font-normal ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                    </span>
                )}
            </div>
            {subtitle && (
                <div className={`mt-1 text-[11px] ${colors.subtitle}`}>{subtitle}</div>
            )}
        </div>
    )
}
