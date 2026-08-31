import { type ReactNode } from 'react';

interface LibrosPageHeaderProps {
    eyebrow: string;
    title: string;
    description: string;
    icon: ReactNode;
    actions?: ReactNode;
}

export function LibrosPageHeader({ eyebrow, title, description, icon, actions }: LibrosPageHeaderProps) {
    return (
        <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm font-medium text-[#5d87ff]">
                    {icon}
                    {eyebrow}
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-[#2a3547] sm:text-3xl dark:text-white">{title}</h1>
                <p className="max-w-2xl text-sm text-[#5a6a85] dark:text-[#aab7ca]">{description}</p>
            </div>
            {actions}
        </section>
    );
}
