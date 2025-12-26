import { useEffect, useState } from 'react';
import { Shield } from 'lucide-react';

interface SplashScreenProps {
  visible: boolean;
}

const SplashScreen = ({ visible }: SplashScreenProps) => {
  const [shouldRender, setShouldRender] = useState(visible);

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      return;
    }

    const timeout = setTimeout(() => setShouldRender(false), 400);
    return () => clearTimeout(timeout);
  }, [visible]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-ui-2 to-ui-3 text-foreground transition-opacity duration-500 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="flex flex-col items-center gap-3 px-7 py-6 rounded-2xl bg-card shadow-card border border-border/60 text-center">
        <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
          <Shield className="w-7 h-7 text-primary-foreground" />
        </div>
        <div>
          <p className="text-sm font-semibold text-primary">SafeFriends</p>
          <p className="text-base font-medium text-foreground mt-1">잠시만 기다려 주세요</p>
          <p className="text-sm text-muted-foreground mt-1">사진을 안전하게 준비하는 중입니다.</p>
        </div>
        <div className="w-28 h-1.5 bg-muted/40 rounded-full overflow-hidden">
          <div className="h-full w-full bg-primary animate-progress rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
