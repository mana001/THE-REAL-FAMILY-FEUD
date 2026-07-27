export interface MatchableAnswer {
  id: string;
  text: string;
  points: number;
  revealed?: boolean;
}

export function matchSurveyAnswer(answers: MatchableAnswer[], rawGuess: string): MatchableAnswer | null {
  const rawTerm = (rawGuess || '').trim();
  const term = rawTerm.toLowerCase();
  if (!term) return null;

  return answers.find((a) => {
    if (a.revealed) return false; // Already revealed answers on the board cannot be guessed again
    const ansText = a.text.toLowerCase().trim();
    if (ansText === term) return true;

    // Handle slash/comma/ampersand separated alternatives e.g. "First Aid Kit / Band-Aids"
    const parts = ansText.split(/[\/\,\;\&]/).map((p) => p.trim());
    if (parts.some((p) => p.length > 1 && (p === term || term.includes(p) || (term.length >= 3 && p.includes(term))))) {
      return true;
    }

    if (term.length >= 3 && (ansText.includes(term) || term.includes(ansText))) {
      return true;
    }

    return false;
  }) || null;
}
