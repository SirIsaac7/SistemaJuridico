import { usePermissions } from '@/hooks/use-permissions';
import { type ReactNode } from 'react';

interface CanProps {
    permission: string;
    children: ReactNode;
    fallback?: ReactNode;
}

export function Can({ permission, children, fallback = null }: CanProps) {
    const { can } = usePermissions();

    return can(permission) ? children : fallback;
}
