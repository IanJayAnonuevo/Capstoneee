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
            icon: 'text-green-500'
        },
        blue: {
            icon: 'text-blue-500'
        },
        amber: {
            icon: 'text-yellow-500'
        },
        red: {
            icon: 'text-red-500'
        }
    }

    const colors = colorClasses[color] || colorClasses.emerald

    return (
        <div
            className={`bg-white border border-gray-200 rounded-xl shadow-sm p-5 transition-all ${onClick ? 'cursor-pointer hover:shadow-md' : ''}`}
            onClick={onClick}
        >
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{title}</span>
                {icon && <div className={colors.icon}>{icon}</div>}
            </div>
            <div className="text-3xl font-bold text-gray-900 flex items-baseline gap-2">
                {value}
                {trend && (
                    <span className={`text-sm font-normal ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                    </span>
                )}
            </div>
            {subtitle && (
                <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
        </div>
    )
}
