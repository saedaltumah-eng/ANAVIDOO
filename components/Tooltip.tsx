import React, { useState } from 'react';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className="absolute bottom-full right-1/2 translate-x-1/2 mb-2 w-max max-w-xs bg-gray-800 text-white text-sm rounded-md py-2 px-3 z-10 shadow-lg transition-opacity duration-300 opacity-100">
          {text}
          <div className="absolute top-full right-1/2 translate-x-[-50%] w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-800"></div>
        </div>
      )}
    </div>
  );
};

export default Tooltip;