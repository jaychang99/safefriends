import React from 'react';

interface PhoneFrameProps {
  children: React.ReactNode;
}

const PhoneFrame: React.FC<PhoneFrameProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted via-background to-accent/30 p-4">
      {/* iPhone 14 Pro Frame */}
      <div className="relative w-[393px] h-[852px] bg-foreground rounded-[55px] p-3 shadow-phone">
        {/* Dynamic Island */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[126px] h-[37px] bg-foreground rounded-full z-50" />
        
        {/* Screen */}
        <div className="relative w-full h-full bg-card rounded-[47px] overflow-hidden">
          {/* Status Bar */}
          <div className="absolute top-0 left-0 right-0 h-14 flex items-end justify-between px-8 pb-1 z-40">
            <span className="text-xs font-medium text-foreground">9:41</span>
            <div className="flex items-center gap-1">
              <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor" className="text-foreground">
                <path d="M1 3.5C1 2.67 1.67 2 2.5 2h2C5.33 2 6 2.67 6 3.5v5C6 9.33 5.33 10 4.5 10h-2C1.67 10 1 9.33 1 8.5v-5zM7 4.5C7 3.67 7.67 3 8.5 3h2c.83 0 1.5.67 1.5 1.5v4c0 .83-.67 1.5-1.5 1.5h-2C7.67 10 7 9.33 7 8.5v-4zM13 2.5c0-.83.67-1.5 1.5-1.5h2c.83 0 1.5.67 1.5 1.5v6c0 .83-.67 1.5-1.5 1.5h-2c-.83 0-1.5-.67-1.5-1.5v-6z"/>
              </svg>
              <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor" className="text-foreground">
                <path d="M8.5 2.5a6 6 0 016 6h-2a4 4 0 00-4-4v-2zm0 4a2 2 0 012 2h-4a2 2 0 012-2z"/>
              </svg>
              <div className="flex items-center">
                <div className="w-[25px] h-[12px] border-2 border-foreground rounded-sm relative">
                  <div className="absolute inset-[2px] right-[3px] bg-foreground rounded-[1px]" />
                </div>
                <div className="w-[2px] h-[5px] bg-foreground rounded-r-sm ml-[1px]" />
              </div>
            </div>
          </div>
          
          {/* App Content */}
          <div className="h-full pt-14 overflow-hidden">
            {children}
          </div>
          
          {/* Home Indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[134px] h-[5px] bg-foreground/30 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default PhoneFrame;
