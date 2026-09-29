import './DatePickerPanel.css'

const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд']

const MONTH_DATA = [
  { month: 'Листопад 2021', days: [null, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, null] },
  { month: 'Грудень 2021', days: [null, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31] },
]

interface DatePickerPanelProps {
  onClose: () => void
}

export function DatePickerPanel({ onClose }: DatePickerPanelProps) {
  return (
    <div className="date-picker" role="dialog" aria-label="Вибір дат">
      <div className="date-picker__months">
        {MONTH_DATA.map((month) => (
          <div key={month.month} className="date-picker__month">
            <div className="date-picker__month-title">{month.month}</div>
            <div className="date-picker__weekdays">
              {DAYS.map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>

            <div className="date-picker__days">
              {month.days.map((day, index) => (
                <span
                  key={`${month.month}-${index}`}
                  className={day === null ? 'date-picker__day date-picker__day--empty' : 'date-picker__day'}
                >
                  {day ?? ''}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="date-picker__footer">
        <button type="button" className="date-picker__action" onClick={onClose}>Точні дати</button>
        <button type="button" className="date-picker__action" onClick={onClose}>+/- 1 день</button>
        <button type="button" className="date-picker__action" onClick={onClose}>+/- 2 дні</button>
      </div>
    </div>
  )
}
