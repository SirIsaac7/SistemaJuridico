import type { ApexOptions } from 'apexcharts';
import { useEffect, useState, type ComponentType } from 'react';

type ChartType = 'area' | 'bar' | 'donut';

interface ClientChartProps {
    options: ApexOptions;
    series: NonNullable<ApexOptions['series']>;
    type: ChartType;
    height: number | string;
    width?: number | string;
}

type ApexChartComponent = ComponentType<ClientChartProps>;

export function ClientChart(props: ClientChartProps) {
    const [Chart, setChart] = useState<ApexChartComponent | null>(null);

    useEffect(() => {
        let isMounted = true;

        void import('react-apexcharts').then((module) => {
            if (isMounted) {
                setChart(() => module.default as ApexChartComponent);
            }
        });

        return () => {
            isMounted = false;
        };
    }, []);

    if (!Chart) {
        return <div className="bg-muted/60 w-full animate-pulse rounded-md" style={{ height: props.height }} aria-hidden="true" />;
    }

    return <Chart {...props} />;
}
