# Qwen Integration

CortexOS uses Qwen Cloud (Alibaba DashScope) via its OpenAI-compatible endpoint to turn raw company documents into structured organizational knowledge.

## Endpoint

- URL: `https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions`
  (overridable via `QWEN_BASE_URL`)
- Default model: `qwen-plus` (overridable via `QWEN_MODEL`)
- Auth: `Authorization: Bearer $QWEN_API_KEY`

The `QWEN_API_KEY` is stored as a Lovable Cloud secret and is available only inside server-side code. It is never sent to the browser.

## Client

`src/lib/qwen.server.ts` provides:

- `qwenChat(messages, opts)` — request Qwen with retries (exponential backoff for 429/5xx), timeout, and JSON mode.
- `qwenHealthCheck()` — lightweight ping.
- `QwenError` — typed errors with retryable flag.

## Pipeline

`src/lib/analyze-document.functions.ts` exposes the `analyzeDocument` server function. It runs entirely on Cloudflare Workers.

Stages surfaced to the UI:
1. Reading document
2. Understanding organization
3. Finding departments
4. Extracting policies
5. Mapping workflows
6. Building knowledge
7. Finalizing results

Each stage updates `document_analysis.progress` (0–100) and `stage`. Stage logs are written to `analysis_logs`.

## Extraction contract

`src/lib/knowledge-schema.ts` defines the JSON contract the model must return. Qwen is called with `response_format: { type: "json_object" }`. The response is parsed, then validated and normalized by `validateKnowledge()` so downstream code never sees free-form prose.

## Persistence

Structured output is written to:
- `document_analysis.result` (full JSON snapshot)
- `policies`, `roles`, `processes`, `approval_chains`
- `knowledge_entities` (typed graph nodes for the Organization Graph)
- `departments` (upsert-by-name; existing departments are preserved)

## Text extraction

`src/lib/text-extraction.server.ts` supports:
- Plain text and Markdown natively
- Best-effort UTF-8 fallback for other formats when the content is printable
- Chunking with paragraph-aware boundaries and overlap

PDF and DOCX return a warning until a Worker-compatible parser is added.

## Error handling

- 429 / 5xx → retried up to 3× with exponential backoff.
- 4xx → surfaced verbatim to the analysis row's `error`.
- Non-JSON output → falls back to first `{...}` block; failing that the chunk is skipped and a warning is recorded.
- Timeout: default 60s per call, configurable.
