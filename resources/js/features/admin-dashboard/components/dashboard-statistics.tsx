import { motion, useReducedMotion } from 'framer-motion';

import type { DashboardStatisticSection, DashboardTone } from '../types';
import { CardBox } from './card-box';

const toneStyles: Record<DashboardTone, { bar: string; badge: string }> = {
    blue: { bar: 'bg-[#5d87ff]', badge: 'bg-[#5d87ff]/10 text-[#5d87ff]' },
    cyan: { bar: 'bg-[#49beff]', badge: 'bg-[#49beff]/10 text-[#258ec8]' },
    green: { bar: 'bg-[#13deb9]', badge: 'bg-[#13deb9]/10 text-[#0f9f86]' },
    violet: { bar: 'bg-[#8754ec]', badge: 'bg-[#8754ec]/10 text-[#8754ec]' },
    amber: { bar: 'bg-[#f6b51e]', badge: 'bg-[#f6b51e]/10 text-[#b47a00]' },
    red: { bar: 'bg-[#ef4444]', badge: 'bg-[#ef4444]/10 text-[#ef4444]' },
    slate: { bar: 'bg-[#7c8fac]', badge: 'bg-[#7c8fac]/10 text-[#62728a]' },
};

export function DashboardStatistics({ sections }: { sections: DashboardStatisticSection[] }) {
    const shouldReduceMotion = useReducedMotion();

    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {sections.map((section, sectionIndex) => {
                const maximum = Math.max(...section.items.map((item) => item.value), 1);

                return (
                    <motion.div
                        key={section.key}
                        initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: shouldReduceMotion ? 0 : sectionIndex * 0.08 }}
                    >
                        <CardBox className="h-full">
                            <div>
                                <h2 className="text-lg font-semibold">{section.title}</h2>
                                <p className="text-muted-foreground text-sm font-normal">{section.description}</p>
                            </div>

                            <div className="mt-6 space-y-5">
                                {section.items.map((item) => {
                                    const style = toneStyles[item.tone];
                                    const percentage = item.value === 0 ? 0 : Math.max(8, Math.round((item.value / maximum) * 100));

                                    return (
                                        <div key={item.label} className="space-y-2">
                                            <div className="flex items-center justify-between gap-4">
                                                <span className="text-sm font-medium">{item.label}</span>
                                                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${style.badge}`}>
                                                    {item.value.toLocaleString('es-BO')}
                                                </span>
                                            </div>
                                            <div className="h-2 overflow-hidden rounded-full bg-[#e8eef7] dark:bg-[#273348]">
                                                <motion.div
                                                    initial={shouldReduceMotion ? false : { width: 0 }}
                                                    animate={{ width: `${percentage}%` }}
                                                    transition={{ duration: 0.6, delay: shouldReduceMotion ? 0 : sectionIndex * 0.08 + 0.15 }}
                                                    className={`h-full rounded-full ${style.bar}`}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardBox>
                    </motion.div>
                );
            })}
        </div>
    );
}
