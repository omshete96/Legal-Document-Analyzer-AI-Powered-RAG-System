'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            className="relative p-2.5 rounded-xl border border-gray-200 dark:border-white/10
                 bg-white/80 dark:bg-white/10 hover:bg-gray-100 dark:hover:bg-white/20
                 shadow-sm hover:shadow-md transition-all duration-300
                 transform hover:scale-105 active:scale-95"
        >
            <div className="relative w-5 h-5">
                <Sun
                    className={`absolute inset-0 w-5 h-5 text-amber-500 transition-all duration-300
                     ${theme === 'light' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-0'}`}
                />
                <Moon
                    className={`absolute inset-0 w-5 h-5 text-indigo-300 transition-all duration-300
                     ${theme === 'dark' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}`}
                />
            </div>
        </button>
    );
};
