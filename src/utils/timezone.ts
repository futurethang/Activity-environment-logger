import moment from "moment-timezone"

export function convertToUTC(time: any) {
  return moment
    .tz(time, "YYYY-MM-DDTHH:mm", "America/Los_Angeles")
    .utc()
    .format()
}

export function convertToPacificTime(utcTime: any) {
  return moment
    .utc(utcTime)
    .tz("America/Los_Angeles")
    .format("YYYY-MM-DDTHH:mm:ss")
}

export function roundToNearestHour(timestamp: any) {
  const date = new Date(timestamp)
  date.setMinutes(0, 0, 0) // Set minutes, seconds, and milliseconds to 0
  return convertToPacificTime(date)
}
