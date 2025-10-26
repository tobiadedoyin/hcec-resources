export const generateTrxReference = (
  timestamp = Date.now(),
) => {
  const timePart = timestamp.toString().slice(-5);
  const rand = Math.random().toString(36).substring(2, 5).toUpperCase();

  return `TX-${timePart}-${rand}`;
};
