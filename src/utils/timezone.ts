import moment from "moment-timezone"

export function convertToUTC(time: string) {
  const formatted = moment.tz(time, "America/Los_Angeles").utc().format()
  return formatted
}

export function convertToPacificTime(utcTime: string) {
  return moment
    .utc(utcTime)
    .tz("America/Los_Angeles")
    .format("YYYY-MM-DDTHH:mm:ss")
}

export function millisecondsToMinutes(milliseconds: number) {
  return milliseconds / 1000 / 60
}

export function roundToNearestHour(timestamp: string) {
  const date = new Date(timestamp)
  date.setMinutes(0, 0, 0)
  return convertToPacificTime(date.toISOString())
}

export const roundTime = function (
  timestamp: string | null,
  roundMins: number,
  roundUp?: boolean
) {
  if (!timestamp) return null
  if (roundUp == true) {
    const date = new Date(timestamp)
    const ms = 1000 * 60 * roundMins
    return new Date(Math.ceil(date.getTime() / ms) * ms).toISOString()
  } else {
    const date = new Date(timestamp)
    const ms = 1000 * 60 * roundMins
    return new Date(Math.round(date.getTime() / ms) * ms).toISOString()
  }
}
