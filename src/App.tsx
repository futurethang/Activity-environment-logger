import { FormEvent, useState, createContext, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
import StackedLineGraph from "./StackedLineGraph"
import { convertToPacificTime, convertToUTC } from "./utils/timezone"
import moment from "moment"

export const Context = createContext({})

function App() {
  const [timestamp, setTimestamp] = useState("")
  const [userId, setUserId] = useState("")
  const [activityType, setActivityType] = useState("")
  const [duration, setDuration] = useState("")
  const [additionalNotes, setAdditionalNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState("")
  const [activityData, setActivityData] = useState([])
  const [sensorData, setSensorData] = useState([])
  const [timeScope, setTimeScope] = useState("minute")
  const [timeRange, setTimeRange] = useState({
    start: "2023-12-02 01:30:00",
    end: "2023-12-02 13:30:00",
  })

  const supabase = createClient(
    import.meta.env.VITE_KH_SUPA_URL,
    import.meta.env.VITE_KH_SUPA_KEY
  )

  useEffect(() => {
    const pstStart = convertToUTC(timeRange.start)
    const pstEnd = convertToUTC(timeRange.end)

    const fetchActivityData = async () => {
      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .gt("timestamp", pstStart)
        .lt("timestamp", pstEnd)

      if (error) {
        throw error
      }
      return data
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
        // remove timezone from start_date

        const { data, error } = await supabase
          // OLD REQUEST BEFORE HOUR SUMMARY RPC WAS CREATED
          .from("sensor_data_2")
          .select("*")
          .gt("minute", start_date.toISOString())
          .lt("minute", end_date.toISOString())

        scopedData = data
      } else if (diffInMinutes < 1000 * 24) {
        setTimeScope("hour")
        console.log("less than 1000 hours")
        const { data, error } = await supabase
          // RPC STYLE REQUEST TO GET BY HOUR
          .rpc("get_sensor_data_by_hour", {
            start_date,
            end_date,
          })
        scopedData = data
      }

      console.log(scopedData)
      return scopedData
    }

    Promise.all([fetchActivityData(), fetchSensorData()])
      .then(([aData, sData]) => {
        // @ts-ignore
        setActivityData(aData)
        // @ts-ignore
        setSensorData(sData)
      })
      .catch((error) => {
        console.log("An error occurred:", error)
      })
  }, [timeRange])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTimeRange({ ...timeRange, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const { data, error } = await supabase.from("activities").insert([
      {
        timestamp,
        user_id: parseInt(userId),
        activity_type: activityType,
        duration: parseInt(duration),
        additional_notes: additionalNotes,
      },
    ])

    setSubmitting(false)

    if (error) {
      setMessage(`Error: ${error.message}`)
    } else {
      setMessage("Activity logged successfully!")
      // Clear form fields after successful submission
      setTimestamp("")
      setUserId("")
      setActivityType("")
      setDuration("")
      setAdditionalNotes("")
    }
  }

  return (
    <div className="App p-4 w-full">
      <details className="mb-4">
        <summary className="font-bold">Add Activity Log</summary>
        <p className="text-sm">
          Add a new activity log by filling out the form below.{" "}
        </p>
        <form onSubmit={handleSubmit} className="max-w-md w-full">
          <h1 className="text-lg font-bold mb-4">Log Activity</h1>

          {message && <p>{message}</p>}

          <div className="mb-2">
            <label htmlFor="timestamp" className="block">
              Timestamp:
            </label>
            <input
              type="datetime-local"
              id="timestamp"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              className="border p-2 w-full rounded-md"
              required
            />
          </div>

          <div className="mb-2">
            <label htmlFor="userId" className="block">
              User ID:
            </label>
            <input
              type="number"
              id="userId"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="border p-2 w-full rounded-md"
              required
            />
          </div>

          <div className="mb-2">
            <label htmlFor="activityType" className="block">
              Activity Type:
            </label>
            <input
              type="text"
              id="activityType"
              value={activityType}
              onChange={(e) => setActivityType(e.target.value)}
              className="border p-2 w-full rounded-md"
              required
            />
          </div>

          <div className="mb-2">
            <label htmlFor="duration" className="block">
              Duration (minutes):
            </label>
            <input
              type="number"
              id="duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="border p-2 w-full rounded-md"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="additionalNotes" className="block">
              Additional Notes:
            </label>
            <textarea
              id="additionalNotes"
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              className="border p-2 w-full rounded-md"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-500 text-white p-2 w-full"
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </form>
      </details>
      <div className="mb-4">
        <input
          type="datetime-local"
          name="start"
          value={timeRange.start}
          onChange={handleChange}
          className="border p-2 rounded-md"
        />
        <span className="mx-2">To</span>
        <input
          type="datetime-local"
          name="end"
          value={timeRange.end}
          onChange={handleChange}
          className="border p-2 rounded-md"
        />
      </div>
      <Context.Provider value={{ activityData, sensorData, timeScope }}>
        <details open className="mb-4 transition duration-500 ease-in-out">
          <summary className="font-bold">Activity + Sensor Graph</summary>
          <StackedLineGraph />
        </details>
        <details open className="mb-4 transition duration-500 ease-in-out">
          <summary className="font-bold">Activities</summary>
          <div className="max-w-md w-full mx-auto">
            <ul>
              {activityData.map((activity: any, i) => {
                const formattedDate = moment(
                  convertToPacificTime(activity.timestamp)
                ).format("MM/DD hh:mm a")
                return (
                  <li
                    key={`${activity.timestamp}-${i}`}
                    className="grid grid-flow-col gap-2"
                  >
                    <span className="ml-4">{formattedDate}</span>
                    <span>{activity.activity_type}</span>
                    <span className="ml-4">
                      for {activity.duration} minutes
                    </span>
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
