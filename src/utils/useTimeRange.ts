import { useState, useEffect, useCallback } from "react"
import { convertToPacificTime } from "./timezone" // Ensure you import the function from the correct location

const useTimeRange = () => {
  const [timeRange, setTimeRange] = useState({ start: "", end: "" })

  useEffect(() => {
    const now = new Date()
    const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000) // 12 hours in milliseconds

    const startPacificTime = convertToPacificTime(twelveHoursAgo.toISOString())
    const endPacificTime = convertToPacificTime(now.toISOString())

    setTimeRange({
      start: startPacificTime,
      end: endPacificTime,
    })
  }, [])

  const handleTimeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTimeRange((prevTimeRange) => ({
        ...prevTimeRange,
        [e.target.name]: e.target.value,
      }))
    },
    []
  )

  return [timeRange, handleTimeChange]
}

export default useTimeRange
