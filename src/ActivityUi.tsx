import { SupabaseClient } from "@supabase/supabase-js"
import React, { useEffect, useState } from "react"
import { AwesomeButton } from "react-awesome-button"
import Modal from "react-modal"
import { Activity } from "./global"
import { millisecondsToMinutes } from "./utils/timezone"
import { format, parseISO } from "date-fns"
import { toTitleCase } from "./utils/textFormatting"

const customModalStyles = {
  content: {
    width: "75%",
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    borderRadius: "1rem",
    backgroundColor: "#00a896",
    padding: "1rem",
  },
}

const customStyles = {
  "--button-default-height": "72px",
  "--button-default-font-size": "20px",
  "--button-default-border-radius": "16px",
  "--button-horizontal-padding": "26px",
  "--button-raise-level": "10px",
  "--button-hover-pressure": "1.25",
  "--transform-speed": "0.225s",
  "--button-primary-color": "#00a896", // Blueish green color
  "--button-primary-color-dark": "#007f6b", // A darker shade for the hover state
  "--button-primary-color-light": "#fff", // A lighter shade for the active state
  "--button-primary-color-hover": "#00a896", // A lighter shade for the active state
  "--button-primary-color-active": "#007f6b", // A lighter shade for the active state
} as React.CSSProperties

export default function ActivityUi({ supabase }: { supabase: SupabaseClient }) {
  const [isInputModalOpen, setIsInputModalOpen] = useState(false)
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false)
  const [activityType, setActivityType] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState("")
  const [liveActivities, setLiveActivities] = useState<Activity[]>([])
  const [activityLog, setActivityLog] = useState<Activity[]>([])

  useEffect(() => {
    readLocalStorage()
  }, [])

  useEffect(() => {
    const fetchActivityData = async (): Promise<Activity[]> => {
      const end_date = new Date()
      const start_date = new Date(end_date.getTime() - 1000 * 60 * 60 * 24 * 30) // 30 days in milliseconds
      try {
        const { data } = await supabase.rpc("get_activity_data", {
          start_date,
          end_date,
        })
        return data
      } catch (error) {
        console.log("error", error)
        throw error
      }
    }

    if (!isLogsModalOpen) {
      return
    }

    fetchActivityData().then((data) => {
      setActivityLog(data)
    })
  }, [isLogsModalOpen])

  const readLocalStorage = () => {
    const clientLiveActivities = localStorage.getItem("liveActivities")
    if (!clientLiveActivities) {
      return
    }
    setLiveActivities(JSON.parse(clientLiveActivities))
  }

  const writeLocalStorage = (newActivity: Activity) => {
    console.log("newActivity", { ...liveActivities, newActivity })
    const newLiveActivities = [...liveActivities, newActivity]
    localStorage.setItem("liveActivities", JSON.stringify(newLiveActivities))
    setLiveActivities(newLiveActivities)
  }

  const quickLog = async () => {
    if (!activityType) {
      setMessage("Please enter an activity type.")
      return
    }

    setSubmitting(true)

    let activity: Activity

    try {
      const { data, error } = await supabase
        .from("activities")
        .insert([
          {
            timestamp: new Date(),
            user_id: 1,
            activity_type: activityType,
            duration: null,
            additional_notes: null,
          },
        ])
        .select()
      if (error) {
        console.error(`Error: ${error.message}`)
        setMessage(`Error: ${error.message}`)
        throw error
      }
      activity = data && data[0]
      writeLocalStorage(activity)
      setIsInputModalOpen(false)
      setActivityType("")
    } catch (error) {
      console.error(error)
    } finally {
      setSubmitting(false)
    }
  }

  const endActivity = async (activity: Activity) => {
    const duration = getDiff(activity.timestamp)
    const { data, error } = await supabase
      .from("activities")
      .update({ duration: duration })
      .eq("id", activity.id)
    console.info("data", data)
    if (error) {
      console.error(`Error: ${error.message}`)
    } else {
      console.log("Activity ended successfully!")
      const newLiveActivities = liveActivities.filter(
        (a) => a.timestamp !== activity.timestamp
      )
      setLiveActivities(newLiveActivities)
      localStorage.setItem("liveActivities", JSON.stringify(newLiveActivities))
    }
  }

  return (
    <>
      <div className="w-full flex justify-center gap-4 mb-4">
        <AwesomeButton
          style={customStyles}
          type="primary"
          onPress={() => {
            setIsInputModalOpen(true)
          }}
          disabled={isLogsModalOpen}
        >
          Log Activity
        </AwesomeButton>
        <AwesomeButton
          style={customStyles}
          type="secondary"
          onPress={() => {
            setIsLogsModalOpen(true)
          }}
          disabled={isInputModalOpen}
        >
          Activity Log
        </AwesomeButton>
      </div>

      {/* LOG A NEW ACTIVITY DIALOG */}
      <Modal
        isOpen={isInputModalOpen}
        onRequestClose={() => setIsInputModalOpen(false)}
        style={customModalStyles}
        contentLabel="Activity Modal"
      >
        <div className="flex gap-5">
          <input
            className="border p-2 w-full rounded-md"
            type="text"
            placeholder="Activity Type"
            value={activityType}
            onChange={(e) => setActivityType(e.target.value)}
            required
          />
          <button onClick={quickLog} disabled={submitting}>
            go
          </button>
        </div>
        {message && (
          <p className="text-sm text-red-100 font-roboto italic mt-2">
            {message}
          </p>
        )}
      </Modal>

      {/* LIST OF RECENT ACTIVITIES */}
      <Modal
        isOpen={isLogsModalOpen}
        onRequestClose={() => setIsLogsModalOpen(false)}
        style={customModalStyles}
        contentLabel="Activity Modal"
      >
        <ul className="flex flex-col gap-2 h-[200px] p-4">
          {activityLog.length > 0
            ? activityLog.map((activity, index) => (
                <li
                  key={index}
                  className="flex flex-col font-bold p-2 bg-slate-300 rounded-md text-slate-800"
                  onClick={() => {
                    console.log("clicked")
                  }}
                >
                  <h4>{toTitleCase(activity.activity_type!)}</h4>
                  {`
                      ${format(
                        parseISO(activity.rounded_timestamp),
                        "MM/dd/yy hh:mm a"
                      )}
                      for
                      ${millisecondsToMinutes(activity.duration!)} minutes
                    `}
                </li>
              ))
            : null}
        </ul>
      </Modal>

      {/* LIST OF CURRENTLY RUNNING ACTIVITIES */}
      <ul>
        {liveActivities.map((activity, index) => (
          <li
            key={index}
            className="grid grid-cols-[2rem_4rem_6rem_auto] gap-2 items-center mb-2"
          >
            <BlinkingGreenLight />
            <button
              onClick={() => endActivity(activity)}
              className="py-1 px-2 rounded-md"
            >
              end
            </button>
            <RunningTimer start={activity.timestamp} />
            {`${activity.activity_type}`}
          </li>
        ))}
      </ul>
    </>
  )
}

