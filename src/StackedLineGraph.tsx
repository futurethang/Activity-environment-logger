import moment from "moment"
import { useContext, useEffect, useState } from "react"
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

const StackedLineGraph = () => {
  // const [data, setData] = useState({})
  const { activityData, sensorData, timeScope } = useContext(Context)

  const formatXAxis = (tickItem: any) => {
    // console.log(tickItem)
    // console.log(moment(tickItem).format("hh:mm a"))
    return moment(tickItem).format("hh:mm a")
  }

  const formattedActivities = activityData.map((activity) => {
    const endTimeMoment = moment
      .utc(activity.timestamp)
      .add(activity.duration, "minutes")

    // Manually format the string to keep the UTC offset
    const endTime = endTimeMoment.format("YYYY-MM-DDTHH:mm:ss+00:00")

    return { ...activity, endTime }
  })

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

const stackAreas = (formattedActivities, timeScope) => {
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
        // label={<CustomLabel yOffset={0} text={activity.activity_type} />}
        label={toTitleCase(activity.activity_type)}
        strokeOpacity={0.3}
        fill="green"
        fillOpacity={0.3}
      />
    ) : (
      <ReferenceLine
        x={moment(roundToNearestHour(activity.timestamp)).format("hh:mm a")}
        stroke="green"
        label={{
          value: activity.activity_type,
        }}
        strokeOpacity={0.7}
      />
    )
  })
}

function toTitleCase(str) {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  })
}

const CustomLabel = ({ yOffset, text }: { yOffset: number; text: string }) => {
  return (
    <text y={yOffset} dy={-4} fontSize={10} textAnchor="middle">
      {text}
    </text>
  )
}
