import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getTestWithQuestions, submitTestResult } from '../services/testService';
import type { TestWithQuestions, TestAnswer } from '../types/test';

type Step = 'info' | 'test' | 'result';

// Normalize correctAnswer to boolean (handles string "true"/"false" from Firebase)
function normalizeAnswer(answer: unknown): boolean {
  if (typeof answer === 'boolean') return answer;
  if (typeof answer === 'string') {
    return answer.toLowerCase() === 'true' || answer.toLowerCase() === 'yes';
  }
  return false;
}

// Email validation
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Phone validation (Ukrainian format or international)
function isValidPhone(phone: string): boolean {
  if (!phone) return true; // Optional field
  const phoneRegex = /^[\d\s\-+()]{10,}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

export function TakeTest() {
  const { testId } = useParams<{ testId: string }>();
  const [test, setTest] = useState<TestWithQuestions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Steps
  const [step, setStep] = useState<Step>('info');

  // User info
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [formErrors, setFormErrors] = useState<{ email?: string; phone?: string }>({});

  // Test state
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [startedAt, setStartedAt] = useState<Date | null>(null);

  // Result
  const [result, setResult] = useState<{
    percentage: number;
    level: string;
    correct: number;
    total: number;
  } | null>(null);

  useEffect(() => {
    if (testId) {
      loadTest(testId);
    }
  }, [testId]);

  const loadTest = async (id: string) => {
    try {
      const testData = await getTestWithQuestions(id);
      if (!testData) {
        setError('Test not found');
      } else if (!testData.isPublished) {
        setError('This test is not available');
      } else if (testData.questions.length === 0) {
        setError('This test has no questions');
      } else {
        setTest(testData);
      }
    } catch (err) {
      setError('Failed to load test');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: { email?: string; phone?: string } = {};

    if (!isValidEmail(email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (phone && !isValidPhone(phone)) {
      errors.phone = 'Please enter a valid phone number';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleStartTest = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setStartedAt(new Date());
    setStep('test');
  };

  const handleAnswer = (questionId: string, answer: boolean) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    if (test && currentQuestion < test.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!test || !startedAt || submitting) return;

    setSubmitting(true);

    // Build answers array with question details
    const testAnswers: TestAnswer[] = test.questions.map((q) => {
      const userAnswer = answers[q.id] ?? false;
      const correctAnswer = normalizeAnswer(q.correctAnswer);
      const isCorrect = userAnswer === correctAnswer;

      return {
        questionId: q.id,
        questionText: q.text,
        userAnswer,
        correctAnswer,
        isCorrect,
      };
    });

    try {
      await submitTestResult(
        test.id,
        test.title,
        { name, email, phone: phone || undefined },
        testAnswers,
        startedAt
      );

      const correct = testAnswers.filter((a) => a.isCorrect).length;
      const total = testAnswers.length;
      const percentage = Math.round((correct / total) * 100);

      let level = 'A1';
      if (percentage >= 90) level = 'C2';
      else if (percentage >= 80) level = 'C1';
      else if (percentage >= 70) level = 'B2';
      else if (percentage >= 60) level = 'B1';
      else if (percentage >= 50) level = 'A2';

      setResult({ percentage, level, correct, total });
      setStep('result');
    } catch (err) {
      console.error('Failed to submit test:', err);
      alert('Failed to submit test. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{error}</h1>
          <p className="text-gray-500">Please check the link and try again</p>
        </div>
      </div>
    );
  }

  if (!test) return null;

  // Step: Info form
  if (step === 'info') {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{test.title}</h1>
            <p className="text-gray-600">{test.description}</p>
            <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-500">
              <span>{test.questions.length} questions</span>
              {test.timeLimit && <span>{test.timeLimit} minutes</span>}
            </div>
          </div>

          <form onSubmit={handleStartTest} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Enter your details</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (formErrors.email) setFormErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${
                    formErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  required
                />
                {formErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (formErrors.phone) setFormErrors((prev) => ({ ...prev, phone: undefined }));
                  }}
                  placeholder="+380..."
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${
                    formErrors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {formErrors.phone && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Start Test
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Step: Test (Yes/No questions)
  if (step === 'test') {
    const question = test.questions[currentQuestion];
    const isLastQuestion = currentQuestion === test.questions.length - 1;
    const currentAnswer = answers[question.id];
    const hasAnswer = currentAnswer !== undefined;

    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
              <span>Question {currentQuestion + 1} of {test.questions.length}</span>
              <span>{Math.round(((currentQuestion + 1) / test.questions.length) * 100)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / test.questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">{question.text}</h2>

            {/* Yes/No buttons */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => handleAnswer(question.id, true)}
                className={`flex-1 py-4 text-lg font-medium rounded-lg border-2 transition-colors ${
                  currentAnswer === true
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => handleAnswer(question.id, false)}
                className={`flex-1 py-4 text-lg font-medium rounded-lg border-2 transition-colors ${
                  currentAnswer === false
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                No
              </button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>

            {isLastQuestion ? (
              <button
                onClick={handleSubmit}
                disabled={!hasAnswer || submitting}
                className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Submitting...' : 'Submit Test'}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!hasAnswer}
                className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Step: Result
  if (step === 'result' && result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Test Completed!</h1>
            <p className="text-gray-600 mb-6">Thank you, {name}!</p>

            <div className="bg-indigo-50 rounded-lg p-6 mb-6">
              <div className="text-5xl font-bold text-indigo-600 mb-2">{result.level}</div>
              <div className="text-gray-600">Your English Level</div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-900">{result.percentage}%</div>
                <div className="text-sm text-gray-500">Score</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-900">
                  {result.correct}/{result.total}
                </div>
                <div className="text-sm text-gray-500">Correct</div>
              </div>
            </div>

            <p className="text-sm text-gray-500">
              Your results have been submitted. We will contact you soon!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
