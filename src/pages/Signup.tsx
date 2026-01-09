import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Sparkles, UserPlus } from 'lucide-react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import usePageTitle from '@/hooks/usePageTitle';
import useAuthSession from '@/hooks/useAuthSession';
import { getApiErrorMessage, SignupRequest, signup } from '@/lib/api';
import { setAuthSession } from '@/lib/auth';

interface SignupErrors {
  username?: string;
  password?: string;
  nickname?: string;
  form?: string;
}

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthSession();
  const [form, setForm] = useState<SignupRequest>({
    username: '',
    password: '',
    nickname: '',
  });
  const [errors, setErrors] = useState<SignupErrors>({});

  usePageTitle('회원가입');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const signupMutation = useMutation({
    mutationFn: signup,
    onSuccess: (data) => {
      setAuthSession(data.token);
      toast({
        title: '회원가입 완료!',
        description: 'SafeLens에 오신 것을 환영합니다.',
      });
      navigate('/');
    },
    onError: (error) => {
      setErrors((prev) => ({
        ...prev,
        form: getApiErrorMessage(error, '회원가입에 실패했어요.'),
      }));
    },
  });

  const validate = () => {
    const nextErrors: SignupErrors = {};
    const username = form.username.trim();
    const nickname = form.nickname.trim();

    if (username.length < 4 || username.length > 10) {
      nextErrors.username = '아이디는 4~10자로 입력해주세요.';
    }
    if (form.password.trim().length < 4) {
      nextErrors.password = '비밀번호는 4자 이상 입력해주세요.';
    }
    if (nickname.length < 2 || nickname.length > 20) {
      nextErrors.nickname = '닉네임은 2~20자로 입력해주세요.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (signupMutation.isPending) return;
    if (!validate()) return;
    signupMutation.mutate({
      username: form.username.trim(),
      password: form.password,
      nickname: form.nickname.trim(),
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/30 via-background to-accent/10">
      <Header
        rightContent={
          <Button variant="ghost" size="sm" asChild>
            <Link to="/login">로그인</Link>
          </Button>
        }
      />

      <main className="max-w-5xl mx-auto px-4 lg:px-8 py-8 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-2 items-center">
          <section className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-primary">
              <UserPlus className="h-4 w-4" />
              SafeLens 첫 시작
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
                안전한 공유를 시작해볼까요?
              </h1>
              <p className="text-sm lg:text-base text-muted-foreground leading-relaxed">
                회원가입하면 편집 히스토리와 맞춤형 보호 설정을 안전하게 관리할 수
                있어요.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { title: 'AI 자동 마스킹', desc: '원클릭 감지 옵션' },
                { title: '편집 히스토리', desc: '보호 내역 자동 저장' },
                { title: '맞춤 프로필', desc: '닉네임 기반 추천' },
                { title: '보안 토큰', desc: '24시간 세션 보호' },
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
              <CardTitle className="text-2xl">회원가입</CardTitle>
              <CardDescription>
                아이디, 비밀번호, 닉네임을 입력해주세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2 text-left">
                  <Label htmlFor="signup-username">아이디</Label>
                  <Input
                    id="signup-username"
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
                  <Label htmlFor="signup-password">비밀번호</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={form.password}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        password: event.target.value,
                      }))
                    }
                    placeholder="4자 이상 입력"
                  />
                  {errors.password && (
                    <p className="text-xs text-destructive">
                      {errors.password}
                    </p>
                  )}
                </div>
                <div className="space-y-2 text-left">
                  <Label htmlFor="signup-nickname">닉네임</Label>
                  <Input
                    id="signup-nickname"
                    value={form.nickname}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        nickname: event.target.value,
                      }))
                    }
                    placeholder="닉네임"
                  />
                  {errors.nickname && (
                    <p className="text-xs text-destructive">
                      {errors.nickname}
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
                  disabled={signupMutation.isPending}
                >
                  {signupMutation.isPending ? '가입 중...' : '회원가입'}
                </Button>
                <div className="text-xs text-muted-foreground text-center">
                  이미 계정이 있으신가요?{' '}
                  <Link
                    to="/login"
                    className="font-semibold text-primary hover:underline"
                  >
                    로그인
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <div className="pointer-events-none fixed bottom-8 left-1/2 hidden -translate-x-1/2 items-center gap-2 rounded-full bg-card/80 px-4 py-2 text-xs text-muted-foreground shadow-sm md:flex">
        <Sparkles className="h-4 w-4 text-primary" />
        가입 즉시 24시간 토큰이 발급됩니다.
      </div>
    </div>
  );
};

export default Signup;
