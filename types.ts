export enum Severity {
    Critical = 'Critical',
    Major = 'Major',
    Minor = 'Minor',
    Info = 'Info',
}

export interface ReviewSuggestion {
    line_number: number;
    severity: Severity;
    suggestion: string;
    refactored_code?: string;
}

export interface ReviewData {
    overall_feedback: string;
    complexity_score: number;
    performance_notes: string;
    security_analysis: string;
    suggestions: ReviewSuggestion[];
}