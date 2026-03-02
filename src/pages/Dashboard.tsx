import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome, {user?.displayName || 'Learner'}!
              </h1>
              <p className="text-gray-600 mt-1">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Log out
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-indigo-50 rounded-xl">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Start Learning
              </h2>
              <p className="text-gray-600 mb-4">
                Begin a conversation with our AI tutor
              </p>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                New Conversation
              </button>
            </div>

            <div className="p-6 bg-gray-50 rounded-xl">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Your Progress
              </h2>
              <p className="text-gray-600 mb-4">
                Track your learning journey
              </p>
              <div className="text-3xl font-bold text-indigo-600">0 lessons</div>
            </div>
          </div>

          <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-xl">
            <p className="text-yellow-800">
              This is a placeholder dashboard. The full platform features are coming soon!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
