import { SidebarProvider } from '@/components/ui/sidebar';
import { useState, type CSSProperties } from 'react';

interface AppShellProps {
    children: React.ReactNode;
    variant?: 'header' | 'sidebar';
}

export function AppShell({ children, variant = 'header' }: AppShellProps) {
    const [isOpen, setIsOpen] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('sidebar') !== 'false' : true));

    const handleSidebarChange = (open: boolean) => {
        setIsOpen(open);

        if (typeof window !== 'undefined') {
            localStorage.setItem('sidebar', String(open));
        }
    };

    if (variant === 'header') {
        return <div className="flex min-h-screen w-full flex-col">{children}</div>;
    }

    return (
        <SidebarProvider
            className="tailwind-admin-shell bg-background text-foreground"
            defaultOpen={isOpen}
            open={isOpen}
            onOpenChange={handleSidebarChange}
            style={{ '--sidebar-width': '270px', '--sidebar-width-icon': '76px' } as CSSProperties}
        >
            {children}
        </SidebarProvider>
    );
}
