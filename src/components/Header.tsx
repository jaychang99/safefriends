import React from 'react';
import { Shield, ChevronLeft } from 'lucide-react';

interface HeaderProps {
  showBack?: boolean;
  onBack?: () => void;
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ showBack, onBack, title }) => {
  return (
    <header className="flex items-center justify-between px-5 py-3 bg-card/80 backdrop-blur-md border-b border-border/50">
      <div className="w-10">
        {showBack && (
          <button 
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 gradient-primary rounded-xl flex items-center justify-center shadow-md">
          <Shield className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="text-lg font-bold text-foreground">
          {title || 'SafeFriends'}
        </span>
      </div>
      
      <div className="w-10" />
    </header>
  );
};

export default Header;
