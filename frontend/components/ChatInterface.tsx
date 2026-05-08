import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Sparkles, MessageCircle, HelpCircle } from 'lucide-react';
import { askQuestion } from '../lib/api';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

const quickQuestions = [
    "What is this document about?",
    "Who are the parties involved?",
    "What are the key obligations?",
    "What are the termination conditions?"
];

export const ChatInterface: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent | null, question?: string) => {
        e?.preventDefault();
        const questionText = question || input;
        if (!questionText.trim()) return;

        const userMessage: Message = { role: 'user', content: questionText };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const data = await askQuestion(questionText);
            const botMessage: Message = { role: 'assistant', content: data.answer };
            setMessages((prev) => [...prev, botMessage]);
        } catch (error) {
            console.error(error);
            const errorMessage: Message = { role: 'assistant', content: "Sorry, I encountered an error processing your request." };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickQuestion = (question: string) => {
        handleSubmit(null, question);
    };

    return (
        <div className="flex flex-col h-full glass-card rounded-2xl shadow-premium overflow-hidden min-h-0">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 px-6 py-4 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                            <MessageCircle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-white flex items-center gap-2">
                                Ask Questions
                                <span className="px-2 py-0.5 text-xs bg-white/20 rounded-full">RAG</span>
                            </h3>
                            <p className="text-xs text-white/70">Chat with your document using AI</p>
                        </div>
                    </div>
                    <Sparkles className="w-5 h-5 text-amber-300" />
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-gray-50/50 to-white/50 dark:from-slate-900/50 dark:to-slate-900/30 min-h-0">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center px-4">
                        <div className="relative mb-6">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full blur-xl opacity-30 animate-pulse" />
                            <div className="relative p-5 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 rounded-2xl">
                                <HelpCircle className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                            </div>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Start a Conversation</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-xs">
                            Ask anything about your uploaded legal document
                        </p>

                        {/* Quick Questions */}
                        <div className="space-y-2 w-full max-w-sm">
                            <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Quick Questions</p>
                            {quickQuestions.map((q, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleQuickQuestion(q)}
                                    className="w-full px-4 py-3 text-sm text-left text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800/60
                                             hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-xl border border-gray-200 dark:border-gray-700
                                             hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-200
                                             hover:shadow-sm group"
                                >
                                    <span className="text-indigo-500 dark:text-indigo-400 mr-2 group-hover:mr-3 transition-all">→</span>
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                    >
                        <div
                            className={`flex items-start gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                        >
                            <div
                                className={`flex-shrink-0 p-2.5 rounded-xl shadow-sm ${msg.role === 'user'
                                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600'
                                    : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700'
                                    }`}
                            >
                                {msg.role === 'user' ? (
                                    <User className="w-4 h-4 text-white" />
                                ) : (
                                    <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                )}
                            </div>
                            <div
                                className={`p-4 rounded-2xl shadow-sm ${msg.role === 'user'
                                    ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white'
                                    : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700'
                                    }`}
                            >
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                            </div>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start animate-fadeIn">
                        <div className="flex items-start gap-3">
                            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                                <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full typing-dot" />
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full typing-dot" />
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full typing-dot" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex-shrink-0">
                <form onSubmit={handleSubmit} className="flex gap-3">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your question here..."
                        className="flex-1 px-5 py-3.5 input-premium rounded-xl text-gray-800 dark:text-gray-200
                                 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="px-5 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white 
                                 rounded-xl hover:from-indigo-700 hover:to-purple-700 
                                 disabled:opacity-50 disabled:cursor-not-allowed 
                                 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]
                                 shadow-lg hover:shadow-xl btn-glow"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
};