
export interface NewsItem {
  title: string;
  source: string;
  url: string;
  summary: string;
  category: string;
}

export interface NewsReport {
  date: string;
  items: NewsItem[];
  fullText: string;
}

export enum GenerationStatus {
  IDLE = 'IDLE',
  SEARCHING = 'SEARCHING',
  SUMMARIZING = 'SUMMARIZING',
  GENERATING_AUDIO = 'GENERATING_AUDIO',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}
