import dayjs, { ConfigType } from "dayjs";
import dayjsTimezone from "dayjs/plugin/timezone";
import dayjsUtc from "dayjs/plugin/utc";

dayjs.extend(dayjsUtc);
dayjs.extend(dayjsTimezone);

export const storeTimeZone = "America/Los_Angeles";

export const storeTime = (date?: ConfigType) =>
  (date ? dayjs(date) : dayjs()).utc().tz(storeTimeZone);

export const localeTimeFormated = (date?: ConfigType) =>
  (date ? dayjs(date) : dayjs()).format("MMM DD YYYY, HH:mm a");

const formatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  timeZone: storeTimeZone,
});

export const getMonthName = (date: string) => {
  return formatter
    ?.formatToParts(new Date(date))
    .find((part) => part.type === "month")?.value;
};
