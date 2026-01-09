import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { ShieldCheck, Sparkles } from 'lucide-react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import usePageTitle from '@/hooks/usePageTitle';
import useAuthSession from '@/hooks/useAuthSession';
import { getApiErrorMessage, login, LoginRequest } from '@/lib/api';
import { setAuthSession } from '@/lib/auth';

interface LoginErrors {
  username?: string;
  password?: string;
  form?: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuthSession();
  const [form, setForm] = useState<LoginRequest>({ username: '', password: '' });
  const [errors, setErrors] = useState<LoginErrors>({});

  usePageTitle('로그인');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setAuthSession(data.token);
      toast({
        title: '로그인 완료!',
        description: '다시 만나 반가워요.',
      });
      const redirectPath =
        (location.state as { from?: string } | null)?.from ?? '/';
      navigate(redirectPath);
    },
    onError: (error) => {
      setErrors((prev) => ({
        ...prev,
        form: getApiErrorMessage(error, '로그인에 실패했어요.'),
      }));
    },
  });

  const validate = () => {
    const nextErrors: LoginErrors = {};
    if (form.username.trim().length < 4 || form.username.trim().length > 10) {
      nextErrors.username = '아이디는 4~10자로 입력해주세요.';
    }
    if (form.password.trim().length < 4) {
      nextErrors.password = '비밀번호는 4자 이상 입력해주세요.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (loginMutation.isPending) return;
    if (!validate()) return;
    loginMutation.mutate({
      username: form.username.trim(),
      password: form.password,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/40 via-background to-accent/20">
      <Header
        rightContent={
          <Button variant="ghost" size="sm" asChild>
            <Link to="/signup">회원가입</Link>
          </Button>
        }
      />

      <main className="max-w-5xl mx-auto px-4 lg:px-8 py-8 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-2 items-center">
          <section className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-primary">
              <Sparkles className="h-4 w-4" />
              SafeLens 보안 로그인
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
                다시 만나서 반가워요
              </h1>
              <p className="text-sm lg:text-base text-muted-foreground leading-relaxed">
                로그인하고 안전한 편집 기록을 이어가세요. 모든 요청은 24시간 만료되는
                JWT 토큰으로 보호됩니다.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { title: '편집 기록 보호', desc: '히스토리 접근은 인증 필수' },
                { title: '안전한 공유', desc: '보안 토큰으로 링크 보호' },
                { title: 'AI 자동 탐지', desc: '민감 정보 자동 감지' },
                { title: '24시간 세션', desc: '하루 동안 안전하게 유지' },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm"
                >
                  <p className="text-sm font-semibold text-foreground">
                    {item.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <Card className="border-border/70 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">로그인</CardTitle>
              <CardDescription>
                아이디와 비밀번호를 입력해주세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2 text-left">
                  <Label htmlFor="username">아이디</Label>
                  <Input
                    id="username"
                    value={form.username}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        username: event.target.value,
                      }))
                    }
                    placeholder="user01"
                  />
                  {errors.username && (
                    <p className="text-xs text-destructive">
                      {errors.username}
                    </p>
                  )}
                </div>
                <div className="space-y-2 text-left">
                  <Label htmlFor="password">비밀번호</Label>
                  <Input
                    id="password"
                    type="password"
                    value={form.password}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        password: event.target.value,
                      }))
                    }
                    placeholder="••••••••"
                  />
                  {errors.password && (
                    <p className="text-xs text-destructive">
                      {errors.password}
                    </p>
                  )}
                </div>
                {errors.form && (
                  <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-left text-xs text-destructive">
                    {errors.form}
                  </div>
                )}
                <Button
                  type="submit"
                  size="lg"
                  variant="primary"
                  className="w-full"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? '로그인 중...' : '로그인'}
                </Button>
                <div className="text-xs text-muted-foreground text-center">
                  아직 계정이 없으신가요?{' '}
                  <Link
                    to="/signup"
                    className="font-semibold text-primary hover:underline"
                  >
                    회원가입
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <div className="pointer-events-none fixed bottom-8 left-1/2 hidden -translate-x-1/2 items-center gap-2 rounded-full bg-card/80 px-4 py-2 text-xs text-muted-foreground shadow-sm md:flex">
        <ShieldCheck className="h-4 w-4 text-primary" />
        로그인 세션은 24시간 동안 유지됩니다.
      </div>
    </div>
  );
};

export default Login;
