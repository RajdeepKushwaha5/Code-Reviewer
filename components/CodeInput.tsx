import React from 'react';
import { SUPPORTED_LANGUAGES } from '../constants';
import { SparklesIcon, VscTrash, VscWand } from './icons';
import { CodeEditor } from './CodeEditor';

interface CodeInputProps {
  code: string;
  setCode: (code: string) => void;
  language: string;
  setLanguage: (language:string) => void;
  onReview: () => void;
  isLoading: boolean;
  activeLine?: number | null;
  onLoadSample: () => void;
  onClear: () => void;
  cooldownTime: number;
}

export const CodeInput: React.FC<CodeInputProps> = ({ 
  code, setCode, language, setLanguage, onReview, isLoading, activeLine, onLoadSample, onClear, cooldownTime
}) => {

  const getButtonContent = () => {
    if (isLoading) {
      return (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Reviewing...
        </>
      );
    }
    if (cooldownTime > 0) {
      return `Please wait (${cooldownTime}s)`;
    }
    return (
      <>
        <SparklesIcon className="h-5 w-5 mr-2" />
        Review Code
      </>
    );
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 p-6 rounded-2xl shadow-2xl flex flex-col h-[calc(100vh-12rem)] min-h-[600px]">
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <h2 className="text-xl font-semibold text-gray-100">Code Editor</h2>
        <div className="flex items-center gap-2">
            <button onClick={onLoadSample} disabled={isLoading || cooldownTime > 0} className="text-gray-400 hover:text-white transition-colors p-1.5 rounded-md hover:bg-gray-700 disabled:opacity-50">
                <VscWand className="w-5 h-5" />
            </button>
            <button onClick={onClear} disabled={isLoading || !code || cooldownTime > 0} className="text-gray-400 hover:text-white transition-colors p-1.5 rounded-md hover:bg-gray-700 disabled:opacity-50">
                <VscTrash className="w-5 h-5" />
            </button>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-gray-700 border border-gray-600 text-gray-200 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-40 p-2.5"
              disabled={isLoading || cooldownTime > 0}
            >
              {SUPPORTED_LANGUAGES.map(lang => (
                <option key={lang.value} value={lang.value}>{lang.label}</option>
              ))}
            </select>
        </div>
      </div>

      <CodeEditor 
        code={code}
        setCode={setCode}
        disabled={isLoading}
        activeLine={activeLine}
      />
      
      <button
        onClick={onReview}
        disabled={isLoading || !code.trim() || cooldownTime > 0}
        className="mt-4 w-full flex items-center justify-center bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 shadow-lg hover:shadow-cyan-500/30"
      >
        {getButtonContent()}
      </button>
    </div>
  );
};