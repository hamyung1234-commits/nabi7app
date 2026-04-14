import { useState, useMemo } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  parseISO,
} from 'date-fns';
import { ko } from 'date-fns/locale';

interface CalendarProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  memoDates?: string[];
}

export default function Calendar({ selectedDate, onDateChange, memoDates = [] }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => parseISO(selectedDate));
  const today = new Date();
  const selected = parseISO(selectedDate);

  const memoDateSet = useMemo(() => new Set(memoDates), [memoDates]);

  const monthDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const days: Date[] = [];
    let day = startDate;
    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [currentMonth]);

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleDateClick = (day: Date) => {
    onDateChange(format(day, 'yyyy-MM-dd'));
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button
          className="btn btn-icon btn-secondary btn-sm"
          onClick={handlePrevMonth}
          aria-label="Previous month"
        >
          ◀
        </button>
        <span className="calendar-title">
          {format(currentMonth, 'yyyy년 M월', { locale: ko })}
        </span>
        <button
          className="btn btn-icon btn-secondary btn-sm"
          onClick={handleNextMonth}
          aria-label="Next month"
        >
          ▶
        </button>
      </div>

      <div className="calendar-grid">
        {weekDays.map((day) => (
          <div key={day} className="calendar-day-header">
            {day}
          </div>
        ))}

        {monthDays.map((day, idx) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const isToday = isSameDay(day, today);
          const isSelected = isSameDay(day, selected);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const hasMemo = memoDateSet.has(dateStr);

          return (
            <div
              key={idx}
              className={`calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${!isCurrentMonth ? 'other-month' : ''} ${hasMemo ? 'has-memo' : ''}`}
              onClick={() => handleDateClick(day)}
            >
              {format(day, 'd')}
            </div>
          );
        })}
      </div>
    </div>
  );
}
