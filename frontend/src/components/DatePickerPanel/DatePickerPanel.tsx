import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import './DatePickerPanel.css'

const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд']
const MONTHS = ['Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень', 'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень']

interface DatePickerPanelProps {
  startDate: Date | null
  endDate: Date | null
  onSelect: (startDate: Date | null, endDate: Date | null) => void
  onClose: () => void
}

function sameDay(left: Date | null, right: Date) {
  return left !== null
    && left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate()
}

function isBetween(date: Date, startDate: Date | null, endDate: Date | null) {
  return startDate !== null && endDate !== null && date > startDate && date < endDate
}

export function DatePickerPanel({ startDate, endDate, onSelect, onClose }: DatePickerPanelProps) {
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const today = new Date()
    return new Date(today.getFullYear(), today.getMonth(), 1)
  })

  function selectDate(date: Date) {
    if (startDate === null || endDate !== null || date <= startDate) {
      onSelect(date, null)
      return
    }

    onSelect(startDate, date)
  }

  function renderMonth(monthOffset: number) {
    const month = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + monthOffset, 1)
    const firstWeekday = (month.getDay() + 6) % 7
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
    const cells = Array.from({ length: firstWeekday + daysInMonth }, (_, index) =>
      index < firstWeekday ? null : new Date(month.getFullYear(), month.getMonth(), index - firstWeekday + 1),
    )

    return (
      <div key={`${month.getFullYear()}-${month.getMonth()}`} className="date-picker__month">
        <div className="date-picker__month-title">{MONTHS[month.getMonth()]} {month.getFullYear()}</div>
        <div className="date-picker__weekdays">
          {DAYS.map((day) => <span key={day}>{day}</span>)}
        </div>
        <div className="date-picker__days">
          {cells.map((date, index) => {
            if (!date) return <span key={`empty-${index}`} className="date-picker__day date-picker__day--empty" />
            const isSelected = sameDay(startDate, date) || sameDay(endDate, date)
            const isPast = date < new Date(new Date().setHours(0, 0, 0, 0))
            const className = [
              'date-picker__day',
              isSelected && 'date-picker__day--selected',
              isBetween(date, startDate, endDate) && 'date-picker__day--between',
            ].filter(Boolean).join(' ')

            return (
              <button
                key={date.toISOString()}
                type="button"
                className={className}
                disabled={isPast}
                aria-pressed={isSelected}
                onClick={() => selectDate(date)}
              >
                {date.getDate()}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="date-picker" role="dialog" aria-label="Вибір дат">
      <div className="date-picker__months">
        {renderMonth(0)}
        {renderMonth(1)}
      </div>
      <div className="date-picker__footer">
        <button
          type="button"
          className="date-picker__action"
          onClick={() => setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() - 1, 1))}
          aria-label="Попередній місяць"
        >
          <ChevronLeft size={16} aria-hidden />
        </button>
        <button type="button" className="date-picker__action" onClick={() => onSelect(null, null)}>Очистити дати</button>
        <button type="button" className="date-picker__action" onClick={onClose}>Готово</button>
        <button
          type="button"
          className="date-picker__action"
          onClick={() => setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() + 1, 1))}
          aria-label="Наступний місяць"
        >
          <ChevronRight size={16} aria-hidden />
        </button>
      </div>
    </div>
  )
}
