import { NextResponse } from "next/server";
import { handleCandidateAIRequest } from "../../server/candidateAIHandler.mjs";
import { getCandidateAIConfig } from "../../server/candidateAIConfig.mjs";

export async function GET() {
  const config = getCandidateAIConfig();
  return NextResponse.json({ provider: config.provider, modelVersion: config.provider === "gemini" ? config.model : "mock-v1", promptVersion: config.promptVersion });
}

export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: { code: "invalid_request", message: "請求內容不正確。" } }, { status: 400 }); }
  const result = await handleCandidateAIRequest(body);
  return NextResponse.json(result.body, { status: result.status });
}
