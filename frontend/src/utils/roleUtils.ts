// Role constants
export const ROLES = {
    ADMIN: 1,
    EMPLOYEE: 18,
} as const;

// Role checking utilities
export const getUserRole = (): number | null => {
    const role = localStorage.getItem('userRole');
    return role ? parseInt(role) : null;
};

export const isAdmin = (): boolean => {
    return getUserRole() === ROLES.ADMIN;
};

export const isEmployee = (): boolean => {
    return getUserRole() === ROLES.EMPLOYEE;
};

export const hasAdminAccess = (): boolean => {
    const role = getUserRole();
    return role === ROLES.ADMIN || role === ROLES.EMPLOYEE;
};