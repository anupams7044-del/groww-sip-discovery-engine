import * as fs from "fs";
import * as path from "path";

const envPath = path.resolve(__dirname, "../.env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const [k, v] = line.trim().split("=");
    if (k && v && !process.env[k]) {
      process.env[k] = v;
    }
  }
}

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();
  console.log("Status:", response.status);
  if (data.models) {
    console.log("Available models:", data.models.slice(0, 5).map((m: any) => m.name));
  } else {
    console.log("Response:", JSON.stringify(data, null, 2));
  }
}

listModels().catch(console.error);
