import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
import StackedLineGraph from "./StackedLineGraph"
import { convertToPacificTime, convertToUTC } from "./utils/timezone"
import moment from "moment"
import Header from "./Header"
import "react-awesome-button/dist/styles.css" // Import default styles
import Modal from "react-modal"
import { Activity, ContextType, TimeScope } from "./global"
import React from "react"
import ActivityUi from "./ActivityUi"

export const Context = React.createContext<ContextType>({
  activityData: [],
  sensorData: [],
  timeScope: "minute",
})

Modal.setAppElement("#root")

function App() {
  const [activityData, setActivityData] = useState<Activity[]>([])
  const [sensorData, setSensorData] = useState([])
  const [timeScope, setTimeScope] = useState("minute")
  const [timeRange, setTimeRange] = useState<TimeScope>({})

  const supabase = createClient(
    import.meta.env.VITE_KH_SUPA_URL,
    import.meta.env.VITE_KH_SUPA_KEY
  )

  // TODO: put this in action when DB is updated to real time, not a HEX dump
  // useLayoutEffect(() => {
  //   const now = new Date()
  //   const sixteenHoursAgo = new Date(now.getTime() - 1000 * 60 * 60 * 16)

  //   setTimeRange({
  //     start: sixteenHoursAgo.toISOString(),
  //     end: now.toISOString(),
  //   })

  //   console.log("timeRange", timeRange)
  // }, [])

  const resetTimeRange = () => {
    const now = new Date()
    const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000) // 12 hours in milliseconds

    const startPacificTime = convertToPacificTime(twelveHoursAgo.toISOString())
    const endPacificTime = convertToPacificTime(now.toISOString())

    setTimeRange({
      start: startPacificTime,
      end: endPacificTime,
    })
  }

  useEffect(() => {
    resetTimeRange()
  }, [])

  useEffect(() => {
    const pstStart = convertToUTC(timeRange.start)
    const pstEnd = convertToUTC(timeRange.end)

    const fetchActivityData = async (): Promise<Activity[]> => {
      try {
        const { data } = await supabase
          .from("activities")
          .select("*")
          .gt("timestamp", pstStart)
          .lt("timestamp", pstEnd)

        return data || []
      } catch (error) {
        console.log("error", error)
        throw error
      }
    }

    const fetchSensorData = async () => {
      const start_date = new Date(pstStart)
      const end_date = new Date(pstEnd)

      const diffInMilliseconds = Math.abs(
        end_date.getTime() - start_date.getTime()
      )
      const diffInMinutes = Math.floor(diffInMilliseconds / 1000 / 60)

      let scopedData

      if (diffInMinutes < 1000) {
        setTimeScope("minute")
        console.log("less than 1000 minutes")

        try {
          const { data } = await supabase
            .from("sensor_data_4")
            .select("*")
            .gt("minute", start_date.toISOString())
            .lt("minute", end_date.toISOString())

          scopedData = data
        } catch (error) {
          console.log("error", error)
          throw error
        }
      } else if (diffInMinutes < 1000 * 24) {
        setTimeScope("hour")
        console.log("more than 1000 minutes")
        try {
          const { data } = await supabase
            // RPC STYLE REQUEST TO GET BY HOUR
            // TODO: Update to sensor_data_4
            .rpc("get_sensor_data_by_hour", {
              start_date,
              end_date,
            })
          scopedData = data
        } catch (error) {
          console.log("error", error)
          throw error
        }
      }

      return scopedData
    }

    Promise.all([fetchActivityData(), fetchSensorData()])
      .then(([aData, sData]) => {
        setActivityData(aData)
        setSensorData(sData)
      })
      .catch((error) => {
        console.log("An error occurred:", error)
      })
  }, [timeRange])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTimeRange({ ...timeRange, [e.target.name]: e.target.value })
  }

  const shiftTimeRange = (direction: "forward" | "backward") => {
    const startDate = new Date(timeRange.start!)
    const endDate = new Date(timeRange.end!)

    if (direction === "forward") {
      startDate.setHours(startDate.getHours() + 6)
      endDate.setHours(endDate.getHours() + 6)
    } else if (direction === "backward") {
      startDate.setHours(startDate.getHours() - 6)
      endDate.setHours(endDate.getHours() - 6)
    }

    setTimeRange({
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    })
  }

  return (
    <div className="App p-8 w-full sm:w-[600px] mx-auto">
      <Header />
      <ActivityUi supabase={supabase} />
      <div className="mb-4 mt-8">
        <input
          type="datetime-local"
          name="start"
          placeholder={timeRange.start}
          value={timeRange.start}
          onChange={handleChange}
          className="border p-2 rounded-md"
        />
        <span className="mx-2">To</span>
        <input
          type="datetime-local"
          name="end"
          placeholder={timeRange.end}
          value={timeRange.end}
          onChange={handleChange}
          className="border p-2 rounded-md"
        />
      </div>
      <div className="bg-slate-900 p-2 w-full text-center my-4 rounded-md text-white">
        <h2>
          Showing data from {timeRange.start} - {timeRange.end}
        </h2>
      </div>
      <div className="w-full flex justify-between">
        <button onClick={() => shiftTimeRange("backward")}>6 hours ⬅️</button>
        <button onClick={() => shiftTimeRange("forward")}>6 hours ➡️</button>
      </div>
      <Context.Provider value={{ activityData, sensorData, timeScope }}>
        <StackedLineGraph />
        <details open className="mb-4 transition duration-500 ease-in-out">
          <summary className="font-bold">Activities</summary>
          <div className=" w-full">
            <ul>
              {activityData.map((activity: Activity, i) => {
                const formattedDate = moment(
                  convertToPacificTime(activity.timestamp)
                ).format("MM/DD hh:mm a")
                return (
                  <li
                    key={`${activity.timestamp}-${i}`}
                    className="grid grid-cols-4 gap-2 mb-1 font-roboto-mono text-xs"
                  >
                    <span className="ml-4">{formattedDate}</span>
                    <span className="font-bold">{activity.activity_type}</span>
                    <span className="ml-4">
                      for {activity.duration} minutes
                    </span>
                    <div className="flex justify-end">
                      <button className="bg-blue-400 text-xs p-1 w-12 h-8 rounded-sm">
                        edit
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        </details>
      </Context.Provider>
    </div>
  )
}

export default App
