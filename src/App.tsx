import { FormEvent, useState } from "react"
import { createClient } from "@supabase/supabase-js"

function App() {
  const [timestamp, setTimestamp] = useState("")
  const [userId, setUserId] = useState("")
  const [activityType, setActivityType] = useState("")
  const [duration, setDuration] = useState("")
  const [additionalNotes, setAdditionalNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState("")

  // Create a single supabase client for interacting with your database
  const supabase = createClient(
    "https://malfkxxkovvrstcczuje.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hbGZreHhrb3Z2cnN0Y2N6dWplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDE0MDM5ODMsImV4cCI6MjAxNjk3OTk4M30.GhykOM7ewxL1Rldktfv0eH3VnpqT2gzRrIDiBHMBKI8"
  )

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

    console.log(data)

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
      <form onSubmit={handleSubmit} className="max-w-md w-full mx-auto">
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
            className="border p-2 w-full"
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
            className="border p-2 w-full"
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
            className="border p-2 w-full"
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
            className="border p-2 w-full"
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
            className="border p-2 w-full"
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
    </div>
  )
}

export default App
