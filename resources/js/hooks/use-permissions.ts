import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

export function usePermissions() {
    const { auth } = usePage<SharedData>().props;
    const permissions = new Set(auth.permissions);

    return {
        can: (permission: string): boolean => permissions.has(permission),
        canAny: (requiredPermissions: string[]): boolean => requiredPermissions.some((permission) => permissions.has(permission)),
    };
}
