import { CasePerformance } from './components/case-performance';
import { DashboardFooter } from './components/dashboard-footer';
import { MonthlyEarning } from './components/monthly-earning';
import { ProfileWelcome } from './components/profile-welcome';
import { RecentActivity } from './components/recent-activity';
import { RevenueUpdate } from './components/revenue-update';
import { TopCards } from './components/top-cards';
import { YearlyBreakup } from './components/yearly-breakup';

interface ModernDashboardProps {
    userName: string;
}

export function ModernDashboard({ userName }: ModernDashboardProps) {
    return (
        <div className="grid grid-cols-12 gap-6 p-4 md:p-6">
            <div className="col-span-12">
                <ProfileWelcome userName={userName} />
            </div>
            <div className="col-span-12 min-w-0">
                <TopCards />
            </div>
            <div className="col-span-12 flex lg:col-span-8">
                <RevenueUpdate />
            </div>
            <div className="col-span-12 lg:col-span-4">
                <YearlyBreakup />
                <MonthlyEarning />
            </div>
            <div className="col-span-12 lg:col-span-4">
                <RecentActivity />
            </div>
            <div className="col-span-12 flex lg:col-span-8">
                <CasePerformance />
            </div>
            <div className="col-span-12 py-2">
                <DashboardFooter />
            </div>
        </div>
    );
}
