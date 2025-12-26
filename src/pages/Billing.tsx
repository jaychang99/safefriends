import React, { useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarClock,
  Check,
  CreditCard,
  Crown,
  Receipt,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import Header from '@/components/Header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import usePageTitle from '@/hooks/usePageTitle';

type PlanId = 'basic' | 'pro' | 'enterprise';

interface Plan {
  id: PlanId;
  name: string;
  price: string;
  priceNote?: string;
  description: string;
  features: string[];
  cta: string;
  highlight?: boolean;
}

const plans: Plan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: '무료',
    description: '개인 사용자를 위한 기본 보호',
    features: ['블러/모자이크 필터', '표준 감지 옵션', '저장 · 공유 지원'],
    cta: '현재 이용 중',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '12,000원',
    priceNote: '/월',
    description: 'AI가 알아서 자연스럽게 복원',
    features: [
      'AI 자연스럽게 지우기',
      '무제한 감지 및 토글',
      '고해상도 내보내기',
    ],
    cta: 'Pro로 업그레이드',
    highlight: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '맞춤 상담',
    description: '팀과 보안을 위한 전담 지원',
    features: [
      '팀 좌석 · 접근 제어',
      '보안 규정 맞춤 설정',
      '전담 매니저 및 SLA',
    ],
    cta: '상담 요청하기',
  },
];

