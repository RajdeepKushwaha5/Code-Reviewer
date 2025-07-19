import { GoogleGenAI, Type } from "@google/genai";
import type { ReviewData } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const reviewSchema = {
    type: Type.OBJECT,
    properties: {
        overall_feedback: {
            type: Type.STRING,
            description: "A high-level summary of the code quality, highlighting strengths and major weaknesses."
        },
        complexity_score: {
            type: Type.INTEGER,
            description: "A score from 1 (simple) to 10 (very complex) representing the code's cyclomatic complexity and cognitive load."
        },
        performance_notes: {
            type: Type.STRING,
            description: "Notes on any potential performance issues or bottlenecks. If none, state 'No performance issues found'."
        },
        security_analysis: {
            type: Type.STRING,
            description: "Analysis of potential security vulnerabilities (e.g., injection, XSS). If none, state 'No security vulnerabilities found'."
        },
        suggestions: {
            type: Type.ARRAY,
            description: "A list of specific suggestions for improvement.",
            items: {
                type: Type.OBJECT,
                properties: {
                    line_number: {
                        type: Type.INTEGER,
                        description: "The specific line number the suggestion refers to. Use 0 if it's a general, non-line-specific suggestion."
                    },
                    severity: {
                        type: Type.STRING,
                        description: "The severity of the issue. Must be one of: 'Critical', 'Major', 'Minor', or 'Info'."
                    },
                    suggestion: {
                        type: Type.STRING,
                        description: "A detailed description of the issue and the suggested improvement."
                    },
                    refactored_code: {
                        type: Type.STRING,
                        description: "An optional snippet of the refactored code. Provide this only when it's clear and concise."
                    }
                },
                required: ["line_number", "severity", "suggestion"]
            }
        }
    },
    required: ["overall_feedback", "complexity_score", "performance_notes", "security_analysis", "suggestions"]
};

export const reviewCode = async (code: string, language: string): Promise<ReviewData> => {
    const prompt = `Please perform an advanced review of the following ${language} code. Analyze its quality, complexity, performance, and security. Provide a response in the requested JSON format.

Code to review:
\`\`\`${language}
${code}
\`\`\``;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: `You are an expert AI code reviewer. Your task is to provide an advanced, multi-faceted analysis of code snippets.
1.  **Overall Feedback**: Give a high-level summary.
2.  **Complexity Score**: Rate the complexity from 1 to 10.
3.  **Performance**: Identify any performance bottlenecks.
4.  **Security**: Point out potential security vulnerabilities.
5.  **Suggestions**: Provide a list of actionable suggestions with severity, line number, and a clear explanation.
6.  **Refactoring**: If a suggestion involves a simple code change, provide the refactored snippet.

Your entire response must be structured in the requested JSON format.`,
                responseMimeType: "application/json",
                responseSchema: reviewSchema,
            },
        });

        const jsonText = response.text.trim();
        const reviewData: ReviewData = JSON.parse(jsonText);
        // Sort suggestions by line number for a more logical flow
        reviewData.suggestions.sort((a, b) => a.line_number - b.line_number);
        return reviewData;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error) {
            throw new Error(`Gemini API Error: ${error.message}`);
        }
        throw new Error("An unexpected error occurred while fetching the code review.");
    }
};