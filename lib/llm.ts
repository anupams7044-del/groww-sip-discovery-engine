import * as dns from "dns";
try {
  dns.setDefaultResultOrder("ipv4first");
} catch (e) {
  // ignore if not supported in edge runtime
}

import * as fs from "fs";
import * as path from "path";

// Auto-load .env in node scripts if not loaded
function loadEnv() {
  if (process.env.GEMINI_API_KEY) return;
  const envPaths = [
    path.resolve(process.cwd(), ".env"),
    path.resolve(process.cwd(), ".env.local"),
    path.resolve(__dirname, "../.env"),
    path.resolve(__dirname, "../../.env"),
    path.resolve(__dirname, "../../.env.local")
  ];
  for (const p of envPaths) {
    if (fs.existsSync(p)) {
      const content = fs.readFileSync(p, "utf-8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const [k, ...v] = trimmed.split("=");
        if (k && !process.env[k.trim()]) {
          process.env[k.trim()] = v.join("=").trim();
        }
      }
    }
  }
}

loadEnv();

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

  let retries = 2;
  while (retries >= 0) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const errorText = await res.text();
        if ((res.status === 503 || res.status === 429) && retries > 0) {
          console.warn(`⚠️ Gemini API ${res.status}, retrying in 3s...`);
          await new Promise((r) => setTimeout(r, 3000));
          retries--;
          continue;
        }
        throw new Error(`Gemini API error (${res.status}): ${errorText}`);
      }

      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error("Empty response from Gemini API: " + JSON.stringify(data));
      }
      return text;
    } catch (err: any) {
      if (retries > 0) {
        console.warn(`⚠️ Network glitch: ${err.message}, retrying in 2s...`);
        await new Promise((r) => setTimeout(r, 2000));
        retries--;
      } else {
        throw err;
      }
    }
  }

  throw new Error("Failed to call LLM after retries.");
}
