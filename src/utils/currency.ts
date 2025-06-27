export const formatCurrency = (value: number) => {
    const formattedNumber = new Intl.NumberFormat('uk-UA', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);

    return `${formattedNumber} ₴`
}