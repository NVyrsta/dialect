export const LESSON_STATUS = {
  SCHEDULED: 'scheduled',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export type LessonStatus = (typeof LESSON_STATUS)[keyof typeof LESSON_STATUS];

export interface Lesson {
  id: string;
  teacherId: string;
  teacherName: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  date: Date;
  startTime: string;
  endTime: string;
  topic?: string;
  homework?: string;
  notes?: string;
  status: LessonStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Lesson;
}

export function lessonToCalendarEvent(lesson: Lesson): CalendarEvent {
  const [startHour, startMin] = lesson.startTime.split(':').map(Number);
  const [endHour, endMin] = lesson.endTime.split(':').map(Number);

  const start = new Date(lesson.date);
  start.setHours(startHour, startMin, 0, 0);

  const end = new Date(lesson.date);
  end.setHours(endHour, endMin, 0, 0);

  return {
    id: lesson.id,
    title: lesson.studentName,
    start,
    end,
    resource: lesson,
  };
}
