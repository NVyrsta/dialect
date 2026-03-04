import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  getAllTests,
  getAllQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  createTest,
  updateTest,
  deleteTest,
  generateTestLink
} from '../../services/testService';
import type { Test, Question, EnglishLevel, QuestionType } from '../../types/test';
import { ENGLISH_LEVELS, ENGLISH_LEVEL_LABELS, QUESTION_TYPES } from '../../types/test';

const QUESTION_TYPE_INFO: Record<QuestionType, { label: string; description: string; icon: string }> = {
  yes_no: {
    label: 'Yes / No',
    description: 'Simple true/false questions',
    icon: '✓✗',
  },
};

type Tab = 'tests' | 'questions';

export function Tests() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('tests');
  const [tests, setTests] = useState<Test[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [selectedType, setSelectedType] = useState<QuestionType>(QUESTION_TYPES.YES_NO);
  const [questionForm, setQuestionForm] = useState({
    text: '',
    correctAnswer: true,
    level: ENGLISH_LEVELS.A1 as EnglishLevel,
  });
  const [savingQuestion, setSavingQuestion] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [editingTest, setEditingTest] = useState<Test | null>(null);
  const [testForm, setTestForm] = useState({
    title: '',
    description: '',
    timeLimit: '',
    isPublished: false,
    questionIds: [] as string[],
  });
  const [savingTest, setSavingTest] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [allTests, allQuestions] = await Promise.all([
        getAllTests(),
        getAllQuestions()
      ]);
      setTests(allTests);
      setQuestions(allQuestions);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openAddQuestion = () => {
    setEditingQuestion(null);
    setShowTypeSelector(true);
  };

  const selectTypeAndContinue = (type: QuestionType) => {
    setSelectedType(type);
    setShowTypeSelector(false);
    setQuestionForm({
      text: '',
      correctAnswer: true,
      level: ENGLISH_LEVELS.A1,
    });
    setShowQuestionModal(true);
  };

  const openEditQuestion = (q: Question) => {
    setEditingQuestion(q);
    setSelectedType(q.type);
    setQuestionForm({
      text: q.text,
      correctAnswer: q.correctAnswer,
      level: q.level,
    });
    setShowQuestionModal(true);
  };

  const handleSaveQuestion = async () => {
    if (!questionForm.text.trim() || !user) return;

    const author = {
      uid: user.uid,
      name: user.displayName || user.email || 'Unknown',
      email: user.email || '',
    };

    setSavingQuestion(true);
    try {
      if (editingQuestion) {
        await updateQuestion(editingQuestion.id, {
          text: questionForm.text,
          correctAnswer: questionForm.correctAnswer,
          level: questionForm.level,
          type: selectedType,
        }, author);
      } else {
        await createQuestion({
          text: questionForm.text,
          correctAnswer: questionForm.correctAnswer,
          level: questionForm.level,
          type: selectedType,
          createdBy: author,
        }, author);
      }
      await loadData();
      setShowQuestionModal(false);
    } catch (error) {
      console.error('Failed to save question:', error);
    } finally {
      setSavingQuestion(false);
    }
  };

  const handleDeleteQuestion = async (q: Question) => {
    if (!confirm(`Delete question "${q.text.slice(0, 50)}..."?`)) return;

    try {
      await deleteQuestion(q.id);
      setQuestions(questions.filter((x) => x.id !== q.id));
    } catch (error) {
      console.error('Failed to delete question:', error);
    }
  };

  const openAddTest = () => {
    setEditingTest(null);
    setTestForm({
      title: '',
      description: '',
      timeLimit: '',
      isPublished: false,
      questionIds: [],
    });
    setShowTestModal(true);
  };

  const openEditTest = (t: Test) => {
    setEditingTest(t);
    setTestForm({
      title: t.title,
      description: t.description,
      timeLimit: t.timeLimit?.toString() || '',
      isPublished: t.isPublished,
      questionIds: t.questionIds,
    });
    setShowTestModal(true);
  };

  const handleSaveTest = async () => {
    if (!testForm.title.trim()) return;

    setSavingTest(true);
    try {
      const data = {
        title: testForm.title,
        description: testForm.description,
        questionIds: testForm.questionIds,
        isPublished: testForm.isPublished,
        ...(testForm.timeLimit && { timeLimit: parseInt(testForm.timeLimit) }),
      };

      if (editingTest) {
        await updateTest(editingTest.id, data);
      } else {
        await createTest(data);
      }
      await loadData();
      setShowTestModal(false);
    } catch (error) {
      console.error('Failed to save test:', error);
    } finally {
      setSavingTest(false);
    }
  };

  const handleDeleteTest = async (t: Test) => {
    if (!confirm(`Delete test "${t.title}"?`)) return;

    try {
      await deleteTest(t.id);
      setTests(tests.filter((x) => x.id !== t.id));
    } catch (error) {
      console.error('Failed to delete test:', error);
    }
  };

  const copyLink = async (testId: string) => {
    const link = generateTestLink(testId);
    await navigator.clipboard.writeText(link);
    setCopiedId(testId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleQuestionInTest = (questionId: string) => {
    setTestForm((prev) => ({
      ...prev,
      questionIds: prev.questionIds.includes(questionId)
        ? prev.questionIds.filter((id) => id !== questionId)
        : [...prev.questionIds, questionId],
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tests</h1>
          <p className="text-gray-500 mt-1">Manage questions and tests</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setTab('tests')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === 'tests'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Tests ({tests.length})
        </button>
        <button
          onClick={() => setTab('questions')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === 'questions'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Questions ({questions.length})
        </button>
      </div>

      {/* Tests Tab */}
      {tab === 'tests' && (
        <>
          <div className="flex justify-end mb-4">
            <button
              onClick={openAddTest}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              + Create Test
            </button>
          </div>

          {tests.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <p className="text-gray-500 mb-4">No tests yet</p>
              <button
                onClick={openAddTest}
                className="text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Create your first test
              </button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {tests.map((test) => (
                <div
                  key={test.id}
                  className="bg-white p-5 rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{test.title}</h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{test.description}</p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        test.isPublished
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {test.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>

                  <div className="text-sm text-gray-500 mb-4">
                    {test.questionIds.length} questions
                    {test.timeLimit && ` • ${test.timeLimit} min`}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyLink(test.id)}
                      disabled={!test.isPublished}
                      className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        test.isPublished
                          ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                          : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {copiedId === test.id ? 'Copied!' : 'Copy Link'}
                    </button>
                    <button
                      onClick={() => openEditTest(test)}
                      className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTest(test)}
                      className="px-3 py-2 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Questions Tab */}
      {tab === 'questions' && (
        <>
          <div className="flex justify-end mb-4">
            <button
              onClick={openAddQuestion}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              + Add Question
            </button>
          </div>

          {questions.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <p className="text-gray-500 mb-4">No questions yet</p>
              <button
                onClick={openAddQuestion}
                className="text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Add your first question
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Question</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 w-24">Answer</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 w-24">Level</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 w-40">Author</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 w-32">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {questions.map((q) => (
                    <tr key={q.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{q.text}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${
                            q.correctAnswer
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {q.correctAnswer ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{q.level}</td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">{q.createdBy?.name || '—'}</div>
                        <div className="text-xs text-gray-400">
                          {q.createdAt ? new Date(q.createdAt).toLocaleDateString() : ''}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => openEditQuestion(q)}
                          className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(q)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Question Type Selector */}
      {showTypeSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Select Question Type</h2>
              <p className="text-sm text-gray-500 mt-1">Choose the type of question you want to create</p>
            </div>

            <div className="p-4 space-y-2">
              {Object.entries(QUESTION_TYPE_INFO).map(([type, info]) => (
                <button
                  key={type}
                  onClick={() => selectTypeAndContinue(type as QuestionType)}
                  className="w-full flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-left"
                >
                  <div className="w-12 h-12 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-lg text-xl font-bold">
                    {info.icon}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{info.label}</div>
                    <div className="text-sm text-gray-500">{info.description}</div>
                  </div>
                </button>
              ))}
            </div>

            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => setShowTypeSelector(false)}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Question Modal */}
      {showQuestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingQuestion ? 'Edit Question' : 'Add Question'}
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question Text *
                </label>
                <textarea
                  value={questionForm.text}
                  onChange={(e) => setQuestionForm({ ...questionForm, text: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                  placeholder="Is the sky blue?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correct Answer *
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={questionForm.correctAnswer === true}
                      onChange={() => setQuestionForm({ ...questionForm, correctAnswer: true })}
                      className="w-4 h-4 text-indigo-600"
                    />
                    <span className="ml-2 text-gray-700">Yes</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={questionForm.correctAnswer === false}
                      onChange={() => setQuestionForm({ ...questionForm, correctAnswer: false })}
                      className="w-4 h-4 text-indigo-600"
                    />
                    <span className="ml-2 text-gray-700">No</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Level *
                </label>
                <select
                  value={questionForm.level}
                  onChange={(e) => setQuestionForm({ ...questionForm, level: e.target.value as EnglishLevel })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                >
                  {Object.entries(ENGLISH_LEVEL_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowQuestionModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveQuestion}
                disabled={savingQuestion || !questionForm.text.trim()}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors font-medium"
              >
                {savingQuestion ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Test Modal */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingTest ? 'Edit Test' : 'Create Test'}
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={testForm.title}
                  onChange={(e) => setTestForm({ ...testForm, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="English Level Test"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={testForm.description}
                  onChange={(e) => setTestForm({ ...testForm, description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                  placeholder="Test your English level..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time Limit (minutes)
                  </label>
                  <input
                    type="number"
                    value={testForm.timeLimit}
                    onChange={(e) => setTestForm({ ...testForm, timeLimit: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="20"
                    min="1"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={testForm.isPublished}
                      onChange={(e) => setTestForm({ ...testForm, isPublished: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Publish test</span>
                  </label>
                </div>
              </div>

              {/* Questions selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Questions ({testForm.questionIds.length} selected)
                </label>
                {questions.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No questions available. Create questions first.
                  </p>
                ) : (
                  <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                    {questions.map((q) => (
                      <label
                        key={q.id}
                        className="flex items-start gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                      >
                        <input
                          type="checkbox"
                          checked={testForm.questionIds.includes(q.id)}
                          onChange={() => toggleQuestionInTest(q.id)}
                          className="w-4 h-4 mt-0.5 text-indigo-600 rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">{q.text}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">{q.level}</span>
                            <span className={`text-xs ${q.correctAnswer ? 'text-green-600' : 'text-red-600'}`}>
                              → {q.correctAnswer ? 'Yes' : 'No'}
                            </span>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowTestModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTest}
                disabled={savingTest || !testForm.title.trim()}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors font-medium"
              >
                {savingTest ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
