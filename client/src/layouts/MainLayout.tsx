import { Outlet, Link } from 'react-router-dom'
import { useState } from 'react'

const MainLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold text-primary-600">
                풀스택 보일러플레이트
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button 
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-neutral-600 hover:text-primary-600 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
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
                className="text-neutral-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                홈
              </Link>
              <Link
                to="/users"
                className="text-neutral-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                유저 관리
              </Link>
              <Link
                to="/sleep-tracker"
                className="text-neutral-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                수면 트래커
              </Link>
            </nav>
          </div>

          {/* Mobile menu, show/hide based on menu state */}
          <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                to="/"
                className="block text-neutral-600 hover:text-primary-600 px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                홈
              </Link>
              <Link
                to="/users"
                className="block text-neutral-600 hover:text-primary-600 px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                유저 관리
              </Link>
              <Link
                to="/sleep-tracker"
                className="block text-neutral-600 hover:text-primary-600 px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                수면 트래커
              </Link>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </div>
      </main>
      <footer className="bg-white border-t border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-neutral-500 text-sm">
            &copy; {new Date().getFullYear()} 풀스택 보일러플레이트. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default MainLayout
