import {
  format,
  startOfWeek,
  endOfWeek,
  isToday,
  isYesterday,
  isTomorrow,
  getDaysInMonth,
  parseISO,
} from 'date-fns'
import { es } from 'date-fns/locale'

/**
 * Format a date as 'dd MMM yyyy' (e.g. "28 May 2026")
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'dd MMM yyyy', { locale: es })
}

/**
 * Returns Monday of the week containing the given date.
 */
export function getWeekStart(date: Date | string): Date {
  const d = typeof date === 'string' ? parseISO(date) : date
  return startOfWeek(d, { weekStartsOn: 1 })
}

/**
 * Returns Sunday of the week containing the given date.
 */
export function getWeekEnd(date: Date | string): Date {
  const d = typeof date === 'string' ? parseISO(date) : date
  return endOfWeek(d, { weekStartsOn: 1 })
}

/**
 * Returns 'Hoy', 'Ayer', 'Mañana', or a formatted date string.
 */
export function getDayLabel(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  if (isToday(d)) return 'Hoy'
  if (isYesterday(d)) return 'Ayer'
  if (isTomorrow(d)) return 'Mañana'
  return formatDate(d)
}

/**
 * Returns an array of all Date objects within the given month.
 * @param year  Full year, e.g. 2026
 * @param month 1-based month index (1 = January)
 */
export function getMonthDays(year: number, month: number): Date[] {
  const count = getDaysInMonth(new Date(year, month - 1, 1))
  return Array.from({ length: count }, (_, i) => new Date(year, month - 1, i + 1))
}

/**
 * Serialises a Date to 'YYYY-MM-DD' without timezone conversion.
 */
export function toISODateString(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

/**
 * Parses a 'YYYY-MM-DD' string into a local Date (midnight).
 */
export function parseISODate(str: string): Date {
  return parseISO(str)
}
