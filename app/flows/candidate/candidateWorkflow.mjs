export function validateCandidateCredentials(input, expected) {
  const email = input.email.trim().toLowerCase();
  const code = input.code.trim();

  if (!email || !code) {
    return { valid: false, error: "請輸入 Email 與 6 位數驗證碼。" };
  }
  if (!/^\S+@\S+\.\S+$/.test(email) || !/^\d{6}$/.test(code)) {
    return { valid: false, error: "Email 或驗證碼格式不正確。" };
  }
  if (email !== expected.email.trim().toLowerCase() || code !== expected.code) {
    return { valid: false, error: "Email 或驗證碼不正確，請確認後再試一次。" };
  }
  return { valid: true, error: "" };
}

export function shouldSendAIMessageFromKeyboard(event) {
  return event.key === "Enter" && !event.shiftKey && !event.isComposing;
}
