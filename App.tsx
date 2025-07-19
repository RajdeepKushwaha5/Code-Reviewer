import React, { useState, useCallback, useEffect } from 'react';
import { CodeInput } from './components/CodeInput';
import { ReviewOutput } from './components/ReviewOutput';
import { Header } from './components/Header';
import { reviewCode } from './services/geminiService';
import type { ReviewData, ReviewSuggestion } from './types';
import { SUPPORTED_LANGUAGES, SAMPLE_CODE } from './constants';

const App: React.FC = () => {
  const [code, setCode] = useState<string>('');
  const [language, setLanguage] = useState<string>(SUPPORTED_LANGUAGES[0].value);
  const [review, setReview] = useState<ReviewData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSuggestion, setActiveSuggestion] = useState<ReviewSuggestion | null>(null);
  const [cooldownTime, setCooldownTime] = useState(0);

  useEffect(() => {
    if (cooldownTime > 0) {
        const timer = setTimeout(() => {
            setCooldownTime(cooldownTime - 1);
        }, 1000);
        return () => clearTimeout(timer);
    }
  }, [cooldownTime]);

  const handleReview = useCallback(async () => {
    if (!code.trim()) {
      setError('Please enter some code to review.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setReview(null);
    setActiveSuggestion(null);
    try {
      const reviewData = await reviewCode(code, language);
      setReview(reviewData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to get review: ${errorMessage}`);
      console.error(err);
    } finally {
      setIsLoading(false);
      setCooldownTime(15); // Start 15-second cooldown
    }
  }, [code, language]);
  
  const handleLoadSample = () => {
    const lang = SUPPORTED_LANGUAGES[0].value; // Javascript
    setCode(SAMPLE_CODE[lang]);
    setLanguage(lang);
    setReview(null);
    setError(null);
    setActiveSuggestion(null);
  }

  const handleClear = () => {
    setCode('');
    setReview(null);
    setError(null);
    setActiveSuggestion(null);
  }

  return (
    <div className="min-h-screen bg-transparent text-gray-200 font-sans">
      <Header />
      <main className="p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          <CodeInput
            code={code}
            setCode={setCode}
            language={language}
            setLanguage={setLanguage}
            onReview={handleReview}
            isLoading={isLoading}
            activeLine={activeSuggestion?.line_number}
            onLoadSample={handleLoadSample}
            onClear={handleClear}
            cooldownTime={cooldownTime}
          />
          <ReviewOutput
            review={review}
            isLoading={isLoading}
            error={error}
            activeSuggestion={activeSuggestion}
            setActiveSuggestion={setActiveSuggestion}
          />
        </div>
      </main>
    </div>
  );
};

export default App;