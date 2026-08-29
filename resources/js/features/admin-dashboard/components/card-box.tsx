import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { ComponentProps } from 'react';

export function CardBox({ className, ...props }: ComponentProps<typeof Card>) {
    return <Card className={cn('border-border bg-card w-full rounded-lg border p-6 shadow-none', className)} {...props} />;
}
