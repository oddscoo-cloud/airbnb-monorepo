import { useState } from 'react'

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд']

type StayDates = { start: Date | null; end: Date | null }

type PropertyCalendarProps = {
  location: string
  stayDates: StayDates
  onStayDatesChange: (dates: StayDates) => void
}

// Сетка месяца с понедельником в начале недели и пустыми ячейками до первого числа.
function getMonthGrid(year: number, month: number) {
  const first = new Date(year, month, 1)
  const startOffset = (first.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = Array(startOffset).fill(null)
  for (let day = 1; day <= daysInMonth; day++) cells.push(day)
  return cells
}

function formatDate(date: Date | null) {
  return date
    ? new Intl.DateTimeFormat('uk-UA', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
    : 'Виберіть дату'
}

function formatRange({ start, end }: StayDates) {
  if (!start) return 'Виберіть дату'
  if (!end) return formatDate(start)
  return `${formatDate(start)} — ${formatDate(end)}`
}

export function PropertyCalendar({ location, stayDates, onStayDatesChange }: PropertyCalendarProps) {
  // Видимые месяцы — локальное состояние; выбранные даты принадлежат App.
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = new Date()
    return new Date(today.getFullYear(), today.getMonth(), 1)
  })

  function handleDateClick(date: Date) {
    const { start, end } = stayDates
    // Начало нового диапазона при первом выборе или после завершённого диапазона.
    if (!start || end) {
      onStayDatesChange({ start: date, end: null })
    // Порядок границ при выборе более раннего второго дня.
    } else if (date < start) {
      onStayDatesChange({ start: date, end: start })
    } else if (date.getTime() !== start.getTime()) {
      onStayDatesChange({ start, end: date })
    }
  }

  function isDateInSelectedRange(date: Date) {
    if (!stayDates.start) return false
    const rangeEnd = stayDates.end ?? stayDates.start
    const min = new Date(Math.min(stayDates.start.getTime(), rangeEnd.getTime()))
    const max = new Date(Math.max(stayDates.start.getTime(), rangeEnd.getTime()))
    // Нормализация сравниваемого значения до начала календарного дня.
    const candidate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    return candidate >= min && candidate <= max
  }

  return (
    <section id="calendar" className="property__section">
      <h2 className="property__section-title">Дати перебування · {location}</h2>
      <p className="property__date-range">{formatRange(stayDates)}</p>

      <div className="property__calendar-controls">
        <label>
          <span>Місяць</span>
          <select
            value={calendarMonth.getMonth()}
            onChange={(event) => setCalendarMonth(new Date(calendarMonth.getFullYear(), Number(event.target.value), 1))}
          >
            {Array.from({ length: 12 }, (_, month) => (
              <option key={month} value={month}>
                {new Intl.DateTimeFormat('uk-UA', { month: 'long' }).format(new Date(calendarMonth.getFullYear(), month, 1))}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Рік</span>
          <select
            value={calendarMonth.getFullYear()}
            onChange={(event) => setCalendarMonth(new Date(Number(event.target.value), calendarMonth.getMonth(), 1))}
          >
            {Array.from({ length: 6 }, (_, offset) => new Date().getFullYear() + offset).map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="property__calendars">
        {/* Два соседних месяца; offset сдвигает второй месяц вперёд. */}
        {Array.from({ length: 2 }, (_, offset) => {
          const monthDate = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + offset, 1)
          const year = monthDate.getFullYear()
          const month = monthDate.getMonth()
          const label = new Intl.DateTimeFormat('uk-UA', { month: 'long', year: 'numeric' }).format(monthDate)
          const cells = getMonthGrid(year, month)
          const today = new Date()
          today.setHours(0, 0, 0, 0)

          return (
            <div key={label} className="property__calendar">
              <h3>{label}</h3>
              <div className="property__calendar-weekdays">
                {WEEKDAYS.map((day) => <span key={day}>{day}</span>)}
              </div>
              <div className="property__calendar-grid">
                {cells.map((day, index) => {
                  const date = day ? new Date(year, month, day) : null
                  const isSelected = date ? isDateInSelectedRange(date) : false
                  const isExactStart = date && stayDates.start && date.getTime() === stayDates.start.getTime()
                  const isExactEnd = date && stayDates.end && date.getTime() === stayDates.end.getTime()
                  const isPastDate = date ? date < today : false

                  return (
                    <button
                      key={index}
                      type="button"
                      className={[
                        'property__calendar-day',
                        isPastDate ? 'property__calendar-day--disabled' : '',
                        isSelected ? 'property__calendar-day--selected' : '',
                        isExactStart || isExactEnd ? 'property__calendar-day--range-edge' : '',
                      ].filter(Boolean).join(' ')}
                      onClick={() => date && handleDateClick(date)}
                      disabled={!date || isPastDate}
                    >
                      {day ?? ''}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <button type="button" className="property__clear-dates" onClick={() => onStayDatesChange({ start: null, end: null })}>
        Очистити дати
      </button>
    </section>
  )
}
