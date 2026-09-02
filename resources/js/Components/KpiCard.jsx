import React from 'react';

export default function KpiCard({ icon, label, value, trend, trendLabel, variant = 'primary' }) {
    const colorMap = {
        primary: { iconBg: 'bg-primary/10', iconText: 'text-primary', trendBg: 'bg-secondary/10', trendText: 'text-secondary' },
        error: { iconBg: 'bg-error/10', iconText: 'text-error', trendBg: 'bg-error/10', trendText: 'text-error' },
    };
    const c = colorMap[variant] || colorMap.primary;

    return (
        <div className="glass-panel rounded-xl p-6 flex flex-col justify-between ambient-shadow">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-lg ${c.iconBg} ${c.iconText}`}>
                    <span className="material-symbols-outlined">{icon}</span>
                </div>
                {trendLabel && (
                    <span className={`font-label-md text-[12px] tracking-wide font-semibold px-2 py-1 rounded-full flex items-center gap-1 ${c.trendBg} ${c.trendText}`}>
                        {trend === 'up' && <span className="material-symbols-outlined text-[14px]">arrow_upward</span>}
                        {trend === 'warning' && <span className="material-symbols-outlined text-[14px]">warning</span>}
                        {trendLabel}
                    </span>
                )}
            </div>
            <div>
                <p className="text-sm text-on-surface-variant mb-1 font-body-sm">{label}</p>
                <h3 className="font-display-lg text-on-surface">{value}</h3>
            </div>
        </div>
    );
}
