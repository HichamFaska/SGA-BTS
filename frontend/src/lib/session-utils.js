export const formatTime = (time) => time?.slice(0, 5) ?? ""

export const formatMinutes = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60)
    const mins = totalMinutes % 60
    if (hours > 0 && mins > 0) return `${hours}h ${mins}min`
    if (hours > 0) return `${hours}h`
    return `${mins}min`
}

export const computeSessionDuration = (startTime, endTime) => {
    const [startHours, startMinutes] = startTime.split(":").map(Number)
    const [endHours, endMinutes] = endTime.split(":").map(Number)
    return (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes)
}

export const getDurationSlices = (sessionDuration) => {
    const slices = Array.from(
        { length: Math.floor(sessionDuration / 15) },
        (_, i) => (i + 1) * 15
    )
    if (sessionDuration % 15 !== 0) slices.push(sessionDuration)
    return slices
}
