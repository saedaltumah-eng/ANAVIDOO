import React from 'react';
import { SparklesIcon } from './icons';

interface LoaderProps {
  message: string;
  progress?: number;
}

const Loader: React.FC<LoaderProps> = ({ message, progress }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-white bg-opacity-90 rounded-2xl shadow-xl w-80">
      <SparklesIcon
        className="h-16 w-16 text-violet-500 mb-4 animate-magical-spinner"
      />
      <p className="text-lg font-semibold text-gray-700 mb-4">{message}</p>
      {progress !== undefined && progress > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-violet-500 to-indigo-500 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
    </div>
  );
};

export default Loader;