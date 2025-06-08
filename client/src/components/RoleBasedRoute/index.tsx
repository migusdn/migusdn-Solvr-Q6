import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import ProtectedRoute from '../ProtectedRoute';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
  fallbackPath?: string;
}

/**
 * 특정 역할을 가진 사용자만 접근할 수 있는 라우트 컴포넌트
 * 
 * 인증되지 않은 사용자는 로그인 페이지로 리디렉션됩니다.
 * 인증되었지만 필요한 역할이 없는 사용자는 fallbackPath로 리디렉션됩니다.
 * 
 * @param children 보호할 컴포넌트/페이지
 * @param allowedRoles 접근 허용할 역할 목록
 * @param fallbackPath 권한 없을 때 리디렉션할 경로 (기본값: "/unauthorized")
 * @returns 인증 및 권한 상태에 따라 자식 컴포넌트 또는 리디렉션
 */
const RoleBasedRoute = ({ 
  children, 
  allowedRoles, 
  fallbackPath = "/unauthorized" 
}: RoleBasedRouteProps) => {
  const { user } = useAuth();

  // ProtectedRoute로 감싸서 인증 여부 먼저 확인
  return (
    <ProtectedRoute>
      {user && allowedRoles.includes(user.role) ? (
        // 사용자 역할이 허용된 역할 목록에 있으면 자식 컴포넌트 렌더링
        <>{children}</>
      ) : (
        // 그렇지 않으면 fallbackPath로 리디렉션
        <Navigate to={fallbackPath} replace />
      )}
    </ProtectedRoute>
  );
};

export default RoleBasedRoute;