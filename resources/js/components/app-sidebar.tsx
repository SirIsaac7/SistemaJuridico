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
                icon: 'solar:users-group-rounded-linear',
                children: [
                    { title: 'Listado de usuarios', href: '/users', permission: 'usuarios.ver' },
                    {
                        title: 'Reseteos de dispositivo',
                        href: '/users/device-reset-requests',
                        permission: 'usuarios.resetear-dispositivo',
                    },
                ],
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
                title: 'Libros',
                icon: 'solar:book-bookmark-linear',
                permission: 'libros.ver',
                children: [
                    { title: 'Mis materias', href: '/libros', permission: 'libros.solicitudes.ver-propias' },
                    { title: 'Mis solicitudes', href: '/libros/solicitudes', permission: 'libros.solicitudes.ver-propias' },
                    { title: 'Mis materias', href: '/libros/materias', permission: 'libros.materias.ver' },
                    { title: 'Solicitudes recibidas', href: '/libros/solicitudes-recibidas', permission: 'libros.solicitudes.ver-recibidas' },
                ],
            },
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
