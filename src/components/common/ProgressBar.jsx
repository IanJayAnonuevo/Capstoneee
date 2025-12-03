import React from 'react'

export default function ProgressBar({
    label,
    value,
    max = 100,
    color = 'green',
    showPercentage = true,
    height = 'h-6'
}) {
    const percentage = max > 0 ? Math.round((value / max) * 100) : 0

    const colorClasses = {
        green: {
            bg: 'bg-green-100',
            bar: 'bg-green-500',
            text: 'text-green-900'
        },
        red: {
            bg: 'bg-red-100',
            bar: 'bg-red-500',
            text: 'text-red-900'
        },
        blue: {
            bg: 'bg-blue-100',
            bar: 'bg-blue-500',
            text: 'text-blue-900'
        },
        amber: {
            bg: 'bg-amber-100',
            bar: 'bg-amber-500',
            text: 'text-amber-900'
        }
    }

    const colors = colorClasses[color] || colorClasses.green

    return (
        <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-medium ${colors.text}`}>{label}</span>
                <span className={`text-sm font-bold ${colors.text}`}>
                    {value} {showPercentage && `(${percentage}%)`}
                </span>
            </div>
            <div className={`w-full ${colors.bg} rounded-full ${height} overflow-hidden`}>
                <div
                    className={`${colors.bar} ${height} rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-2`}
                    style={{ width: `${percentage}%` }}
                >
                    {percentage > 10 && (
                        <span className="text-xs font-bold text-white">{percentage}%</span>
                    )}
                </div>
            </div>
        </div>
    )
}
