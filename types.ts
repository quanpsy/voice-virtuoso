export interface SingingAnalysis {
  overallScore: number;
  title: string;
  summary: string;
  metrics: {
    pitch: number;
    tone: number;
    rhythm: number;
    expression: number;
  };
  strengths: string[];
  areasForImprovement: string[];
  technicalSuggestions: string[];
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
