import dayjs from 'dayjs'

interface RelativeTimeProps {
  time: number // nanoseconds
}

export function RelativeTime(props: RelativeTimeProps) {
  const { time } = props
  return dayjs(new Date(time)).fromNow()
}
