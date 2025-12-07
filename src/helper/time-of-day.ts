import { dayTime } from 'src/enum/daily-honey.enum';

export function getTimeOfDay() {
  const timeString = new Date().toLocaleTimeString('en-US', { hour12: true });

  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return dayTime.MORNING;
  } else if (hour >= 12 && hour < 17) {
    return dayTime.AFTERNOON;
  } else {
    return dayTime.EVENING;
  }
}

console.log(getTimeOfDay());
