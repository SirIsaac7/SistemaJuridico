import { ModernDashboard } from '@/features/admin-dashboard/modern-dashboard';
import type { DashboardData } from '@/features/admin-dashboard/types';
import { PublicDashboard } from '@/features/public-dashboard/public-dashboard';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard({ dashboard }: { dashboard: DashboardData }) {
    const { auth } = usePage<SharedData>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard">
                <meta name="description" content="Panel principal de gestión de Normativa Virtual" />
            </Head>
            {auth.roles.length === 0 ? (
                <PublicDashboard userName={auth.user.name} />
            ) : (
                <ModernDashboard userName={auth.user.name} dashboard={dashboard} />
            )}
        </AppLayout>
    );
}
