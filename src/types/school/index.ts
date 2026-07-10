export interface CoreMessage {
  message: string
  description: string
  bible_basis: string
  caution?: string
}

export interface CoreMessageResult {
  candidates: CoreMessage[]
}

export interface OutlineCandidate {
  title: string
  introduction_suggestion: string
  main_points: {
    title: string
    key_idea: string
    supporting_verses: string[]
    application_suggestion: string
  }[]
  conclusion_suggestion: string
}

export interface OutlineResult {
  candidates: OutlineCandidate[]
}

export interface DraftResult {
  full_text: string
  estimated_duration_minutes: number
  sections: {
    type: 'introduction' | 'body' | 'conclusion'
    content: string
  }[]
  abstract_phrases?: {
    original: string
    suggestion: string
    reason: string
  }[]
}
