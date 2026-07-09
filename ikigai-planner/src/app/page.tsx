import { redirect } from 'next/navigation'
import { format } from 'date-fns'

export default function RootPage() {
  redirect(`/planner/${format(new Date(), 'yyyy-MM-dd')}`)
}
