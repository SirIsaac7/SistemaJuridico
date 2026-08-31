import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { BookOpen, Plus } from 'lucide-react';

interface EmptyLibraryProps {
    title: string;
    description: string;
    actionHref?: string;
    actionLabel?: string;
}

export function EmptyLibrary({ title, description, actionHref, actionLabel = 'Agregar' }: EmptyLibraryProps) {
    return (
        <div className="flex min-h-80 flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-[#cfd8e7] bg-white px-6 py-14 text-center dark:border-[#3a465c] dark:bg-[#1c2536]">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-[#5d87ff]/12 text-[#5d87ff]">
                <BookOpen className="size-8" />
            </div>
            <div className="flex max-w-md flex-col gap-2">
                <h2 className="text-xl font-bold text-[#2a3547] dark:text-white">{title}</h2>
                <p className="text-sm leading-6 text-[#7c8fac]">{description}</p>
            </div>
            {actionHref && (
                <Button asChild className="mt-2 h-11 bg-[#5d87ff] px-5 text-white hover:bg-[#4d76e8]">
                    <Link href={actionHref} prefetch>
                        <Plus className="size-4" />
                        {actionLabel}
                    </Link>
                </Button>
            )}
        </div>
    );
}
