import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ApexOptions } from 'apexcharts';
import { useState } from 'react';

import { CardBox } from './card-box';
import { ClientChart } from './client-chart';

type Year = '2026' | '2025' | '2024';

const financialData: Record<Year, { income: number[]; expenses: number[] }> = {
    '2026': {
        income: [1500, 2700, 2200, 3000, 1500, 1000, 1400, 2400, 1900, 2300, 1400, 1100],
        expenses: [-1800, -1100, -2500, -1500, -600, -1800, -1200, -2300, -1900, -2300, -1200, -2500],
    },
    '2025': {
        income: [2000, 2500, 2800, 3000, 2000, 1500, 2300, 1500, 1000, 1400, 2400, 1900],
        expenses: [-1200, -1500, -2000, -1000, -800, -1300, -1500, -600, -1800, -1200, -2300, -1900],
    },
    '2024': {
        income: [1800, 2200, 2600, 3000, 1700, 1200, 2000, 2500, 2800, 1800, 2000, 1500],
        expenses: [-1500, -1300, -2200, -1200, -700, -1600, -1200, -1500, -2000, -1000, -800, -1300],
    },
};

const chartOptions: ApexOptions = {
    chart: { toolbar: { show: false }, type: 'bar', fontFamily: 'inherit', foreColor: '#7C8FAC', stacked: true, offsetX: -20 },
    colors: ['#5d87ff', '#49beff'],
    plotOptions: {
        bar: {
            horizontal: false,
            barHeight: '60%',
            columnWidth: '20%',
            borderRadius: 6,
            borderRadiusApplication: 'end',
            borderRadiusWhenStacked: 'all',
        },
    },
    dataLabels: { enabled: false },
    legend: { show: false },
    grid: { borderColor: 'rgba(124, 143, 172, 0.2)', strokeDashArray: 3 },
    xaxis: {
        categories: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
        axisBorder: { show: false },
        axisTicks: { show: false },
    },
    yaxis: {
        min: -3000,
        max: 3000,
        tickAmount: 6,
        labels: { formatter: (value: number) => `${value / 1000}k` },
    },
    tooltip: { theme: 'dark', y: { formatter: (value: number) => `Bs ${Math.abs(value).toLocaleString('es-BO')}` } },
};

export function RevenueUpdate() {
    const [year, setYear] = useState<Year>('2026');
    const series = [
        { name: 'Ingresos', data: financialData[year].income },
        { name: 'Gastos', data: financialData[year].expenses },
    ];

    return (
        <CardBox className="h-full pb-0">
            <div className="mb-6 items-center justify-between sm:flex">
                <div>
                    <h2 className="text-lg font-semibold">Ingresos y gastos</h2>
                    <p className="text-muted-foreground text-sm font-normal">Resumen financiero del estudio jurídico</p>
                </div>
                <Select value={year} onValueChange={(value) => setYear(value as Year)}>
                    <SelectTrigger className="mt-4 w-[140px] sm:mt-0" aria-label="Seleccionar gestión">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="tailwind-admin-portal">
                        <SelectItem value="2026">Gestión 2026</SelectItem>
                        <SelectItem value="2025">Gestión 2025</SelectItem>
                        <SelectItem value="2024">Gestión 2024</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <ClientChart options={chartOptions} series={series} type="bar" height={316} width="100%" />
        </CardBox>
    );
}
