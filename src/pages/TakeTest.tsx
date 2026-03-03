import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getTestById, submitTestResult } from '../services/testService';
import type { Test, TestAnswer } from '../types/test';

type Step = 'info' | 'test' | 'result';

export function TakeTest() {
  const { testId } = useParams<{ testId: string }>();
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Steps
  const [step, setStep] = useState<Step>('info');

  // User info
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Test state
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
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
      const testData = await getTestById(id);
      if (!testData) {
        setError('Test not found');
      } else if (!testData.isPublished) {
        setError('This test is not available');
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

  const handleStartTest = (e: React.FormEvent) => {
    e.preventDefault();
    setStartedAt(new Date());
    setStep('test');
  };

  const handleAnswer = (questionId: string, answer: string | string[]) => {
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
    if (!test || !startedAt) return;

    // Build answers array
    const testAnswers: TestAnswer[] = test.questions.map((q) => {
      const userAnswer = answers[q.id] || '';
      const isCorrect = Array.isArray(q.correctAnswer)
        ? JSON.stringify(userAnswer) === JSON.stringify(q.correctAnswer)
        : userAnswer === q.correctAnswer;

      return {
        questionId: q.id,
        answer: userAnswer,
        isCorrect,
      };
    });

    try {
      await submitTestResult(
        test.id,
        test.title,
        { name, email, phone },
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
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
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

  // Step: Test
  if (step === 'test') {
    const question = test.questions[currentQuestion];
    const isLastQuestion = currentQuestion === test.questions.length - 1;
    const currentAnswer = answers[question.id];

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
            <h2 className="text-xl font-semibold text-gray-900 mb-6">{question.question}</h2>

            {/* Options for choice questions */}
            {question.options && (
              <div className="space-y-3">
                {question.options.map((option, index) => (
                  <label
                    key={index}
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                      currentAnswer === option
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name={question.id}
                      value={option}
                      checked={currentAnswer === option}
                      onChange={() => handleAnswer(question.id, option)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    />
                    <span className="ml-3 text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            )}

            {/* Text input for fill-blank questions */}
            {question.type === 'fill_blank' && (
              <input
                type="text"
                value={(currentAnswer as string) || ''}
                onChange={(e) => handleAnswer(question.id, e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-lg"
                placeholder="Type your answer..."
              />
            )}
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
                disabled={!currentAnswer}
                className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Submit Test
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!currentAnswer}
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
