import React from 'react';
import { Shield, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  showBack?: boolean;
  onBack?: () => void;
  title?: string;
  rightContent?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ showBack, onBack, title, rightContent }) => {
  return (
    <header className="sticky top-0 inset-x-0 z-40 flex items-center justify-between px-5 py-3 bg-card/80 backdrop-blur-md border-b border-border/50">
      <div className="flex items-center gap-2">
        {showBack && (
          <button
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>
        )}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 gradient-primary rounded-xl flex items-center justify-center shadow-md">
            <Shield className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">
            {title || 'SafeFriends'}
          </span>
        </Link>
      </div>

      <div className="flex items-center justify-end min-w-[2.5rem]">
        {rightContent}
      </div>
    </header>
  );
};

export default Header;
