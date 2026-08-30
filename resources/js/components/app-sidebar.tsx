import { NavMain, type SidebarNavSection } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Link } from '@inertiajs/react';
import AppLogo from './app-logo';

const navSections: SidebarNavSection[] = [
    {
        title: 'Inicio',
        items: [
            {
                title: 'Panel principal',
                href: '/dashboard',
                icon: 'solar:widget-2-linear',
            },
        ],
    },
    {
        title: 'Administración',
        items: [
            {
                title: 'Usuarios',
                href: '/users',
                icon: 'solar:users-group-rounded-linear',
                permission: 'usuarios.ver',
            },
            {
                title: 'Roles y permisos',
                href: '/roles',
                icon: 'solar:shield-user-linear',
                permission: 'roles.ver',
            },
        ],
    },
    {
        title: 'Gestión jurídica',
        items: [
            {
                title: 'Expedientes',
                icon: 'solar:server-linear',
                children: [{ title: 'Todos' }, { title: 'Activos' }, { title: 'Archivados' }],
            },
            { title: 'Clientes', icon: 'solar:user-circle-linear' },
            { title: 'Audiencias', icon: 'solar:calendar-linear' },
            { title: 'Calendario', icon: 'solar:calendar-date-linear' },
        ],
    },
    {
        title: 'Documentación',
        items: [
            { title: 'Documentos', icon: 'solar:documents-linear' },
            { title: 'Normativa', icon: 'solar:notes-linear' },
            { title: 'Notificaciones', icon: 'solar:bell-linear' },
        ],
    },
    {
        title: 'Herramientas',
        items: [
            { title: 'Buscador normativo', icon: 'solar:magnifer-linear' },
            { title: 'Generador de escritos', icon: 'solar:document-add-linear' },
            { title: 'Analítica jurídica', icon: 'solar:pie-chart-2-linear' },
        ],
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="sidebar" className="border-border bg-sidebar border-r">
            <SidebarHeader className="h-[86px] justify-center px-6 group-data-[collapsible=icon]:px-2">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            className="h-14 gap-3 p-0 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-11! hover:bg-transparent data-[state=open]:bg-transparent"
                        >
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="gap-0 overflow-y-auto pb-4 [scrollbar-color:color-mix(in_oklab,var(--sidebar-foreground)_18%,transparent)_transparent] [scrollbar-width:thin]">
                <NavMain sections={navSections} />
            </SidebarContent>

            <SidebarFooter className="border-sidebar-border border-t px-4 py-4 group-data-[collapsible=icon]:px-2">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
