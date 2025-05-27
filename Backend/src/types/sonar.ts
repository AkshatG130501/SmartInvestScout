export interface SonarEvent {
  event_title: string;
  summary: string;
  impact_keywords?: string[];
  related_companies?: string[];
  sectors?: string[];
  timestamp?: string;
}

export interface SonarResponse {
  events: SonarEvent[];
  error?: string;
  status?: string;
  message?: string;
}

export interface PerplexityMessage {
  role: string;
  content: string;
}

export interface PerplexityChoice {
  message: PerplexityMessage;
  index: number;
  finish_reason: string;
}

export interface PerplexityResponse {
  id: string;
  choices: PerplexityChoice[];
  created: number;
  model: string;
  object: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
