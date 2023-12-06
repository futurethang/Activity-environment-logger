import { FormEvent, useState, createContext, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
import StackedLineGraph from "./StackedLineGraph"
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
  const [timeRange, setTimeRange] = useState({
    start: "2023-11-25",
    end: "2023-11-28",
  })

  const supabase = createClient(
    import.meta.env.VITE_KH_SUPA_URL,
    import.meta.env.VITE_KH_SUPA_KEY
  )

  useEffect(() => {
    const fetchData = async () => {
      try {
        let { data, error } = await supabase
          .from("activities")
          .select("*")
          .gt("timestamp", timeRange.start)
          .lt("timestamp", timeRange.end)
        // .limit(10)
        setActivityData(data)
      } catch (error) {
        console.log(error)
      } finally {
      }
      console.log(activityData)
    }

    fetchData()
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
      <Context.Provider value={timeRange}>
        <details className="mb-4 transition duration-500 ease-in-out">
          <summary className="font-bold">Activity + Sensor Graph</summary>
          <StackedLineGraph />
        </details>
        <details className="mb-4 transition duration-500 ease-in-out">
          <summary className="font-bold">Activities</summary>
          <div className="max-w-md w-full mx-auto">
            <ul>
              {activityData.map((activity: any) => {
                const formattedDate = moment(activity.timestamp).format(
                  "MM-DD-YYYY HH:mm:ss"
                )
                return (
                  <li>
                    <span>{activity.activity_type}</span>
                    <span className="ml-4">{formattedDate}</span>
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
