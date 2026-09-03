import { DashboardFooter } from './components/dashboard-footer';
import { DashboardStatistics } from './components/dashboard-statistics';
import { ProfileWelcome } from './components/profile-welcome';
import { TopCards } from './components/top-cards';
import type { DashboardData } from './types';

interface ModernDashboardProps {
    userName: string;
    dashboard: DashboardData;
}

export function ModernDashboard({ userName, dashboard }: ModernDashboardProps) {
    return (
        <div className="grid grid-cols-12 gap-6 p-4 md:p-6">
            <div className="col-span-12">
                <ProfileWelcome userName={userName} />
            </div>
            {dashboard.cards.length > 0 && (
                <div className="col-span-12 min-w-0">
                    <TopCards cards={dashboard.cards} />
                </div>
            )}
            {dashboard.sections.length > 0 && (
                <div className="col-span-12">
                    <DashboardStatistics sections={dashboard.sections} />
                </div>
            )}
            <div className="col-span-12 py-2">
                <DashboardFooter />
            </div>
        </div>
    );
}
