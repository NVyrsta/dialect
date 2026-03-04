import { useState, useCallback, useMemo, useEffect } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import type { Lesson, CalendarEvent } from '../types/lesson';
import { LESSON_STATUS } from '../types/lesson';
import { USER_ROLES } from '../types/user';
import 'react-big-calendar/lib/css/react-big-calendar.css';

type UserViewRole = 'admin' | 'teacher' | 'student';

function lessonToCalendarEvent(lesson: Lesson, userRole: UserViewRole): CalendarEvent {
  const [startHour, startMin] = lesson.startTime.split(':').map(Number);
  const [endHour, endMin] = lesson.endTime.split(':').map(Number);

  const start = new Date(lesson.date);
  start.setHours(startHour, startMin, 0, 0);

  const end = new Date(lesson.date);
  end.setHours(endHour, endMin, 0, 0);

  let title: string;
  if (userRole === USER_ROLES.STUDENT) {
    title = lesson.teacherName || 'Lesson';
    if (lesson.topic) title += `: ${lesson.topic}`;
  } else {
    title = lesson.studentName;
  }

  return {
    id: lesson.id,
    title,
    start,
    end,
    resource: lesson,
  };
}

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return isMobile;
}

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

const messages = {
  today: 'Today',
  previous: 'Back',
  next: 'Next',
  month: 'Month',
  week: 'Week',
  day: 'Day',
  agenda: 'List',
  date: 'Date',
  time: 'Time',
  event: 'Lesson',
  noEventsInRange: 'No lessons in this period',
};

interface LessonCalendarProps {
  lessons: Lesson[];
  onSelectLesson?: (lesson: Lesson) => void;
  onSelectSlot?: (slotInfo: { start: Date; end: Date }) => void;
  isAdmin?: boolean;
  userRole?: UserViewRole;
}

