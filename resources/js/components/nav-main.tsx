import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Icon } from '@iconify/react';
import { Link, usePage } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';

interface SidebarNavChild {
    title: string;
    href?: string;
    permission?: string;
}

export interface SidebarNavItem {
    title: string;
    href?: string;
    icon: string;
    permission?: string;
    children?: SidebarNavChild[];
}

export interface SidebarNavSection {
    title: string;
    items: SidebarNavItem[];
}

const menuButtonClass =
    'min-h-10 gap-3 rounded-md px-2.5 py-2.5 text-sm font-normal text-sidebar-foreground transition-all duration-200 ease-in-out hover:translate-x-1 hover:bg-[#5d87ff]/20 hover:text-[#5d87ff] data-[active=true]:bg-[#5d87ff]! data-[active=true]:font-normal data-[active=true]:text-white! data-[state=open]:bg-[#5d87ff]! data-[state=open]:text-white! group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2.5!';

function MenuIcon({ icon }: { icon: string }) {
    return <Icon icon={icon} width={21} height={21} className="shrink-0" />;
}

function SubmenuItem({ item }: { item: SidebarNavChild }) {
    const content = (
        <>
            <Icon icon="ri:checkbox-blank-circle-line" width={9} height={9} className="shrink-0" />
            <span className="truncate">{item.title}</span>
        </>
    );

    return (
        <li>
            {item.href ? (
                <Link
                    href={item.href}
                    prefetch
                    className="text-sidebar-foreground flex min-h-8 items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-all duration-200 ease-in-out hover:translate-x-1 hover:text-[#5d87ff]"
                >
                    {content}
                </Link>
            ) : (
                <button
                    type="button"
                    className="text-sidebar-foreground flex min-h-8 w-full items-center gap-3 rounded-md px-2.5 py-2 text-left text-sm transition-all duration-200 ease-in-out hover:translate-x-1 hover:text-[#5d87ff]"
                >
                    {content}
                </button>
            )}
        </li>
    );
}

function NavMenuItem({ item, currentPath }: { item: SidebarNavItem; currentPath: string }) {
    const isActive = item.href === currentPath;
    const content = (
        <>
            <MenuIcon icon={item.icon} />
            <span className="flex-1 truncate">{item.title}</span>
        </>
    );

    if (item.children?.length) {
        return (
            <Collapsible asChild>
                <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                        <SidebarMenuButton type="button" tooltip={item.title} className={`${menuButtonClass} group/submenu`}>
                            {content}
                            <ChevronRight className="ml-auto size-4 transition-transform duration-200 group-data-[collapsible=icon]:hidden group-data-[state=open]/submenu:rotate-90" />
                        </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="group-data-[collapsible=icon]:hidden">
                        <ul className="border-sidebar-border mt-1 ml-[21px] flex flex-col gap-0.5 border-l pl-3">
                            {item.children.map((child) => (
                                <SubmenuItem key={child.title} item={child} />
                            ))}
                        </ul>
                    </CollapsibleContent>
                </SidebarMenuItem>
            </Collapsible>
        );
    }

    return (
        <SidebarMenuItem>
            {item.href ? (
                <SidebarMenuButton asChild isActive={isActive} tooltip={item.title} className={menuButtonClass}>
                    <Link href={item.href} prefetch>
                        {content}
                    </Link>
                </SidebarMenuButton>
            ) : (
                <SidebarMenuButton type="button" tooltip={item.title} className={menuButtonClass}>
                    {content}
                </SidebarMenuButton>
            )}
        </SidebarMenuItem>
    );
}

export function NavMain({ sections }: { sections: SidebarNavSection[] }) {
    const page = usePage();
    const currentPath = page.url.split('?')[0];
    const permissions = new Set((page.props as { auth?: { permissions?: string[] } }).auth?.permissions ?? []);
    const visibleSections = sections
        .map((section) => ({
            ...section,
            items: section.items
                .filter((item) => !item.permission || permissions.has(item.permission))
                .map((item) => ({
                    ...item,
                    children: item.children?.filter((child) => !child.permission || permissions.has(child.permission)),
                })),
        }))
        .filter((section) => section.items.length > 0);

    return (
        <>
            {visibleSections.map((section) => (
                <SidebarGroup key={section.title} className="px-6 py-0 group-data-[collapsible=icon]:px-2">
                    <SidebarGroupLabel className="text-sidebar-foreground mt-5 mb-1 h-8 px-0 text-xs font-bold tracking-normal uppercase group-data-[collapsible=icon]:hidden">
                        {section.title}
                    </SidebarGroupLabel>
                    <SidebarMenu className="gap-0.5">
                        {section.items.map((item) => (
                            <NavMenuItem key={item.title} item={item} currentPath={currentPath} />
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            ))}
        </>
    );
}
