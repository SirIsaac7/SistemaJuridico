import { ModernDashboard } from '@/features/admin-dashboard/modern-dashboard';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    const { auth } = usePage<SharedData>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard">
                <meta name="description" content="Panel principal de gestión del Sistema Jurídico" />
            </Head>
            <ModernDashboard userName={auth.user.name} />
        </AppLayout>
    );
}