export function LessonCalendar({
  lessons,
  onSelectLesson,
  onSelectSlot,
  isAdmin = false,
  userRole = 'student',
}: LessonCalendarProps) {
  const isMobile = useIsMobile();
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDefaultView = () => {
    if (userRole === USER_ROLES.TEACHER) return Views.WEEK;
    return Views.MONTH;
  };

  const [preferredView, setPreferredView] = useState<(typeof Views)[keyof typeof Views]>(getDefaultView());

  const currentView = useMemo(() => {
    if (isMobile && preferredView === Views.MONTH) {
      return Views.AGENDA;
    }
    return preferredView;
  }, [isMobile, preferredView]);

  const events = useMemo(
    () => lessons.map((lesson) => lessonToCalendarEvent(lesson, userRole)),
    [lessons, userRole]
  );

  const handleSelectEvent = useCallback(
    (event: CalendarEvent) => {
      onSelectLesson?.(event.resource);
    },
    [onSelectLesson]
  );

  const handleSelectSlot = useCallback(
    (slotInfo: { start: Date; end: Date }) => {
      if (isAdmin && onSelectSlot) {
        onSelectSlot(slotInfo);
      }
    },
    [isAdmin, onSelectSlot]
  );

  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    const lesson = event.resource;
    let backgroundColor = '#6366f1';
    let borderColor = '#4f46e5';

    if (lesson.status === LESSON_STATUS.COMPLETED) {
      backgroundColor = '#22c55e';
      borderColor = '#16a34a';
    } else if (lesson.status === LESSON_STATUS.CANCELLED) {
      backgroundColor = '#ef4444';
      borderColor = '#dc2626';
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        borderRadius: '6px',
        border: `2px solid ${borderColor}`,
        color: 'white',
        fontSize: '13px',
        padding: '2px 6px',
      },
    };
  }, []);

  const EventComponent = useCallback(
    ({ event }: { event: CalendarEvent }) => {
      const lesson = event.resource;
      const tooltipContent = [
        userRole === USER_ROLES.STUDENT ? `Teacher: ${lesson.teacherName}` : `Student: ${lesson.studentName}`,
        `Time: ${lesson.startTime} - ${lesson.endTime}`,
        lesson.topic && `Topic: ${lesson.topic}`,
        lesson.homework && `Homework: ${lesson.homework}`,
      ]
        .filter(Boolean)
        .join('\n');

      return (
        <div title={tooltipContent} className="truncate">
          {event.title}
        </div>
      );
    },
    [userRole]
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-2 sm:p-4">
      <style>{`
        .rbc-calendar {
          font-family: inherit;
        }
        .rbc-toolbar {
          margin-bottom: 1rem;
          flex-wrap: wrap;
          gap: 0.5rem;
          justify-content: center;
        }
        @media (min-width: 640px) {
          .rbc-toolbar {
            justify-content: space-between;
          }
        }
        .rbc-toolbar button {
          padding: 0.4rem 0.75rem;
          border-radius: 0.5rem;
          border: 1px solid #e5e7eb;
          background: white;
          color: #374151;
          font-weight: 500;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.15s;
        }
        @media (min-width: 640px) {
          .rbc-toolbar button {
            padding: 0.5rem 1rem;
          }
        }
        .rbc-toolbar button:hover {
          background: #f3f4f6;
          border-color: #d1d5db;
        }
        .rbc-toolbar button.rbc-active {
          background: #6366f1;
          color: white;
          border-color: #6366f1;
        }
        .rbc-toolbar-label {
          font-weight: 600;
          font-size: 1rem;
          width: 100%;
          text-align: center;
          order: -1;
          margin-bottom: 0.5rem;
        }
        @media (min-width: 640px) {
          .rbc-toolbar-label {
            width: auto;
            order: 0;
            margin-bottom: 0;
          }
        }
        .rbc-header {
          padding: 0.5rem 0.25rem;
          font-weight: 600;
          font-size: 0.75rem;
          color: #374151;
          border-bottom: 2px solid #e5e7eb;
        }
        @media (min-width: 640px) {
          .rbc-header {
            padding: 0.75rem 0.5rem;
            font-size: 0.875rem;
          }
        }
        .rbc-today {
          background-color: #eef2ff;
        }
        .rbc-off-range-bg {
          background-color: #f9fafb;
        }
        .rbc-event {
          cursor: pointer;
          font-size: 0.7rem;
          padding: 1px 4px;
        }
        @media (min-width: 640px) {
          .rbc-event {
            font-size: 0.8rem;
            padding: 2px 6px;
          }
        }
        .rbc-event:focus {
          outline: none;
          box-shadow: 0 0 0 2px white, 0 0 0 4px #6366f1;
        }
        .rbc-month-view {
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          overflow: hidden;
        }
        .rbc-date-cell {
          padding: 0.15rem 0.25rem;
          text-align: right;
          font-size: 0.75rem;
        }
        @media (min-width: 640px) {
          .rbc-date-cell {
            padding: 0.25rem 0.5rem;
            font-size: 0.875rem;
          }
        }
        .rbc-date-cell > a {
          color: #374151;
          font-weight: 500;
        }
        .rbc-agenda-view {
          font-size: 0.875rem;
        }
        .rbc-agenda-table {
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          overflow: hidden;
        }
        .rbc-agenda-time-cell,
        .rbc-agenda-date-cell {
          padding: 0.5rem;
          white-space: nowrap;
        }
        .rbc-agenda-event-cell {
          padding: 0.5rem;
        }
        .rbc-allday-cell {
          display: none;
        }
        .rbc-time-view {
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          overflow: hidden;
        }
        .rbc-time-view .rbc-header {
          border-bottom: 1px solid #e5e7eb;
        }
        .rbc-time-content {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .rbc-time-content::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: isMobile ? 450 : 600 }}
        view={currentView}
        onView={setPreferredView}
        date={currentDate}
        onNavigate={setCurrentDate}
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        selectable={isAdmin}
        eventPropGetter={eventStyleGetter}
        messages={messages}
        views={isMobile ? [Views.AGENDA, Views.DAY] : [Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
        popup
        culture="en-US"
        length={30}
        components={{
          event: EventComponent,
        }}
      />

      <div className="mt-4 flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-gray-600 justify-center sm:justify-start">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-indigo-500" />
          <span>Scheduled</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-500" />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-500" />
          <span>Cancelled</span>
        </div>
      </div>
    </div>
  );
}
