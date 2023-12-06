import { createClient } from "@supabase/supabase-js"
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
} from "recharts"
import { Context } from "./App"

const StackedLineGraph = () => {
  const [data, setData] = useState([])

  const timeRange = useContext(Context)

  const supabase = createClient(
    import.meta.env.VITE_KH_SUPA_URL,
    import.meta.env.VITE_KH_SUPA_KEY
  )

  useEffect(() => {
    console.log(supabase)
    console.log(timeRange)
    const fetchData = async () => {
      try {
        let { data, error } = await supabase
          .from("sensor_data")
          .select("*")
          .gt("minute", timeRange.start)
          .lt("minute", timeRange.end)
        // .limit(10)
        setData(data)
      } catch (error) {
        console.log(error)
      } finally {
      }
      console.log(data)
    }

    fetchData()
  }, [timeRange])

  const formatXAxis = (tickItem: any) => {
    // Use moment.js to format the date
    return moment(tickItem).format("MM-DD-HH")
  }

  return (
    <div>
      <div className="my-4">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={data}
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
