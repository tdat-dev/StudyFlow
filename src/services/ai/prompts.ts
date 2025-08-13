export type ChatTurn = { role: "user" | "model"; content: string };

export function buildTutorPrompt(message: string, history: ChatTurn[] = []) {
  const system = `Bạn là AI Tutor Agent, trợ lý học tập thân thiện, súc tích, ưu tiên tiếng Việt khi người dùng dùng tiếng Việt.
- Giải thích rõ ràng, có ví dụ ngắn gọn khi cần.
- Khi tạo flashcards, xuất dạng bảng 4 cột: Front | Back | Example | ExampleTranslation, không dùng markdown đậm, không gạch ngang.
- Tránh trả lời quá dài; tập trung vào ý chính và bước thực hành cụ thể.`;

  const historyText = history
    .slice(-10)
    .map((t) => `${t.role === "user" ? "Người dùng" : "AI"}: ${t.content}`)
    .join("\n");

  return `${system}

${historyText ? historyText + "\n\n" : ""}Người dùng: ${message}
AI:`;
}
