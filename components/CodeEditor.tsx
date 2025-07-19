import React, { useRef, useEffect, useState } from 'react';

interface CodeEditorProps {
  code: string;
  setCode: (code: string) => void;
  disabled: boolean;
  activeLine?: number | null;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ code, setCode, disabled, activeLine }) => {
  const [lineCount, setLineCount] = useState(1);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const lines = code.split('\n').length;
    setLineCount(lines);
  }, [code]);

  useEffect(() => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, [code]);

  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  return (
    <div className="flex-grow flex font-mono text-sm border border-gray-700 rounded-md overflow-hidden bg-gray-900">
      <div ref={lineNumbersRef} className="text-right text-gray-500 bg-gray-900/50 p-4 pt-[17px] select-none">
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i} className={`h-[21px] leading-[21px] ${i + 1 === activeLine ? 'text-cyan-300' : ''}`}>
            {i + 1}
          </div>
        ))}
      </div>
      <div className="relative flex-grow">
        {activeLine && (
            <div className="absolute top-0 left-0 w-full h-[21px] bg-gray-700/50" style={{ transform: `translateY(${(activeLine-1) * 21}px)`}}></div>
        )}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onScroll={handleScroll}
          placeholder="Paste your code here..."
          className="absolute inset-0 bg-transparent text-gray-300 p-4 pl-0 resize-none w-full h-full focus:outline-none leading-[21px]"
          spellCheck="false"
          disabled={disabled}
        />
      </div>
    </div>
  );
};