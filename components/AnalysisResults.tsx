import React, { useState } from 'react';
import { FileText, AlertTriangle, ShieldAlert } from 'lucide-react';
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

    React.useEffect(() => {
        fetchAnalysis(activeTab);
    }, [activeTab]);

    return (
        <div className="bg-white rounded-lg shadow-sm border h-full flex flex-col">
            <div className="flex border-b">
                <button
                    onClick={() => setActiveTab('summary')}
                    className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center space-x-2 ${activeTab === 'summary'
                            ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <FileText className="w-4 h-4" />
                    <span>Summary</span>
                </button>
                <button
                    onClick={() => setActiveTab('clauses')}
                    className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center space-x-2 ${activeTab === 'clauses'
                            ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <ShieldAlert className="w-4 h-4" />
                    <span>Clauses</span>
                </button>
                <button
                    onClick={() => setActiveTab('risks')}
                    className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center space-x-2 ${activeTab === 'risks'
                            ? 'text-red-600 border-b-2 border-red-600 bg-red-50'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <AlertTriangle className="w-4 h-4" />
                    <span>Risks</span>
                </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="prose max-w-none text-black">
                        {activeTab === 'summary' && (
                            <div className="whitespace-pre-wrap">{summary}</div>
                        )}
                        {activeTab === 'clauses' && (
                            <div className="whitespace-pre-wrap">{clauses}</div>
                        )}
                        {activeTab === 'risks' && (
                            <div className="whitespace-pre-wrap text-red-700">{risks}</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
