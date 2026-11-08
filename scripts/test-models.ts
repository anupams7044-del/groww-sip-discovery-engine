import * as dns from "dns";
dns.setDefaultResultOrder("ipv4first");

import * as fs from "fs";
import * as path from "path";

const envPath = path.resolve(__dirname, "../.env");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const [k, v] = line.trim().split("=");
    if (k && v && !process.env[k]) process.env[k] = v;
  }
}

async function testLite() {
  const apiKey = process.env.GEMINI_API_KEY;
  const lites = [
    "gemini-2.5-flash-lite",
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite",
    "gemini-flash-lite-latest",
    "gemma-4-26b-a4b-it"
  ];

  for (const m of lites) {
    console.log(`Checking ${m}...`);
    const t0 = Date.now();
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: "Hi" }] }] })
      });
      const data = await res.json();
      console.log(`  ${m} -> Status ${res.status} (${Date.now() - t0}ms):`, res.ok ? data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() : data?.error?.message?.slice(0, 80));
      if (res.ok) {
        console.log(`🎯 WORKING MODEL FOUND: ${m}`);
        break;
      }
    } catch (e: any) {
      console.log(`  ${m} -> Error:`, e.message);
    }
  }
}

testLite().catch(console.error);
