import { Icon } from '@iconify/react';
import type { ApexOptions } from 'apexcharts';

import { CardBox } from './card-box';
import { ClientChart } from './client-chart';

const series = [38, 40, 25];
const chartOptions: ApexOptions = {
    labels: ['2024', '2026', '2025'],
    chart: { type: 'donut', fontFamily: 'inherit', foreColor: '#adb0bb', offsetX: 18, toolbar: { show: false } },
    plotOptions: { pie: { startAngle: 0, endAngle: 360, donut: { size: '75%' } } },
    stroke: { show: false },
    dataLabels: { enabled: false },
    legend: { show: false },
    colors: ['#5d87ff', '#dbe5ff', '#49beff'],
    tooltip: { theme: 'dark', fillSeriesColor: false, y: { formatter: (value: number) => `${value} expedientes` } },
};

export function YearlyBreakup() {
    return (
        <CardBox>
            <div className="grid grid-cols-12">
                <div className="col-span-7 flex flex-col md:col-span-6">
                    <div>
                        <h2 className="mb-4 text-lg font-semibold lg:whitespace-nowrap">Distribución anual</h2>
                        <p className="mb-2 text-xl font-semibold">103 casos</p>
                        <div className="mb-3 flex items-center gap-2">
                            <span className="flex items-center justify-center rounded-full bg-[#13deb9]/10 p-1 dark:bg-[#13deb9]/20">
                                <Icon icon="tabler:arrow-up-left" className="text-[#13a98e]" />
                            </span>
                            <p className="text-muted-foreground">+9%</p>
                            <p className="text-muted-foreground">último año</p>
                        </div>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-4">
                        {[
                            ['2024', '#5d87ff'],
                            ['2025', '#49beff'],
                            ['2026', '#dbe5ff'],
                        ].map(([label, color]) => (
                            <div key={label} className="flex items-center">
                                <span className="me-2 size-2.5 rounded-full" style={{ backgroundColor: color }} />
                                <span className="text-muted-foreground text-xs">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="col-span-5 md:col-span-6">
                    <div className="flex justify-center">
                        <ClientChart options={chartOptions} series={series} type="donut" height={150} width={180} />
                    </div>
                </div>
            </div>
        </CardBox>
    );
}
