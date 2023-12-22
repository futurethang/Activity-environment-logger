export interface Activity {
  id: number
  timestamp: string
  user_id: number
  activity_type: string | null
  duration: number | null
  additional_notes: string | null
}

export interface SensorData {
  minute: string | null
  battery_pct?: number | null
  particles_03um?: number | null
  pm100_standard?: number | null
  pm25_standard?: number | null
  pm10_env?: number | null
  particles_05um?: number | null
  pm10_standard?: number | null
  pm100_env?: number | null
  particles_25um?: number | null
  particles_100um?: number | null
  particles_50um?: number | null
  battery_v?: number | null
  pm25_env?: number | null
  particles_10um?: number | null
  co2_ppm?: number | null
  humidity_relative?: number | null
  temperature_c?: number | null
}

export interface ContextType {
  activityData: Activity[]
  sensorData: SensorData[]
  timeScope: string | undefined
}

export interface TimeScope {
  start: string
  end: string
}
