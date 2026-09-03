import { NavbarSearch } from '@/components/navbar-search';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { Moon, Scale, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    const [isSticky, setIsSticky] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const currentPage = breadcrumbs.at(-1)?.title ?? 'Dashboard';

    useEffect(() => {
        const handleScroll = () => setIsSticky(window.scrollY > 20);

        setIsDark(document.documentElement.classList.contains('dark'));
        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleTheme = () => {
        const nextIsDark = !isDark;

        setIsDark(nextIsDark);
        localStorage.setItem('appearance', nextIsDark ? 'dark' : 'light');
        document.documentElement.classList.toggle('dark', nextIsDark);
    };

    return (
        <header
            className={`border-border bg-background/95 sticky top-0 z-20 flex h-[72px] shrink-0 items-center border-b px-4 backdrop-blur transition-shadow md:px-6 ${
                isSticky ? 'shadow-sm' : ''
            }`}
        >
            <nav className="flex w-full items-center justify-between gap-3" aria-label="Navegación superior">
                <div className="flex min-w-0 items-center gap-3">
                    <SidebarTrigger className="size-10 shrink-0 rounded-full hover:bg-[#5d87ff]/10 hover:text-[#5d87ff]" />
                    <div className="hidden w-72 md:block">
                        <NavbarSearch placeholder={`Buscar desde ${currentPage}...`} />
                    </div>
                    <div className="flex min-w-0 items-center gap-2 md:hidden">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#5d87ff]/10 text-[#5d87ff]">
                            <Scale className="size-5" strokeWidth={1.8} />
                        </span>
                        <span className="text-foreground truncate text-sm font-bold sm:text-base">Sistema Jurídico</span>
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-foreground size-10 rounded-full hover:bg-[#5d87ff]/10 hover:text-[#5d87ff]"
                        aria-label={isDark ? 'Activar tema claro' : 'Activar tema oscuro'}
                        onClick={toggleTheme}
                    >
                        {isDark ? <Sun className="size-5" strokeWidth={1.8} /> : <Moon className="size-5" strokeWidth={1.8} />}
                    </Button>
                </div>
            </nav>
        </header>
    );
}
