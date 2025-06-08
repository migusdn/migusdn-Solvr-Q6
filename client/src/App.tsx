import { Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import HomePage from './routes/HomePage'
import UsersPage from './routes/UsersPage'
import UserDetailPage from './routes/UserDetailPage'
import CreateUserPage from './routes/CreateUserPage'
import EditUserPage from './routes/EditUserPage'
import NotFoundPage from './routes/NotFoundPage'
import SleepTrackerPage from './routes/SleepTrackerPage'
import SleepStatsPage from './routes/SleepStatsPage'
import LoginPage from './routes/LoginPage'
import RegisterPage from './routes/RegisterPage'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './contexts/AuthContext'

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* 인증 라우트 */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* 메인 레이아웃 라우트 */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />

          {/* 보호된 라우트 */}
          <Route path="users">
            <Route index element={
              <ProtectedRoute>
                <UsersPage />
              </ProtectedRoute>
            } />
            <Route path="new" element={
              <ProtectedRoute>
                <CreateUserPage />
              </ProtectedRoute>
            } />
            <Route path=":id" element={
              <ProtectedRoute>
                <UserDetailPage />
              </ProtectedRoute>
            } />
            <Route path=":id/edit" element={
              <ProtectedRoute>
                <EditUserPage />
              </ProtectedRoute>
            } />
          </Route>

          <Route path="sleep-tracker" element={
            <ProtectedRoute>
              <SleepTrackerPage />
            </ProtectedRoute>
          } />

          <Route path="sleep-stats" element={
            <ProtectedRoute>
              <SleepStatsPage />
            </ProtectedRoute>
          } />

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
