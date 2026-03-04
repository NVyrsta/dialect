import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { updateUserProfile } from '../../services/userService';
import { Avatar } from '../../components/Avatar';
import { USER_ROLES, USER_ROLE_LABELS } from '../../types/user';

export function Profile() {
  const { profile, refreshProfile } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    setMessage('');

    try {
      await updateUserProfile(profile.uid, { displayName });
      await refreshProfile();
      setMessage('Profile updated successfully!');
    } catch {
      setMessage('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (!profile) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile</h1>

      <div className="max-w-2xl">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
            <Avatar src={profile.photoURL} name={profile.displayName} size="lg" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{profile.displayName}</h2>
              <p className="text-gray-500">{profile.email}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
              <p className="mt-1 text-sm text-gray-500">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <div className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    profile.role === USER_ROLES.ADMIN
                      ? 'bg-purple-100 text-purple-700'
                      : profile.role === USER_ROLES.TEACHER
                        ? 'bg-emerald-100 text-emerald-700'
                        : profile.role === USER_ROLES.STUDENT
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {USER_ROLE_LABELS[profile.role]}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Member Since
              </label>
              <div className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                {profile.createdAt.toLocaleDateString()}
              </div>
            </div>

            {message && (
              <div
                className={`p-3 rounded-lg text-sm ${
                  message.includes('success')
                    ? 'bg-green-50 text-green-600'
                    : 'bg-red-50 text-red-600'
                }`}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
