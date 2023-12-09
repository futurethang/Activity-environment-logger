export interface Activity {
  timestamp: string // assuming ISO string format
  user_id: number
  activity_type: string | null
  duration: number | null
  additional_notes: string | null
}

export interface SensorDatapoint {
  timestamp: string // assuming ISO string format
  user_id: number
  activity_type: string | null
  duration: number | null
  additional_notes: string | null
}

export interface ContextType {
  activityData: Activity[] // Using the Activity interface from earlier
  sensorData: SensorDatapoint[] // Replace with the correct type
  timeScope: TimeScope // Replace with the correct type
}