const Billing: React.FC = () => {
  const navigate = useNavigate();
  const planSectionRef = useRef<HTMLDivElement>(null);
  const [currentPlan, setCurrentPlan] = useState<PlanId>('basic');

  const nextBillingDate = useMemo(() => {
    const base = new Date();
    base.setDate(base.getDate() + 14);
    return format(base, 'yyyy.MM.dd');
  }, []);

  const invoiceItems = useMemo(
    () => [
      {
        title: currentPlan === 'pro' ? 'Pro 구독 (월)' : 'Basic 이용',
        date: nextBillingDate,
        amount: currentPlan === 'pro' ? '12,000원' : '무료',
      },
      {
        title: '추가 AI 편집',
        date: '2024.05.28',
        amount: currentPlan === 'pro' ? '0원 · 포함' : '0원 · 이벤트',
      },
      {
        title: '상담/문의 기록',
        date: '2024.05.01',
        amount: '무료',
      },
    ],
    [currentPlan, nextBillingDate],
  );

  const usageLimit = currentPlan === 'pro' ? 500 : 50;
  const used = 28;
  const aiEdits = currentPlan === 'pro' ? 22 : 6;

  usePageTitle('요금제 & 청구');

  const handlePlanSelect = (plan: Plan) => {
    if (plan.id === 'enterprise') {
      toast({
        title: '상담 요청이 접수되었어요',
        description: '전담 매니저가 곧 연락드릴게요.',
      });
      return;
    }

    if (plan.id === currentPlan) {
      toast({
        title: '이미 이용 중인 플랜이에요',
        description: '다른 플랜을 선택하거나 상담을 요청해보세요.',
      });
      return;
    }

    setCurrentPlan(plan.id);
    toast({
      title: `${plan.name} 플랜으로 변경했어요`,
      description: '다음 결제 주기부터 새로운 혜택이 적용돼요.',
    });
  };

  const activePlan = plans.find((plan) => plan.id === currentPlan) ?? plans[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/40 via-background to-background">
      <Header
        showBack
        onBack={() => navigate(-1)}
        title="요금제 & 청구"
        rightContent={
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard">히스토리</Link>
          </Button>
        }
      />

      <main className="max-w-6xl mx-auto px-4 lg:px-8 py-8 space-y-8">
        <Card className="relative overflow-hidden border-primary/25 bg-gradient-to-r from-primary/10 via-secondary/80 to-background shadow-lg">
          <div className="absolute inset-y-0 right-0 w-64 rotate-3 bg-gradient-to-l from-primary/10 to-transparent blur-3xl pointer-events-none" />
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <Badge className="bg-white/70 text-primary border border-primary/30">
                현재 플랜
              </Badge>
              <div className="flex items-center gap-2">
                <Crown className="w-6 h-6 text-primary" />
                <CardTitle className="text-2xl md:text-3xl">
                  {activePlan.name}
                </CardTitle>
              </div>
              <CardDescription className="text-base">
                {activePlan.description}
              </CardDescription>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  toast({
                    title: '청구 내역을 메일로 보냈어요',
                    description: 'billing@safelens.test로 전송됨',
                  });
                }}
              >
                <Receipt className="w-4 h-4" />
                청구서 받기
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() =>
                  planSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
                }
              >
                <ArrowUpRight className="w-4 h-4" />
                플랜 변경
              </Button>
            </div>
          </CardHeader>

          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-white/70 border border-border/70 p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <CalendarClock className="w-4 h-4 text-primary" />
                다음 결제
              </div>
              <p className="text-lg font-semibold text-foreground">
                {currentPlan === 'basic'
                  ? '결제 예정 없음'
                  : `${nextBillingDate} · 12,000원/월`}
              </p>
              <p className="text-xs text-muted-foreground">
                플랜 변경 시 다음 주기부터 반영
              </p>
            </div>

            <div className="rounded-2xl bg-white/70 border border-border/70 p-4 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="w-4 h-4 text-primary" />
                이번 달 보호 내역
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-lg font-semibold text-foreground">
                    {used}/{usageLimit}장
                  </p>
                  <p className="text-xs text-muted-foreground">
                    이미지 보호 한도
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary border-primary/30"
                >
                  {currentPlan === 'pro' ? '우선 처리' : '표준'}
                </Badge>
              </div>
              <Progress value={(used / usageLimit) * 100} />
            </div>

            <div className="rounded-2xl bg-white/70 border border-border/70 p-4 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="w-4 h-4 text-primary" />
                AI 자연스럽게 지우기
              </div>
              <div className="flex items-end justify-between">
                <p className="text-lg font-semibold text-foreground">
                  {aiEdits}회 사용
                </p>
                <Badge
                  variant="outline"
                  className="border-primary/30 text-primary"
                >
                  Pro 전용
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                자연스러운 복원이 필요한 경우 Pro로 업그레이드하세요.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="border border-border/70 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <CreditCard className="w-5 h-5 text-primary" />
                결제 & 알림 설정
              </CardTitle>
              <CardDescription>
                청구 메일과 결제 수단을 확인하고 변경할 수 있어요.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border/70 p-4 space-y-2 bg-secondary/60">
                <p className="text-sm text-muted-foreground">청구 메일</p>
                <p className="font-semibold text-foreground">
                  billing@safelens.test
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="px-0"
                  onClick={() =>
                    toast({
                      title: '청구 메일을 변경했어요',
                      description: '새로운 알림 메일로 안내드릴게요.',
                    })
                  }
                >
                  <ArrowDownLeft className="w-4 h-4" />
                  메일 변경
                </Button>
              </div>

              <div className="rounded-xl border border-border/70 p-4 space-y-2 bg-secondary/60">
                <p className="text-sm text-muted-foreground">결제 수단</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">
                      국민카드 • 0921
                    </p>
                    <p className="text-xs text-muted-foreground">
                      만료 2026.03
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-primary/30 text-primary"
                  >
                    기본
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="px-0"
                  onClick={() =>
                    toast({
                      title: '결제 수단을 업데이트했어요',
                      description: '다음 결제부터 새 카드로 처리됩니다.',
                    })
                  }
                >
                  <ArrowUpRight className="w-4 h-4" />
                  결제 수단 변경
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/70 shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">최근 청구</CardTitle>
              <CardDescription>
                요금이 어떻게 계산되는지 한눈에 확인하세요.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {invoiceItems.map((invoice) => (
                <div
                  key={invoice.title + invoice.date}
                  className="flex items-center justify-between rounded-xl border border-border/60 p-3 bg-card/70"
                >
                  <div>
                    <p className="font-semibold text-foreground">
                      {invoice.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {invoice.date}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {invoice.amount}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div ref={planSectionRef} className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">요금제 선택</p>
              <h2 className="text-2xl font-bold text-foreground">
                내게 맞는 플랜으로 전환
              </h2>
            </div>
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary border-primary/30"
            >
              기존 팝업과 동일한 혜택 제공
            </Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {plans.map((plan) => {
              const isActive = plan.id === currentPlan;
              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl border p-5 shadow-sm transition-all ${
                    plan.highlight
                      ? 'border-primary bg-gradient-to-br from-primary/8 via-background to-secondary shadow-lg'
                      : 'border-border/60 bg-card/80'
                  }`}
                >
                  {plan.highlight && (
                    <span className="absolute right-4 top-4 rounded-full bg-primary text-primary-foreground px-2 py-1 text-[11px] font-semibold shadow-sm">
                      추천
                    </span>
                  )}

                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-lg font-bold text-foreground">
                        {plan.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {plan.description}
                      </p>
                    </div>
                    {isActive && (
                      <Badge
                        variant="outline"
                        className="border-primary/40 text-primary"
                      >
                        이용 중
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-3xl font-extrabold text-foreground">
                      {plan.price}
                    </span>
                    {plan.priceNote && (
                      <span className="text-sm font-semibold text-muted-foreground">
                        {plan.priceNote}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 text-sm text-foreground">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-primary mt-0.5" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    className="mt-5 w-full"
                    variant={
                      isActive
                        ? 'secondary'
                        : plan.highlight
                        ? 'primary'
                        : 'outline'
                    }
                    size="lg"
                    disabled={plan.id === 'basic' && isActive}
                    onClick={() => handlePlanSelect(plan)}
                  >
                    {isActive ? '현재 이용 중' : plan.cta}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Billing;
