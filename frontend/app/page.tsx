'use client';

import React, { useState, useEffect } from 'react';
import { UploadArea } from '@/components/UploadArea';
import { ChatInterface } from '@/components/ChatInterface';
import { AnalysisResults } from '@/components/AnalysisResults';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Scale, ArrowLeft, Sparkles, FileCheck, Shield, Zap, FileText, Hash, Clock, CheckCircle2 } from 'lucide-react';

export default function Home() {
  const [uploadData, setUploadData] = useState<any>(null);

  // Handle browser back button
  useEffect(() => {
    const handlePopState = () => {
      if (uploadData) {
        setUploadData(null);
      }
    };

    if (uploadData) {
      window.history.pushState({ page: 'analysis' }, '', '');
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [uploadData]);

  const handleBackClick = () => {
    setUploadData(null);
    window.history.back();
  };

  // Calculate document stats
  const getDocumentStats = () => {
    if (!uploadData?.full_text) return null;
    const text = uploadData.full_text;
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    const charCount = text.length;
    const estimatedPages = Math.ceil(wordCount / 300);
    return { wordCount, charCount, estimatedPages };
  };

  const stats = uploadData ? getDocumentStats() : null;

  return (
    <div className="min-h-screen mesh-bg relative overflow-hidden">
      {/* Floating Background Elements */}
      {!uploadData && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl animate-float" />
          <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-br from-cyan-400/15 to-blue-400/15 rounded-full blur-3xl animate-float-delayed" />
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-br from-violet-400/15 to-indigo-400/15 rounded-full blur-3xl animate-float-slow" />
        </div>
      )}

      {/* Header */}
      <header className="glass-card sticky top-0 z-50 border-b border-white/20 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
                <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 p-3 rounded-2xl shadow-lg">
                  <Scale className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text">
                  Legal AI Analyzer
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Powered by Llama 3.3 70B</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {uploadData && (
                <button
                  onClick={handleBackClick}
                  className="flex items-center space-x-2 px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200
                           bg-white/80 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 rounded-xl
                           border border-gray-200/50 dark:border-white/10
                           shadow-sm hover:shadow-md transition-all duration-200
                           transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>New Document</span>
                </button>
              )}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        {!uploadData ? (
          <div className="max-w-3xl mx-auto mt-8 animate-fadeIn">
            {/* Hero Section */}
            <div className="text-center mb-12 space-y-6">
              <div className="inline-flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-indigo-50 to-purple-50
                            dark:from-indigo-950/50 dark:to-purple-950/50
                            text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-medium
                            border border-indigo-100 dark:border-indigo-800/50 shadow-sm">
                <Sparkles className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                <span>RAG-Powered Legal Intelligence</span>
              </div>

              <h2 className="text-5xl lg:text-6xl font-bold leading-tight">
                <span className="gradient-text">Analyze Legal</span>
                <br />
                <span className="text-gray-900 dark:text-gray-100">Documents Instantly</span>
              </h2>

              <p className="mt-6 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                Upload your contracts, NDAs, or legal briefs. Get AI-powered summaries,
                clause extraction, risk analysis, and ask questions in natural language.
              </p>

              <div className="flex items-center justify-center gap-8 mt-10">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50">
                    <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-sm font-medium">Instant Analysis</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <div className="p-2 rounded-xl bg-green-50 dark:bg-green-950/50">
                    <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-sm font-medium">Secure & Private</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50">
                    <FileCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-sm font-medium">Smart Q&A</span>
                </div>
              </div>
            </div>

            <UploadArea onUploadComplete={setUploadData} />

            {/* Trust Badges */}
            <div className="mt-12 text-center">
              <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">Trusted Technology Stack</p>
              <div className="flex items-center justify-center gap-8 text-gray-400 dark:text-gray-500">
                <span className="text-sm font-medium">ChromaDB</span>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <span className="text-sm font-medium">FastAPI</span>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <span className="text-sm font-medium">Groq Cloud</span>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <span className="text-sm font-medium">Next.js</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-scaleIn">
            {/* Document Info Card */}
            <div className="glass-card rounded-2xl p-6 mb-6 shadow-premium">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl blur opacity-40" />
                    <div className="relative p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                      {uploadData.filename}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Successfully analyzed and indexed
                    </p>
                  </div>
                </div>

                {/* Document Stats */}
                {stats && (
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-slate-800/60 rounded-xl">
                      <Hash className="w-4 h-4 text-indigo-500" />
                      <div className="text-sm">
                        <span className="font-semibold text-gray-900 dark:text-gray-100">{stats.wordCount.toLocaleString()}</span>
                        <span className="text-gray-500 dark:text-gray-400 ml-1">words</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-slate-800/60 rounded-xl">
                      <FileText className="w-4 h-4 text-purple-500" />
                      <div className="text-sm">
                        <span className="font-semibold text-gray-900 dark:text-gray-100">~{stats.estimatedPages}</span>
                        <span className="text-gray-500 dark:text-gray-400 ml-1">pages</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-slate-800/60 rounded-xl">
                      <Clock className="w-4 h-4 text-cyan-500" />
                      <div className="text-sm">
                        <span className="font-semibold text-gray-900 dark:text-gray-100">{uploadData.total_chunks}</span>
                        <span className="text-gray-500 dark:text-gray-400 ml-1">chunks</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-18rem)] overflow-hidden">
              <div className="flex flex-col min-h-0 overflow-hidden">
                <ChatInterface />
              </div>
              <div className="min-h-0 overflow-hidden">
                <AnalysisResults documentText={uploadData.full_text} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}