import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { XMarkIcon, PaperAirplaneIcon, SparklesIcon, UserCircleIcon, MinusIcon, ChevronUpIcon } from './icons';

interface ChatProps {
    isVisible: boolean;
    onClose: () => void;
    messages: ChatMessage[];
    onSendMessage: (message: string) => void;
    isLoading: boolean;
    isMinimized: boolean;
    onToggleMinimize: () => void;
}

const Chat: React.FC<ChatProps> = ({ isVisible, onClose, messages, onSendMessage, isLoading, isMinimized, onToggleMinimize }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (!isMinimized) {
            scrollToBottom();
        }
    }, [messages, isLoading, isMinimized]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            onSendMessage(input);
            setInput('');
        }
    };

    if (!isVisible) return null;

    return (
        <div 
            className={`fixed bottom-8 left-8 bg-white rounded-2xl shadow-2xl w-full max-w-lg z-40 border border-gray-200 transition-all duration-300 ease-in-out ${isMinimized ? 'h-16 overflow-hidden' : 'h-[65vh] flex flex-col'} animate-slide-in-from-left`}
            onClick={e => e.stopPropagation()}
        >
            <header 
                onClick={isMinimized ? onToggleMinimize : undefined}
                className={`flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0 bg-gray-50 rounded-t-2xl ${isMinimized ? 'cursor-pointer rounded-b-2xl' : ''}`}
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
                        <SparklesIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">مساعد التحليل</h2>
                        <p className={`text-sm text-gray-500 transition-opacity ${isMinimized ? 'opacity-0' : 'opacity-100'}`}>جاهز للإجابة على أسئلتك</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={onToggleMinimize} className="text-gray-400 hover:text-gray-700 transition-colors p-2 rounded-full hover:bg-gray-200">
                        {isMinimized ? <ChevronUpIcon className="w-6 h-6" /> : <MinusIcon className="w-6 h-6" />}
                    </button>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors p-2 rounded-full hover:bg-gray-200">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
                {messages.length === 0 && !isLoading && (
                     <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                            <SparklesIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className="max-w-xs md:max-w-md p-3 rounded-2xl bg-gray-100 text-gray-800 rounded-bl-none">
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">أهلاً بك! أنا هنا لمساعدتك في فهم تقرير تحليلك. كيف يمكنني المساعدة اليوم؟</p>
                        </div>
                    </div>
                )}
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        {msg.role === 'model' && (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                                <SparklesIcon className="w-5 h-5 text-white" />
                            </div>
                        )}
                         <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${msg.role === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        </div>
                        {msg.role === 'user' && (
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                <UserCircleIcon className="w-6 h-6 text-gray-500" />
                            </div>
                        )}
                    </div>
                ))}
                 {isLoading && (
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                            <SparklesIcon className="w-5 h-5 text-white animate-pulse" />
                        </div>
                        <div className="max-w-xs md:max-w-md p-3 rounded-2xl bg-gray-100 text-gray-800 rounded-bl-none">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <footer className="p-4 border-t border-gray-200 flex-shrink-0 bg-white">
                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="اكتب سؤالك هنا..."
                        className="w-full bg-gray-100 border-transparent rounded-lg p-3 text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
                        disabled={isLoading}
                    />
                    <button 
                        type="submit" 
                        disabled={isLoading || !input.trim()}
                        className="bg-violet-600 text-white p-3 rounded-lg hover:bg-violet-700 disabled:bg-violet-300 disabled:cursor-not-allowed transition-colors"
                    >
                        <PaperAirplaneIcon className="w-5 h-5" />
                    </button>
                </form>
            </footer>
        </div>
    );
};

export default Chat;