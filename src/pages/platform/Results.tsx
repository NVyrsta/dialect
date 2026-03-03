import { useEffect, useState } from 'react';
import { getAllTestResults } from '../../services/testService';
import type { TestResult } from '../../types/test';

export function Results() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      const allResults = await getAllTestResults();
      setResults(allResults);
    } catch (error) {
      console.error('Failed to load results:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Test Results</h1>
        <p className="text-gray-500 mt-1">View all submitted test results</p>
      </div>

      {results.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <p className="text-gray-500">No test results yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Test</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Level</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Score</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Time</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Date</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {results.map((result) => (
                <tr key={result.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{result.takerName}</div>
                    <div className="text-sm text-gray-500">{result.takerEmail}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{result.testTitle}</td>
                  <td className="px-4 py-3">
                    {result.determinedLevel && (
                      <span className="px-2 py-1 text-xs font-bold rounded bg-indigo-100 text-indigo-700">
                        {result.determinedLevel}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`font-medium ${
                        result.percentage >= 70
                          ? 'text-green-600'
                          : result.percentage >= 50
                          ? 'text-yellow-600'
                          : 'text-red-600'
                      }`}
                    >
                      {result.correctCount}/{result.totalQuestions} ({result.percentage}%)
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{formatTime(result.timeSpent)}</td>
                  <td className="px-4 py-3 text-gray-500 text-sm">{formatDate(result.completedAt)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelectedResult(result)}
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Details Modal */}
      {selectedResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedResult(null)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedResult.takerName}</h2>
                <p className="text-sm text-gray-500">{selectedResult.takerEmail}</p>
              </div>
              <button
                onClick={() => setSelectedResult(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              {/* Summary */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-indigo-600">{selectedResult.determinedLevel}</div>
                  <div className="text-xs text-gray-500">Level</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-gray-900">{selectedResult.percentage}%</div>
                  <div className="text-xs text-gray-500">Score</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-green-600">{selectedResult.correctCount}</div>
                  <div className="text-xs text-gray-500">Correct</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {selectedResult.totalQuestions - selectedResult.correctCount}
                  </div>
                  <div className="text-xs text-gray-500">Mistakes</div>
                </div>
              </div>

              {/* Contact info */}
              {selectedResult.takerPhone && (
                <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500">Phone</div>
                  <div className="font-medium text-gray-900">{selectedResult.takerPhone}</div>
                </div>
              )}

              {/* Answers */}
              <h3 className="font-semibold text-gray-900 mb-3">Answers</h3>
              <div className="space-y-2">
                {selectedResult.answers.map((answer, index) => (
                  <div
                    key={answer.questionId}
                    className={`p-3 rounded-lg border ${
                      answer.isCorrect
                        ? 'border-green-200 bg-green-50'
                        : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <span className="text-xs text-gray-400">#{index + 1}</span>
                        <p className="text-sm font-medium text-gray-900 mt-0.5">
                          {answer.questionText || `Question ${index + 1}`}
                        </p>
                      </div>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded ${
                          answer.isCorrect
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {answer.isCorrect ? '✓' : '✗'}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-sm">
                      <span className={answer.isCorrect ? 'text-green-600' : 'text-red-600'}>
                        Answer: <strong>{answer.userAnswer ? 'Yes' : 'No'}</strong>
                      </span>
                      {!answer.isCorrect && (
                        <span className="text-gray-500">
                          Correct: <strong>{answer.correctAnswer ? 'Yes' : 'No'}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
