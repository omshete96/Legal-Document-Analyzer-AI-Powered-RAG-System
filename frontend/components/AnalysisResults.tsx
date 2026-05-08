import React, { useState, useEffect } from 'react';
import { FileText, AlertTriangle, ShieldCheck, Sparkles, Copy, Check, ScrollText, AlertCircle } from 'lucide-react';
import { getSummary, getClauses, getRisks } from '../lib/api';

interface AnalysisResultsProps {
    documentText: string;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({ documentText }) => {
    const [activeTab, setActiveTab] = useState<'summary' | 'clauses' | 'risks'>('summary');
    const [summary, setSummary] = useState<string | null>(null);
    const [clauses, setClauses] = useState<string | null>(null);
    const [risks, setRisks] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const fetchAnalysis = async (type: 'summary' | 'clauses' | 'risks') => {
        if (type === 'summary' && summary) return;
        if (type === 'clauses' && clauses) return;
        if (type === 'risks' && risks) return;

        setLoading(true);
        try {
            if (type === 'summary') {
                const data = await getSummary(documentText);
                setSummary(data.summary);
            } else if (type === 'clauses') {
                const data = await getClauses(documentText);
                setClauses(data.clauses);
            } else if (type === 'risks') {
                const data = await getRisks(documentText);
                setRisks(data.risks);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalysis(activeTab);
    }, [activeTab]);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getCurrentContent = () => {
        if (activeTab === 'summary') return summary;
        if (activeTab === 'clauses') return clauses;
        return risks;
    };

    const tabs = [
        {
            id: 'summary',
            label: 'Summary',
            icon: ScrollText,
            gradient: 'from-blue-500 to-cyan-500',
            bgColor: 'bg-blue-50 dark:bg-blue-950/30',
            textColor: 'text-blue-700 dark:text-blue-300',
            borderColor: 'border-blue-200 dark:border-blue-800/50'
        },
        {
            id: 'clauses',
            label: 'Key Clauses',
            icon: ShieldCheck,
            gradient: 'from-indigo-500 to-purple-500',
            bgColor: 'bg-indigo-50 dark:bg-indigo-950/30',
            textColor: 'text-indigo-700 dark:text-indigo-300',
            borderColor: 'border-indigo-200 dark:border-indigo-800/50'
        },
        {
            id: 'risks',
            label: 'Risk Analysis',
            icon: AlertTriangle,
            gradient: 'from-amber-500 to-red-500',
            bgColor: 'bg-amber-50 dark:bg-amber-950/30',
            textColor: 'text-amber-700 dark:text-amber-300',
            borderColor: 'border-amber-200 dark:border-amber-800/50'
        },
    ];

    const currentTab = tabs.find(t => t.id === activeTab)!;

    return (
        <div className="glass-card rounded-2xl shadow-premium h-full flex flex-col overflow-hidden min-h-0">
            {/* Tabs Header */}
            <div className="flex border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-slate-900/60 flex-shrink-0">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as 'summary' | 'clauses' | 'risks')}
                            className={`flex-1 px-4 py-4 text-sm font-medium flex items-center justify-center gap-2 
                                      transition-all duration-200 relative group
                                      ${isActive
                                    ? 'text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-800/80'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-slate-800/40'
                                }`}
                        >
                            <div className={`p-1.5 rounded-lg transition-all duration-200 ${isActive
                                ? `bg-gradient-to-br ${tab.gradient} shadow-sm`
                                : 'bg-gray-200 dark:bg-gray-700 group-hover:bg-gray-300 dark:group-hover:bg-gray-600'
                                }`}>
                                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`} />
                            </div>
                            <span>{tab.label}</span>
                            {isActive && (
                                <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${tab.gradient}`} />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Content Area */}
            <div className="p-5 flex-1 overflow-y-auto bg-gradient-to-b from-white to-gray-50/50 dark:from-slate-900/40 dark:to-slate-900/20 min-h-0">
                {loading ? (
                    <div className="flex flex-col justify-center items-center h-full space-y-6">
                        <div className="relative">
                            <div className={`absolute inset-0 bg-gradient-to-br ${currentTab.gradient} rounded-full blur-xl opacity-30 animate-pulse`} />
                            <div className="relative">
                                <div className="animate-spin rounded-full h-14 w-14 border-4 border-gray-200 dark:border-gray-700 border-t-indigo-600 dark:border-t-indigo-400" />
                                <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                        </div>
                        <div className="text-center">
                            <p className="text-gray-700 dark:text-gray-300 font-medium">Analyzing with AI...</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">This may take a few seconds</p>
                        </div>
                    </div>
                ) : (
                    <div className="animate-fadeIn h-full flex flex-col">
                        {/* Copy Button */}
                        {getCurrentContent() && (
                            <div className="flex justify-end mb-3">
                                <button
                                    onClick={() => handleCopy(getCurrentContent()!)}
                                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium 
                                             text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200
                                             bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700
                                             rounded-lg border border-gray-200 dark:border-gray-700 transition-all duration-200
                                             hover:shadow-sm"
                                >
                                    {copied ? (
                                        <>
                                            <Check className="w-3.5 h-3.5 text-green-500" />
                                            <span className="text-green-600 dark:text-green-400">Copied!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-3.5 h-3.5" />
                                            <span>Copy</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        )}

                        {/* Content Card */}
                        <div className={`flex-1 rounded-xl border ${currentTab.borderColor} ${currentTab.bgColor} p-5 overflow-auto`}>
                            {activeTab === 'summary' && (
                                <div className="prose prose-sm max-w-none">
                                    <div className={`whitespace-pre-wrap ${currentTab.textColor} leading-relaxed`}>
                                        {summary || (
                                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                                <AlertCircle className="w-4 h-4" />
                                                <span>No summary available</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            {activeTab === 'clauses' && (
                                <div className="prose prose-sm max-w-none">
                                    <div className={`whitespace-pre-wrap ${currentTab.textColor} leading-relaxed`}>
                                        {clauses || (
                                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                                <AlertCircle className="w-4 h-4" />
                                                <span>No clauses identified</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            {activeTab === 'risks' && (
                                <div className="prose prose-sm max-w-none">
                                    <div className={`whitespace-pre-wrap ${currentTab.textColor} leading-relaxed`}>
                                        {risks || (
                                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                                <AlertCircle className="w-4 h-4" />
                                                <span>No risks identified</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};