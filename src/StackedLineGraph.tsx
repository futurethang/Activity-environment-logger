import moment from "moment"
import { useContext } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  ReferenceLine,
} from "recharts"
import { Context } from "./App"
import { roundToNearestHour } from "./utils/timezone"
import { Activity } from "./global"

type ExtendedActivity = Activity & { endTime: string }

const StackedLineGraph = () => {
  const { activityData, sensorData, timeScope } = useContext(Context)

  const formatXAxis = (tickItem: string) => {
    return moment(tickItem).format("hh:mm a")
  }

  const formattedActivities = activityData.map(
    (activity: Activity): ExtendedActivity => {
      const endTimeMoment = moment
        .utc(activity.timestamp)
        .add(activity.duration, "minutes")

      const endTime = endTimeMoment.format("YYYY-MM-DDTHH:mm:ss+00:00")

      return { ...activity, endTime }
    }
  )

  return (
    <div>
      <div className="my-4">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={sensorData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey={timeScope} tickFormatter={formatXAxis} />
            <YAxis
              label={{
                value: "Temperature C° / Humidity %",
                angle: -90,
              }}
            />
            <Tooltip />
            <Line
              type="monotone"
              dataKey={
                timeScope === "minute" ? "temperature_c" : "average_temperature"
              }
              stroke="#8884d8"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey={
                timeScope === "minute"
                  ? "humidity_relative"
                  : "average_humidity"
              }
              stroke="#9fc5e8"
              dot={false}
            />
            {stackAreas(formattedActivities, timeScope)}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default StackedLineGraph

const stackAreas = (
  formattedActivities: ExtendedActivity[],
  timeScope: string
) => {
  let baseline = 0

  return formattedActivities.map((activity) => {
    baseline += 10
    return timeScope === "minute" ? (
      <ReferenceArea
        x1={activity.timestamp}
        x2={activity.endTime}
        y1={baseline}
        y2={baseline + 10}
        ifOverflow="extendDomain"
        label={toTitleCase(activity.activity_type || "")}
        strokeOpacity={0.3}
        fill="green"
        fillOpacity={0.5}
      />
    ) : (
      <ReferenceLine
        x={moment(roundToNearestHour(activity.timestamp)).format("hh:mm a")}
        stroke="green"
        label={{
          value: activity.activity_type || "Unknown",
        }}
        strokeOpacity={0.7}
      />
    )
  })
}

function toTitleCase(str: string) {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  })
}
