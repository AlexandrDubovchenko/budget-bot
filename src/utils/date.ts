export const getCurrentMonthRange = () => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const fromTimestamp = Math.floor(startOfMonth.getTime());
  const toTimestamp = Math.floor(now.getTime());
  return [fromTimestamp, toTimestamp] as [number, number];
};
