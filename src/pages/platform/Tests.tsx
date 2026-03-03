import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllTests, generateTestLink, deleteTest } from '../../services/testService';
import type { Test } from '../../types/test';

export function Tests() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    try {
      const allTests = await getAllTests();
      setTests(allTests);
    } catch (error) {
      console.error('Failed to load tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async (testId: string) => {
    const link = generateTestLink(testId);
    await navigator.clipboard.writeText(link);
    setCopiedId(testId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (testId: string) => {
    if (!confirm('Are you sure you want to delete this test?')) return;

    try {
      await deleteTest(testId);
      setTests(tests.filter((t) => t.id !== testId));
    } catch (error) {
      console.error('Failed to delete test:', error);
    }
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
          <p className="text-gray-500 mt-1">Create and manage level tests</p>
        </div>
        <Link
          to="/app/library/tests/create"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          + Create Test
        </Link>
      </div>

      {tests.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-500 mb-4">No tests yet</p>
          <Link
            to="/app/library/tests/create"
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Create your first test
          </Link>
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
                  <p className="text-sm text-gray-500 mt-1">{test.description}</p>
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
                {test.questions.length} questions
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
                <Link
                  to={`/app/library/tests/edit/${test.id}`}
                  className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(test.id)}
                  className="px-3 py-2 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
