import { createClient } from "@supabase/supabase-js"
import React, { useEffect, useState } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"

const StackedLineGraph = () => {
  const [timeRange, setTimeRange] = useState({
    start: "2023-01-01",
    end: "2023-12-31",
  })

  const supabase = createClient(
    import.meta.env.VITE_CLASS_SUPA_URL,
    import.meta.env.VITE_CLASS_SUPA_KEY
  )

  useEffect(() => {
    console.log(supabase)
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("iot")
        .select("*")
        .limit(5)
        .then(({ data, error }) => {
          console.log(data)
          if (error) {
            console.error("Error:", error)
          } else {
            console.log("Data:", data)
          }
        })

      console.log(data)

      if (error) {
        console.error("Error fetching data", error)
        return
      }
    }

    fetchData()
  }, [])

  // Dummy data
  const data = [
    { date: "2023-01-01", value1: 4000, value2: 2400 },
    { date: "2023-02-01", value1: 3000, value2: 1398 },
    // ... more data points
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTimeRange({ ...timeRange, [e.target.name]: e.target.value })
  }

  return (
    <div>
      <div className="my-4">
        <LineChart
          width={320}
          height={300}
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="value1" stroke="#8884d8" />
          <Line type="monotone" dataKey="value2" stroke="#82ca9d" />
        </LineChart>
      </div>
      <div>
        <input
          type="date"
          name="start"
          value={timeRange.start}
          onChange={handleChange}
          className="border p-2 rounded-md"
        />
        <span className="mx-2">To</span>
        <input
          type="date"
          name="end"
          value={timeRange.end}
          onChange={handleChange}
          className="border p-2 rounded-md"
        />
      </div>
    </div>
  )
}

export default StackedLineGraph
