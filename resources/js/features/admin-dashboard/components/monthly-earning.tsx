import { Icon } from '@iconify/react';
import type { ApexOptions } from 'apexcharts';

import { CardBox } from './card-box';
import { ClientChart } from './client-chart';

const series = [{ name: 'Honorarios mensuales', color: '#49beff', data: [25, 66, 20, 40, 12, 58, 20] }];
const chartOptions: ApexOptions = {
    chart: { type: 'area', sparkline: { enabled: true }, group: 'sparklines', fontFamily: 'inherit', foreColor: '#adb0bb' },
    stroke: { curve: 'smooth', width: 2 },
    fill: { type: 'gradient', gradient: { shadeIntensity: 0, inverseColors: false, opacityFrom: 0.1, opacityTo: 0, stops: [20, 100] } },
    markers: { size: 0 },
    tooltip: {
        theme: 'dark',
        fixed: { enabled: true, position: 'right' },
        x: { show: false },
        y: { formatter: (value: number) => `Bs ${value.toLocaleString('es-BO')} mil` },
    },
};

export function MonthlyEarning() {
    return (
        <CardBox className="mt-6 p-0">
            <div className="p-[30px] pb-0">
                <div className="grid grid-cols-12 gap-6">
                    <div className="col-span-8">
                        <h2 className="mb-4 text-lg font-semibold">Honorarios mensuales</h2>
                        <p className="mb-3 text-xl font-semibold">Bs 6.820</p>
                        <div className="mb-3 flex items-center gap-2">
                            <span className="flex items-center justify-center rounded-full bg-[#ef4444]/10 p-1 dark:bg-[#ef4444]/20">
                                <Icon icon="tabler:arrow-down-right" className="text-[#ef4444]" />
                            </span>
                            <p className="text-muted-foreground">+9%</p>
                            <p className="text-muted-foreground">gestión anterior</p>
                        </div>
                    </div>
                    <div className="col-span-4">
                        <div className="flex justify-end">
                            <div className="flex size-11 items-center justify-center rounded-full bg-[#49beff] text-white">
                                <Icon icon="tabler:currency-boliviano" className="text-xl" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ClientChart options={chartOptions} series={series} type="area" height={60} width="100%" />
        </CardBox>
    );
}
