export interface Activity {
  id: number
  timestamp: Date
  user_id: number
  activity_type: string | null
  duration: number | null
  additional_notes: string | null
}

export interface SensorDatapoint {
  timestamp: string
  user_id: number
  activity_type: string | null
  duration: number | null
  additional_notes: string | null
}

export interface ContextType {
  activityData: Activity[]
  sensorData: SensorDatapoint[]
  timeScope: TimeScope
}
