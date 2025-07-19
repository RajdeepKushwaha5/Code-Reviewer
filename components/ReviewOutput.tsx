import React, { useState } from 'react';
import type { ReviewData, ReviewSuggestion } from '../types';
import { Severity } from '../types';
import { Loader } from './Loader';
import { CodeIcon, ZapIcon, ShieldCheckIcon, ChevronDownIcon } from './icons';

interface ReviewOutputProps {
  review: ReviewData | null;
  isLoading: boolean;
  error: string | null;
  activeSuggestion: ReviewSuggestion | null;
  setActiveSuggestion: (suggestion: ReviewSuggestion | null) => void;
}

type Tab = 'summary' | 'suggestions' | 'security';

const severityConfig = {
    [Severity.Critical]: { bg: 'bg-red-900/50', text: 'text-red-300', border: 'border-red-600/80' },
    [Severity.Major]: { bg: 'bg-orange-900/50', text: 'text-orange-300', border: 'border-orange-600/80' },
    [Severity.Minor]: { bg: 'bg-yellow-900/50', text: 'text-yellow-300', border: 'border-yellow-600/80' },
    [Severity.Info]: { bg: 'bg-sky-900/50', text: 'text-sky-300', border: 'border-sky-600/80' }
};

const ComplexityMeter: React.FC<{ score: number }> = ({ score }) => {
    const percentage = (score / 10) * 100;
    let colorClass = 'bg-green-500';
    if (score > 4) colorClass = 'bg-yellow-500';
    if (score > 7) colorClass = 'bg-red-500';

    return (
        <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div className={`${colorClass} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
        </div>
    );
};

const SuggestionCard: React.FC<{ 
    suggestion: ReviewSuggestion;
    isActive: boolean;
    onClick: () => void;
}> = ({ suggestion, isActive, onClick }) => {
    const config = severityConfig[suggestion.severity] || severityConfig[Severity.Info];
    const [showRefactor, setShowRefactor] = useState(false);

    return (
        <div 
            className={`border-l-4 p-4 rounded-r-lg transition-all duration-300 cursor-pointer ${config.border} ${isActive ? 'bg-cyan-900/40' : `${config.bg} hover:bg-gray-700/60`}`}
            onClick={onClick}
        >
            <div className="flex justify-between items-start mb-2">
                <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${config.bg} ${config.text} border ${config.border}`}>{suggestion.severity}</span>
                {suggestion.line_number > 0 && <span className="text-sm font-mono text-gray-400">Line: {suggestion.line_number}</span>}
            </div>
            <p className="text-gray-300 mb-3">{suggestion.suggestion}</p>
            {suggestion.refactored_code && (
                <div>
                    <button onClick={(e) => { e.stopPropagation(); setShowRefactor(!showRefactor); }} className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                        {showRefactor ? 'Hide' : 'Show'} Refactor
                        <ChevronDownIcon className={`w-4 h-4 transition-transform ${showRefactor ? 'rotate-180' : ''}`} />
                    </button>
                    {showRefactor && (
                        <pre className="bg-gray-900/70 mt-2 p-3 rounded-md overflow-x-auto">
                            <code className="font-mono text-sm text-gray-300">{suggestion.refactored_code}</code>
                        </pre>
                    )}
                </div>
            )}
        </div>
    );
};

const SummaryTab: React.FC<{ review: ReviewData }> = ({ review }) => (
    <div className="space-y-6">
        <div>
            <h3 className="text-lg font-semibold text-cyan-400 mb-2">Overall Feedback</h3>
            <p className="text-gray-300 bg-gray-900/50 p-4 rounded-lg">{review.overall_feedback}</p>
        </div>
        <div>
            <h3 className="text-lg font-semibold text-cyan-400 mb-3">Key Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-900/50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-300 mb-2">Complexity Score: {review.complexity_score}/10</h4>
                    <ComplexityMeter score={review.complexity_score} />
                </div>
                <div className="bg-gray-900/50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-300 mb-2 flex items-center gap-2"><ZapIcon className="w-5 h-5 text-yellow-400"/>Performance</h4>
                    <p className="text-sm text-gray-400">{review.performance_notes}</p>
                </div>
            </div>
        </div>
    </div>
);

export const ReviewOutput: React.FC<ReviewOutputProps> = ({ review, isLoading, error, activeSuggestion, setActiveSuggestion }) => {
  const [activeTab, setActiveTab] = useState<Tab>('summary');

  const renderContent = () => {
    if (isLoading) return <Loader />;
    if (error) return <div className="text-red-400 bg-red-900/50 p-4 rounded-lg">{error}</div>;
    if (!review) {
      return (
        <div className="text-center text-gray-500 pt-16">
          <p className="text-lg">Code Review</p>
          <p className="text-sm">Your multi-faceted code analysis will appear here.</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'summary':
        return <SummaryTab review={review} />;
      case 'suggestions':
        return review.suggestions.length > 0 ? (
          <div className="space-y-4">
            {review.suggestions.map((s, index) => (
              <SuggestionCard 
                key={index} 
                suggestion={s}
                isActive={activeSuggestion === s}
                onClick={() => setActiveSuggestion(activeSuggestion === s ? null : s)}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-400 bg-gray-900/50 p-4 rounded-lg">No specific suggestions. Great job!</p>
        );
      case 'security':
        return (
            <div>
              <h3 className="text-lg font-semibold text-cyan-400 mb-2 flex items-center gap-2">
                <ShieldCheckIcon className="w-6 h-6" /> Security Analysis
              </h3>
              <p className="text-gray-300 bg-gray-900/50 p-4 rounded-lg">{review.security_analysis}</p>
            </div>
        );
      default:
        return null;
    }
  };

  const TabButton: React.FC<{tab: Tab, label: string, count?: number}> = ({tab, label, count}) => (
    <button 
      onClick={() => setActiveTab(tab)}
      disabled={!review}
      className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === tab ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-white border-b-2 border-transparent'} disabled:text-gray-600 disabled:cursor-not-allowed`}
    >
      {label} {review && count !== undefined && <span className="text-xs bg-gray-700 rounded-full px-2 py-0.5 ml-1">{count}</span>}
    </button>
  );

  return (
    <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 p-6 rounded-2xl shadow-2xl h-[calc(100vh-12rem)] min-h-[600px] flex flex-col">
      <div className="border-b border-gray-700 mb-4 flex-shrink-0">
          <nav className="-mb-px flex space-x-4">
              <TabButton tab="summary" label="Summary" />
              <TabButton tab="suggestions" label="Suggestions" count={review?.suggestions.length} />
              <TabButton tab="security" label="Security" />
          </nav>
      </div>
      <div className="overflow-y-auto flex-grow pr-2">
        {renderContent()}
      </div>
    </div>
  );
};