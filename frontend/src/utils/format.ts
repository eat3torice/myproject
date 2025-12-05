// Format currency to VND
export const formatVND = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
};

// Format number to VND without symbol
export const formatVNDNumber = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN').format(amount);
};
