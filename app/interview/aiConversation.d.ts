import type { AIConversationAction, AIConversationMessage, AIConversationState } from "../domain/types";

export function createAIConversationState(): AIConversationState;
export function messagesForQuestion(state: AIConversationState, questionId: number): AIConversationMessage[];
export function canSendAIMessage(state: AIConversationState, questionId: number, content: string): boolean;
export function reduceAIConversation(state: AIConversationState, action: AIConversationAction): AIConversationState;
