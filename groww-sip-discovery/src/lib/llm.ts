import * as dns from "dns";
try {
  dns.setDefaultResultOrder("ipv4first");
} catch (e) {
  // ignore if not supported in edge runtime
}

export interface LLMRequest {
  systemPrompt?: string;
  userPrompt: string;
  jsonMode?: boolean;
  temperature?: number;
}

export async function callLLM(req: LLMRequest): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment or .env file");
  }

  const model = "gemini-3.5-flash-lite";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const body: Record<string, unknown> = {
    contents: [
      {
        role: "user",
        parts: [{ text: req.userPrompt }]
      }
    ],
    generationConfig: {
      temperature: req.temperature ?? 0.2
    }
  };

  if (req.systemPrompt) {
    body.systemInstruction = {
      parts: [{ text: req.systemPrompt }]
    };
  }

  if (req.jsonMode) {
    (body.generationConfig as Record<string, unknown>).responseMimeType = "application/json";
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Empty response from Gemini API: " + JSON.stringify(data));
  }
  return text;
}
