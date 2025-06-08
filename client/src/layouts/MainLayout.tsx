import { Outlet, Link } from 'react-router-dom'
import { useState, useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'

const MainLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, logout, user } = useContext(AuthContext);

  // 관리자 권한 확인
  const isAdmin = user?.role === 'admin';

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-indigo-700 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold text-white flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                <span>수면 트래킹 서비스</span>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button 
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-indigo-200 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-300"
                aria-expanded="false"
                aria-label="메인 메뉴 열기"
              >
                <span className="sr-only">메뉴 열기</span>
                {/* Icon when menu is closed */}
                <svg
                  className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
                {/* Icon when menu is open */}
                <svg
                  className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Desktop navigation */}
            <nav className="hidden md:flex space-x-4">
              <Link
                to="/"
                className="text-white hover:text-indigo-200 px-3 py-2 rounded-md text-sm font-medium"
              >
                홈
              </Link>
              {isAdmin && isAuthenticated && (
                <Link
                  to="/users"
                  className="text-white hover:text-indigo-200 px-3 py-2 rounded-md text-sm font-medium"
                >
                  유저 관리
                </Link>
              )}
              <Link
                to="/sleep-tracker"
                className="text-white hover:text-indigo-200 px-3 py-2 rounded-md text-sm font-medium"
              >
                수면 트래커
              </Link>
              {isAuthenticated ? (
                <button
                  onClick={logout}
                  className="text-white hover:text-indigo-200 px-3 py-2 rounded-md text-sm font-medium"
                >
                  로그아웃
                </button>
              ) : (
                <Link
                  to="/login"
                  className="text-white hover:text-indigo-200 px-3 py-2 rounded-md text-sm font-medium"
                >
                  로그인
                </Link>
              )}
            </nav>
          </div>

          {/* Mobile menu, show/hide based on menu state */}
          <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                to="/"
                className="block text-white hover:text-indigo-200 px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                홈
              </Link>
              {isAdmin && isAuthenticated && (
                <Link
                  to="/users"
                  className="block text-white hover:text-indigo-200 px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  유저 관리
                </Link>
              )}
              <Link
                to="/sleep-tracker"
                className="block text-white hover:text-indigo-200 px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                수면 트래커
              </Link>
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left text-white hover:text-indigo-200 px-3 py-2 rounded-md text-base font-medium"
                >
                  로그아웃
                </button>
              ) : (
                <Link
                  to="/login"
                  className="block text-white hover:text-indigo-200 px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  로그인
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>
      <main className="flex-grow bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </div>
      </main>
      <footer className="bg-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">수면 트래킹 서비스</h3>
              <p className="text-indigo-200">
                더 나은 수면 습관을 위한 최고의 트래킹 솔루션
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">빠른 링크</h3>
              <ul className="space-y-2">
                <li><Link to="/" className="text-indigo-200 hover:text-white">홈</Link></li>
                <li><Link to="/sleep-tracker" className="text-indigo-200 hover:text-white">수면 트래커</Link></li>
                <li><Link to="/login" className="text-indigo-200 hover:text-white">로그인</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">문의하기</h3>
              <p className="text-indigo-200">
                이메일: migusdn@gmail.com<br />
                <a href="https://github.com/migusdn/migusdn-Solvr-Q6" className="text-indigo-200 hover:text-white">GitHub</a>
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-indigo-600">
            <p className="text-center text-indigo-200">
              &copy; {new Date().getFullYear()} 수면 트래킹 서비스. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default MainLayout