const BlinkingGreenLight = () => {
  const [isOn, setIsOn] = useState(true)
  useEffect(() => {
    const interval = setInterval(() => {
      setIsOn(!isOn)
    }, 1000)
    return () => clearInterval(interval)
  }, [isOn])
  return (
    <div
      className={`w-4 h-4 rounded-full inline-block mr-2 ${
        isOn ? "bg-green-400" : "bg-gray-400"
      }`}
    />
  )
}

const getDiff = (start: string) => {
  return new Date().getTime() - new Date(start).getTime()
}

const RunningTimer = ({ start }: { start: string }) => {
  const [seconds, setSeconds] = useState("")
  const [minutes, setMinutes] = useState("")
  const [hours, setHours] = useState("")

  useEffect(() => {
    const interval = setInterval(() => {
      const [hours, minutes, seconds] = formatDuration(getDiff(start))
      setSeconds(seconds)
      setMinutes(minutes)
      setHours(hours)
    }, 1000)
    return () => clearInterval(interval)
  }, [start])

  return <span>{`${hours}:${minutes}:${seconds}`}</span>
}

function formatDuration(milliseconds: number) {
  const pad = (num: number): string => num.toString().padStart(2, "0")

  const hours = pad(Math.floor(milliseconds / 3600000)) // 60*60*1000
  milliseconds %= 3600000
  const minutes = pad(Math.floor(milliseconds / 60000)) // 60*1000
  milliseconds %= 60000
  const seconds = pad(Math.floor(milliseconds / 1000))

  return [hours, minutes, seconds]
}
