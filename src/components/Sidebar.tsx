import { useState } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSidebar } from '../contexts/SidebarContext';
import { Avatar } from './Avatar';
import logo from '../assets/logo/DialectLogo.png';

const menuItems = [
  {
    to: '/app',
    label: 'Dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    to: '/app/profile',
    label: 'Profile',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

const adminItems = [
  {
    to: '/app/users',
    label: 'Students',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    to: '/app/results',
    label: 'Results',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
];

const librarySubItems = [
  {
    to: '/app/library/tests',
    label: 'Tests',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    to: '/app/library/books',
    label: 'Books',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
];

export function Sidebar() {
  const { collapsed, toggle } = useSidebar();
  const { logout, isAdmin, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isLibraryActive = location.pathname.startsWith('/app/library');
  const [libraryOpen, setLibraryOpen] = useState(isLibraryActive);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const allItems = isAdmin ? [...menuItems, ...adminItems] : menuItems;

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 flex flex-col transition-all duration-300 z-40 overflow-hidden ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
        <Link
          to="/"
          className={`${collapsed ? 'hidden' : 'block'}`}
        >
          <img src={logo} alt="Dialect" className="w-[120px]" />
        </Link>
        <button
          onClick={toggle}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          <svg
            className={`w-5 h-5 transition-transform ${collapsed ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
        <ul className="space-y-1 px-2">
          {allItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/app'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 h-10 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
                title={collapsed ? item.label : undefined}
              >
                {item.icon}
                {!collapsed && <span className="font-medium whitespace-nowrap">{item.label}</span>}
              </NavLink>
            </li>
          ))}

          {/* Library with submenu - admin only */}
          {isAdmin && (
            <li>
              <button
                onClick={() => setLibraryOpen(!libraryOpen)}
                className={`flex items-center gap-3 px-3 h-10 w-full rounded-lg transition-colors ${
                  isLibraryActive
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title={collapsed ? 'Library' : undefined}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                {!collapsed && (
                  <>
                    <span className="font-medium whitespace-nowrap flex-1 text-left">Library</span>
                    <svg
                      className={`w-4 h-4 transition-transform ${libraryOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </>
                )}
              </button>

              {/* Submenu */}
              {!collapsed && libraryOpen && (
                <ul className="mt-1 ml-4 space-y-1">
                  {librarySubItems.map((subItem) => (
                    <li key={subItem.to}>
                      <NavLink
                        to={subItem.to}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 h-9 rounded-lg transition-colors ${
                            isActive
                              ? 'bg-indigo-50 text-indigo-600'
                              : 'text-gray-500 hover:bg-gray-100'
                          }`
                        }
                      >
                        {subItem.icon}
                        <span className="text-sm whitespace-nowrap">{subItem.label}</span>
                      </NavLink>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          )}
        </ul>
      </nav>

      {/* User & Logout */}
      <div className="px-2 py-2 border-t border-gray-200 space-y-1">
        {profile && (
          <Link
            to="/app/profile"
            className="flex items-center gap-3 px-2 h-10 rounded-lg hover:bg-gray-100 transition-colors"
            title={collapsed ? profile.displayName : undefined}
          >
            <Avatar src={profile.photoURL} name={profile.displayName} size="sm" />
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">{profile.displayName}</div>
                <div className="text-xs text-gray-500 truncate">{profile.email}</div>
              </div>
            )}
          </Link>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-2 h-10 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          title={collapsed ? 'Log out' : undefined}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {!collapsed && <span className="font-medium whitespace-nowrap">Log out</span>}
        </button>
      </div>
    </aside>
  );
}
