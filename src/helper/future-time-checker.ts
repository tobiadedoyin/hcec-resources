import { DailyHoneyQuery } from "../modules/daily-honey/dto/get-daily-honey-query.dto";

const monthMap: { [key: string]: number } = {
  January: 0,
  February: 1,
  March: 2,
  April: 3,
  May: 4,
  June: 5,
  July: 6,
  August: 7,
  September: 8,
  October: 9,
  November: 10,
  December: 11,
};

export function isFutureDate(query: DailyHoneyQuery): boolean {
  if (!query.day || !query.month || !query.year) {
    throw new Error("Incomplete date");
  }

  const day = parseInt(query.day, 10);
  const month = monthMap[query.month];
  const year = query.year;

  if (month === undefined) {
    throw new Error("Invalid month");
  }

  const inputDate = new Date(year, month, day);
  const today = new Date();

  inputDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return inputDate > today;
}
