import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * 인증된 사용자만 접근할 수 있는 보호된 라우트 컴포넌트
 * 
 * 인증되지 않은 사용자는 로그인 페이지로 리디렉션됩니다.
 * 로딩 중에는 로딩 표시기를 보여줍니다.
 * 
 * @param children 보호할 컴포넌트/페이지
 * @returns 인증 상태에 따라 자식 컴포넌트 또는 리디렉션
 */
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // 로딩 중일 때 로딩 표시기 표시
  if (loading) {
    return <div>인증 확인 중...</div>;
  }

  // 인증되지 않은 경우 로그인 페이지로 리디렉션
  if (!isAuthenticated) {
    // 현재 위치를 state로 전달하여 로그인 후 원래 페이지로 돌아올 수 있도록 함
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 인증된 경우 자식 컴포넌트 렌더링
  return <>{children}</>;
};

export default ProtectedRoute;