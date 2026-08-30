export interface UserRole {
    id: number;
    name: string;
}

export interface UserRoleOption extends UserRole {
    users_count: number;
}

export interface ManagedUser {
    id: number;
    name: string;
    email: string;
    initials: string;
    is_active: boolean;
    is_deleted: boolean;
    created_at: string | null;
    deleted_at: string | null;
    role: UserRole | null;
    is_current_user: boolean;
    can: {
        update: boolean;
        delete: boolean;
        update_status: boolean;
        assign_role: boolean;
        restore: boolean;
    };
}
