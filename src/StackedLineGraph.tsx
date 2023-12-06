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
} from "recharts"
import { Context } from "./App"

const StackedLineGraph = () => {
  // const [data, setData] = useState({})
  const { activityData, sensorData } = useContext(Context)

  const formatXAxis = (tickItem: any) => {
    console.log(tickItem)
    return moment(tickItem).format("DD")
  }

  const formattedActivities = activityData.map((activity) => {
    const endTimeMoment = moment
      .utc(activity.timestamp)
      .add(activity.duration, "minutes")

    // Manually format the string to keep the UTC offset
    const endTime = endTimeMoment.format("YYYY-MM-DDTHH:mm:ss+00:00")

    return { ...activity, endTime }
  })

  console.log(sensorData)
  return (
    <div>
      <div className="my-4">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={sensorData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="minute" tickFormatter={formatXAxis} />
            <YAxis
              label={{
                value: "Temperature (°C)",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="Temperature (C) - median"
              stroke="#8884d8"
              dot={false}
            />
            {formattedActivities.map((activity) => {
              // debugger
              console.log(activity.timestamp, activity.endTime)
              console.log(activity.activity_type)
              return (
                <ReferenceArea
                  x1={activity.timestamp}
                  x2={activity.endTime}
                  ifOverflow="extendDomain"
                  label={activity.activity_type}
                  strokeOpacity={0.3}
                  fill="green"
                  fillOpacity={0.3}
                />
              )
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default StackedLineGraph

// {
//   "minute": "2023-11-25T18:11:00+00:00",
//   "device_id": "KevinHydeIoT",
//   "Temperature (C) - median": 24.1689,
//   "CO2 (ppm) - median": null,
//   "Relative Humidity (%) - median": 36.8653,
//   "PM2.5 - median": null,
//   "PM10.0 - median": null,
//   "Battery (V) - median": 4.2175,
//   "Battery (%) - median": 103.828
// }
