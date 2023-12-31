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
  // ReferenceLine,
} from "recharts"
import { Context } from "./App"
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
      const startTimeMoment = moment(activity.rounded_timestamp)
      const endTime = startTimeMoment
        .clone()
        .add(activity.duration, "milliseconds")
        .startOf("minute")

      return {
        ...activity,
        timestamp: startTimeMoment.format("YYYY-MM-DDTHH:mm:ss"),
        endTime: endTime.format("YYYY-MM-DDTHH:mm:ss"),
      }
    }
  )

  return (
    <div>
      <div className="chart-controls flex gap-2">
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
                tickFormatter={(tickItem) => `${Math.floor(tickItem)} C°`}
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
                tickFormatter={(tickItem) => `${Math.floor(tickItem)} C°`}
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
                dataKey={
                  timeScope === "rounded_minute" ? "co2_ppm" : "average_co2_ppm"
                }
                stroke="#82ca9d"
                dot={false}
              />
            )}
            {showTemperature && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey={
                  timeScope === "rounded_minute"
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
                  timeScope === "rounded_minute"
                    ? "humidity_relative"
                    : "average_humidity"
                }
                stroke="#9fc5e8"
                dot={false}
              />
            )}

            <Tooltip content={<CustomTooltip />} />
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
  const baseLineIncrement = 400

  return formattedActivities.map((activity) => {
    baseline += baseLineIncrement
    console.log({ activity })
    return timeScope === "rounded_minute" ? (
      <ReferenceArea
        x1={activity.rounded_timestamp}
        x2={activity.endTime}
        yAxisId={"left"}
        y1={baseline}
        y2={baseline + baseLineIncrement}
        ifOverflow="extendDomain"
        label={toTitleCase(activity.activity_type || "")}
        strokeOpacity={0.3}
        fill="green"
        fillOpacity={0.5}
        key={`${activity.timestamp}-${activity.endTime}`}
      />
    ) : null
    // <ReferenceLine
    //   x={moment(roundToNearestHour(activity.rounded_timestamp)).format(
    //     "hh:mm a"
    //   )}
    //   stroke="green"
    //   label={{
    //     value: activity.activity_type || "Unknown",
    //   }}
    //   strokeOpacity={0.7}
    // />
  })
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="custom-tooltip">
        <p>{`Timestamp: ${moment(data.rounded_minute).format(
          "DD hh:mm a"
        )}`}</p>
        <p>{`Temperature: ${data.temperature_c} C°`}</p>
        <p>{`Humidity: ${data.humidity_relative} %`}</p>
        <p>{`CO2: ${data.co2_ppm} ppm`}</p>
      </div>
    )
  }

  return null
}

function toTitleCase(str: string) {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  })
}
