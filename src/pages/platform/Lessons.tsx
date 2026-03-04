import { useEffect, useState, useCallback } from 'react';
import { LessonCalendar } from '../../components/LessonCalendar';
import { useAuth } from '../../contexts/AuthContext';
import {
  getAllLessons,
  getStudentLessons,
  getTeacherLessons,
  createLesson,
  updateLesson,
  deleteLesson,
} from '../../services/lessonService';
import { getTeachers, getStudents } from '../../services/userService';
import type { Lesson } from '../../types/lesson';
import { LESSON_STATUS } from '../../types/lesson';

interface UserOption {
  id: string;
  name: string;
}

export function Lessons() {
  const { isAdmin, isTeacher, canManageLessons, user } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [teachers, setTeachers] = useState<UserOption[]>([]);
  const [students, setStudents] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [useCustomStudent, setUseCustomStudent] = useState(false);

  const [formData, setFormData] = useState({
    teacherId: '',
    teacherName: '',
    studentId: '',
    studentName: '',
    date: '',
    startTime: '',
    endTime: '',
    topic: '',
    homework: '',
    notes: '',
    status: LESSON_STATUS.SCHEDULED as string,
  });

  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringWeeks, setRecurringWeeks] = useState(4);
  const [recurringDays, setRecurringDays] = useState<number[]>([]);

  const loadData = useCallback(async () => {
    try {
      let lessonsData: Lesson[];
      if (isAdmin) {
        lessonsData = await getAllLessons();
      } else if (isTeacher && user?.uid) {
        lessonsData = await getTeacherLessons(user.uid);
      } else if (user?.uid) {
        lessonsData = await getStudentLessons(user.uid);
      } else {
        lessonsData = [];
      }

      setLessons(lessonsData);

      if (canManageLessons) {
        const [teacherList, studentList] = await Promise.all([
          getTeachers(),
          getStudents(),
        ]);
        setTeachers(teacherList.map((u) => ({ id: u.uid, name: u.displayName })));
        setStudents(studentList.map((u) => ({ id: u.uid, name: u.displayName })));
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, isTeacher, canManageLessons, user?.uid]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStartTimeChange = (startTime: string) => {
    setFormData((prev) => {
      let endTime = prev.endTime;
      if (startTime) {
        const [hours, minutes] = startTime.split(':').map(Number);
        const endHours = (hours + 1) % 24;
        endTime = `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      }
      return { ...prev, startTime, endTime };
    });
  };

  const handleStudentSelect = (value: string) => {
    if (value === '__custom__') {
      setUseCustomStudent(true);
      setFormData((prev) => ({ ...prev, studentId: '', studentName: '' }));
    } else {
      setUseCustomStudent(false);
      const student = students.find((s) => s.id === value);
      if (student) {
        setFormData((prev) => ({
          ...prev,
          studentId: student.id,
          studentName: student.name,
        }));
      }
    }
  };

  const handleSelectLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    const isKnownStudent = students.some((s) => s.id === lesson.studentId);
    setUseCustomStudent(!isKnownStudent);
    setFormData({
      teacherId: lesson.teacherId || '',
      teacherName: lesson.teacherName || '',
      studentId: lesson.studentId,
      studentName: lesson.studentName,
      date: lesson.date.toISOString().split('T')[0],
      startTime: lesson.startTime,
      endTime: lesson.endTime,
      topic: lesson.topic || '',
      homework: lesson.homework || '',
      notes: lesson.notes || '',
      status: lesson.status,
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleSelectSlot = (slotInfo: { start: Date }) => {
    setSelectedLesson(null);
    setUseCustomStudent(false);
    const defaultTeacherId = isTeacher && user?.uid ? user.uid : '';
    const defaultTeacherName = isTeacher && user?.uid
      ? teachers.find(t => t.id === user.uid)?.name || ''
      : '';
    setFormData({
      teacherId: defaultTeacherId,
      teacherName: defaultTeacherName,
      studentId: '',
      studentName: '',
      date: slotInfo.start.toISOString().split('T')[0],
      startTime: '',
      endTime: '',
      topic: '',
      homework: '',
      notes: '',
      status: LESSON_STATUS.SCHEDULED,
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const baseLessonData = {
        teacherId: formData.teacherId,
        teacherName: formData.teacherName,
        studentId: formData.studentId || formData.studentName,
        studentName: formData.studentName,
        studentEmail: '',
        startTime: formData.startTime,
        endTime: formData.endTime,
        topic: formData.topic || undefined,
        homework: formData.homework || undefined,
        notes: formData.notes || undefined,
        status: formData.status as Lesson['status'],
      };

      if (isEditing && selectedLesson) {
        await updateLesson(selectedLesson.id, {
          ...baseLessonData,
          date: new Date(formData.date),
        });
      } else if (isRecurring && recurringDays.length > 0) {
        const startDate = new Date(formData.date);
        const lessonsToCreate: Date[] = [];

        for (let week = 0; week < recurringWeeks; week++) {
          for (const dayOfWeek of recurringDays) {
            const lessonDate = new Date(startDate);
            const currentDay = startDate.getDay();
            let daysUntil = dayOfWeek - currentDay;
            if (daysUntil < 0 || (daysUntil === 0 && week > 0)) {
              daysUntil += 7;
            }
            lessonDate.setDate(startDate.getDate() + daysUntil + week * 7);
            lessonsToCreate.push(lessonDate);
          }
        }

        lessonsToCreate.sort((a, b) => a.getTime() - b.getTime());
        for (const date of lessonsToCreate) {
          await createLesson({
            ...baseLessonData,
            date,
          });
        }
      } else {
        await createLesson({
          ...baseLessonData,
          date: new Date(formData.date),
        });
      }

      await loadData();
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to save lesson:', error);
    }
  };

  const handleDelete = async () => {
    if (!selectedLesson || !confirm('Delete this lesson?')) return;

    try {
      await deleteLesson(selectedLesson.id);
      await loadData();
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to delete lesson:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      teacherId: '',
      teacherName: '',
      studentId: '',
      studentName: '',
      date: '',
      startTime: '',
      endTime: '',
      topic: '',
      homework: '',
      notes: '',
      status: LESSON_STATUS.SCHEDULED,
    });
    setSelectedLesson(null);
    setIsEditing(false);
    setUseCustomStudent(false);
    setIsRecurring(false);
    setRecurringWeeks(4);
    setRecurringDays([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const getPageTitle = () => {
    if (isAdmin) return 'Lesson Schedule';
    if (isTeacher) return 'My Teaching Schedule';
    return 'My Lessons';
  };

  const getPageSubtitle = () => {
    if (canManageLessons) return 'Manage lesson schedule';
    return 'View your upcoming lessons';
  };

  const handleTeacherSelect = (value: string) => {
    const teacher = teachers.find((t) => t.id === value);
    if (teacher) {
      setFormData((prev) => ({
        ...prev,
        teacherId: teacher.id,
        teacherName: teacher.name,
      }));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{getPageTitle()}</h1>
          <p className="text-gray-500 mt-1">{getPageSubtitle()}</p>
        </div>
        {canManageLessons && (
          <button
            onClick={() => {
              resetForm();
              const defaultTeacherId = isTeacher && user?.uid ? user.uid : '';
              const defaultTeacherName = isTeacher && user?.uid
                ? teachers.find(t => t.id === user.uid)?.name || ''
                : '';
              setFormData((prev) => ({
                ...prev,
                teacherId: defaultTeacherId,
                teacherName: defaultTeacherName,
                date: new Date().toISOString().split('T')[0],
              }));
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            + Add Lesson
          </button>
        )}
      </div>

      <LessonCalendar
        lessons={lessons}
        onSelectLesson={canManageLessons ? handleSelectLesson : undefined}
        onSelectSlot={canManageLessons ? handleSelectSlot : undefined}
        isAdmin={canManageLessons}
        userRole={isAdmin ? 'admin' : isTeacher ? 'teacher' : 'student'}
      />

      {canManageLessons && isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {isEditing ? 'Edit Lesson' : 'New Lesson'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teacher *
                </label>
                {isAdmin ? (
                  <select
                    value={formData.teacherId || ''}
                    onChange={(e) => handleTeacherSelect(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select teacher...</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={formData.teacherName}
                    disabled
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student *
                </label>
                {!useCustomStudent ? (
                  <select
                    value={formData.studentId || ''}
                    onChange={(e) => handleStudentSelect(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select student...</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.name}
                      </option>
                    ))}
                    <option value="__custom__">+ Other (type name)</option>
                  </select>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={formData.studentName}
                      onChange={(e) =>
                        setFormData({ ...formData, studentName: e.target.value })
                      }
                      placeholder="Enter student name"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setUseCustomStudent(false);
                        setFormData((prev) => ({ ...prev, studentId: '', studentName: '' }));
                      }}
                      className="text-sm text-indigo-600 hover:text-indigo-800"
                    >
                      ← Back to list
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start *
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => handleStartTimeChange(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End *
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) =>
                      setFormData({ ...formData, endTime: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Topic
                </label>
                <input
                  type="text"
                  value={formData.topic}
                  onChange={(e) =>
                    setFormData({ ...formData, topic: e.target.value })
                  }
                  placeholder="Present Perfect Tense"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Homework
                </label>
                <textarea
                  value={formData.homework}
                  onChange={(e) =>
                    setFormData({ ...formData, homework: e.target.value })
                  }
                  rows={2}
                  placeholder="Ex. 5-7, p. 42"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {!isEditing && (
                <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isRecurring}
                      onChange={(e) => setIsRecurring(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Recurring lesson
                    </span>
                  </label>

                  {isRecurring && (
                    <div className="space-y-3 pl-6">
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">
                          Days of week
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
                            (day, index) => (
                              <button
                                key={day}
                                type="button"
                                onClick={() => {
                                  setRecurringDays((prev) =>
                                    prev.includes(index)
                                      ? prev.filter((d) => d !== index)
                                      : [...prev, index].sort()
                                  );
                                }}
                                className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                                  recurringDays.includes(index)
                                    ? 'bg-indigo-600 text-white border-indigo-600'
                                    : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
                                }`}
                              >
                                {day}
                              </button>
                            )
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          Number of weeks
                        </label>
                        <select
                          value={recurringWeeks}
                          onChange={(e) => setRecurringWeeks(Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          {[2, 4, 6, 8, 10, 12].map((n) => (
                            <option key={n} value={n}>
                              {n} weeks
                            </option>
                          ))}
                        </select>
                      </div>

                      {recurringDays.length > 0 && (
                        <p className="text-xs text-gray-500">
                          This will create {recurringDays.length * recurringWeeks} lessons
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {isEditing && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value={LESSON_STATUS.SCHEDULED}>Scheduled</option>
                    <option value={LESSON_STATUS.COMPLETED}>Completed</option>
                    <option value={LESSON_STATUS.CANCELLED}>Cancelled</option>
                  </select>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  {isEditing ? 'Save' : 'Create'}
                </button>
                {isEditing && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors font-medium"
                  >
                    Delete
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
