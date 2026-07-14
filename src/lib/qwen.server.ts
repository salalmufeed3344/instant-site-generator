// Qwen Cloud (DashScope) client - server-only.
// Uses the OpenAI-compatible endpoint. Never import from client code.

const QWEN_ENDPOINT =
  process.env.QWEN_BASE_URL ??
  "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions";
const DEFAULT_MODEL = process.env.QWEN_MODEL ?? "qwen-plus";
const DEFAULT_TIMEOUT_MS = 60_000;

export type QwenMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type QwenChatOptions = {
  model?: string;
  temperature?: number;
  jsonMode?: boolean;
  timeoutMs?: number;
  maxRetries?: number;
};

export type QwenChatResult = {
  content: string;
  model: string;
  tokensUsed: number;
};

export class QwenError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly retryable = false,
  ) {
    super(message);
    this.name = "QwenError";
  }
}

function getApiKey(): string {
  const key = process.env.QWEN_API_KEY;
  if (!key) throw new QwenError("QWEN_API_KEY is not configured", 500, false);
  return key;
}

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

export async function qwenChat(
  messages: QwenMessage[],
  opts: QwenChatOptions = {},
): Promise<QwenChatResult> {
  const {
    model = DEFAULT_MODEL,
    temperature = 0.2,
    jsonMode = false,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    maxRetries = 3,
  } = opts;

  const body: Record<string, unknown> = {
    model,
    messages,
    temperature,
  };
  if (jsonMode) body.response_format = { type: "json_object" };

  let lastErr: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(QWEN_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getApiKey()}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (res.status === 429 || res.status >= 500) {
        const text = await res.text().catch(() => "");
        lastErr = new QwenError(
          `Qwen ${res.status}: ${text.slice(0, 200)}`,
          res.status,
          true,
        );
        if (attempt < maxRetries) {
          await sleep(500 * Math.pow(2, attempt));
          continue;
        }
        throw lastErr;
      }
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new QwenError(
          `Qwen ${res.status}: ${text.slice(0, 300)}`,
          res.status,
          false,
        );
      }

      const json = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
        usage?: { total_tokens?: number };
        model?: string;
      };
      const content = json.choices?.[0]?.message?.content ?? "";
      return {
        content,
        model: json.model ?? model,
        tokensUsed: json.usage?.total_tokens ?? 0,
      };
    } catch (err) {
      clearTimeout(timer);
      lastErr = err;
      if (err instanceof QwenError && !err.retryable) throw err;
      if (attempt >= maxRetries) throw err;
      await sleep(500 * Math.pow(2, attempt));
    }
  }
  throw lastErr instanceof Error ? lastErr : new QwenError("Qwen request failed");
}

// Health check
export async function qwenHealthCheck(): Promise<{ ok: boolean; model: string; error?: string }> {
  try {
    const r = await qwenChat(
      [
        { role: "system", content: "Reply with the single word: ok" },
        { role: "user", content: "ping" },
      ],
      { maxRetries: 0, timeoutMs: 15_000 },
    );
    return { ok: /ok/i.test(r.content), model: r.model };
  } catch (e) {
    return {
      ok: false,
      model: DEFAULT_MODEL,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}
