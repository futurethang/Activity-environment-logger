import moment from "moment"
import { useContext, useState } from "react"
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
import { convertToPacificTime, roundToNearestHour } from "./utils/timezone"
import { Activity, ContextType } from "./global"

type ExtendedActivity = Activity & { endTime: string }

const StackedLineGraph = () => {
  const { activityData, sensorData, timeScope } = useContext(Context)
  const [showTemperature, setShowTemperature] = useState(true)
  const [showHumidity, setShowHumidity] = useState(true)
  const [showCO2, setShowCO2] = useState(true)

  const formatXAxis = (tickItem: string) => {
    return moment(tickItem).format("hh:mm a")
  }

  const formattedActivities = activityData.map(
    (activity: Activity): ExtendedActivity => {
      // Convert the start timestamp to Pacific Time
      const startTimeMoment = convertToPacificTime(activity.timestamp)

      // Add the duration in milliseconds to the start time
      const endTimeMoment = moment(startTimeMoment, "YYYY-MM-DDTHH:mm:ss").add(
        activity.duration,
        "milliseconds"
      )

      // Convert the end time to Pacific Time
      const endTime = convertToPacificTime(endTimeMoment.format())

      return { ...activity, endTime }
    }
  )

  return (
    <div>
      <div className="chart-controls">
        {/* Toggle controls */}
        <label>
          <input
            type="checkbox"
            checked={showTemperature}
            onChange={() => setShowTemperature(!showTemperature)}
          />
          Temperature
        </label>
        <label>
          <input
            type="checkbox"
            checked={showHumidity}
            onChange={() => setShowHumidity(!showHumidity)}
          />
          Humidity
        </label>
        <label>
          <input
            type="checkbox"
            checked={showCO2}
            onChange={() => setShowCO2(!showCO2)}
          />
          CO2
        </label>
        {/* ... other toggles */}
      </div>

      <div className="my-4">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={sensorData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey={timeScope} tickFormatter={formatXAxis} />

            {/* Independent Y Axis for CO2 */}
            {showCO2 && (
              <YAxis
                yAxisId="left"
                orientation="left"
                domain={["dataMin - 500", "dataMax + 500"]}
                label={{ value: "CO2 ppm", angle: -90, position: "insideLeft" }}
              />
            )}

            {/* Independent Y Axis for Temperature */}
            {showTemperature && (
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={["dataMin - 10", "dataMax + 10"]}
                label={{
                  value: "Temperature C°",
                  angle: -90,
                  position: "insideRight",
                }}
              />
            )}

            {/* Independent Y Axis for Humidity */}
            {showHumidity && (
              <YAxis
                yAxisId="right2"
                orientation="right"
                domain={["dataMin - 10", "dataMax + 10"]}
                label={{
                  value: "Humidity %",
                  angle: -90,
                  position: "insideRight",
                }}
                axisLine={false}
                tickLine={false}
              />
            )}

            {/* Lines */}
            {showCO2 && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey={timeScope === "minute" ? "co2_ppm" : "average_co2_ppm"}
                stroke="#82ca9d"
                dot={false}
              />
            )}
            {showTemperature && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey={
                  timeScope === "minute"
                    ? "temperature_c"
                    : "average_temperature"
                }
                stroke="#8884d8"
                dot={false}
              />
            )}
            {showHumidity && (
              <Line
                yAxisId="right2"
                type="monotone"
                dataKey={
                  timeScope === "minute"
                    ? "humidity_relative"
                    : "average_humidity"
                }
                stroke="#9fc5e8"
                dot={false}
              />
            )}

            <Tooltip />
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
  timeScope: ContextType["timeScope"]
) => {
  let baseline = 0

  return formattedActivities.map((activity) => {
    baseline += 10
    console.log({ activity })
    return timeScope === "minute" ? (
      <ReferenceArea
        x1={activity.timestamp.toString()}
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
