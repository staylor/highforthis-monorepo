export const formatDate = (d: Date) => {
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const year = d.getFullYear();
  return {
    month,
    monthName: d.toLocaleString('en-us', {
      month: 'long',
    }),
    year,
    formatted: `${month < 10 ? `0${month}` : month}/${day < 10 ? `0${day}` : day}`,
  };
};
