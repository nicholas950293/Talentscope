export type CandidateCredentials = { email: string; code: string };
export type CandidateVerificationResult = { valid: boolean; error: string };

export function validateCandidateCredentials(
  input: CandidateCredentials,
  expected: CandidateCredentials,
): CandidateVerificationResult;

export function shouldSendAIMessageFromKeyboard(event: {
  key: string;
  shiftKey: boolean;
  isComposing: boolean;
}): boolean;
