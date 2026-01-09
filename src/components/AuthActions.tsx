import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { clearAuthSession } from '@/lib/auth';
import useAuthSession from '@/hooks/useAuthSession';

const AuthActions: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthSession();

  const handleLogout = () => {
    clearAuthSession();
    toast({
      title: '로그아웃 완료',
      description: '안전하게 로그아웃했어요.',
    });
    navigate('/login');
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/login">로그인</Link>
        </Button>
        <Button variant="primary" size="sm" asChild>
          <Link to="/signup">회원가입</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="hidden sm:flex items-center gap-2 rounded-full bg-secondary/80 px-3 py-1.5 text-xs">
        <UserRound className="h-4 w-4 text-primary" />
        <span className="font-semibold text-foreground">
          {user?.nickname ?? user?.username ?? '사용자'}
        </span>
      </div>
      <Button variant="ghost" size="sm" className="gap-2" onClick={handleLogout}>
        <LogOut className="h-4 w-4" />
        로그아웃
      </Button>
    </div>
  );
};

export default AuthActions;
