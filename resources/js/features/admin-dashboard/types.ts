export interface DashboardCardData {
    key: string;
    title: string;
    value: number;
    tone: DashboardTone;
}

export interface DashboardStatisticItem {
    label: string;
    value: number;
    tone: DashboardTone;
}

export interface DashboardStatisticSection {
    key: string;
    title: string;
    description: string;
    items: DashboardStatisticItem[];
}

export interface DashboardData {
    cards: DashboardCardData[];
    sections: DashboardStatisticSection[];
}

export type DashboardTone = 'blue' | 'cyan' | 'green' | 'violet' | 'amber' | 'red' | 'slate';
