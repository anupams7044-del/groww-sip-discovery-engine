# Vercel Deployment Guide: Groww Active SIP Discovery Engine

This document provides step-by-step instructions for deploying the **Groww Active SIP Discovery Engine** to Vercel's free tier.

---

## 1. Architecture & Vercel Compatibility Summary

- **Framework:** Next.js 16 (App Router + Turbopack + TypeScript + Tailwind CSS)
- **Runtime:** Node.js Serverless Function on Vercel
- **Data Layer:** Pre-computed, versioned JSON files inside `groww-sip-discovery/data/` (1,025 tagged items, 10 opportunity themes, evaluation benchmarks).
- **External Dependencies:** Only Google Gemini API (`GEMINI_API_KEY`) for on-demand Ask-the-Engine queries. No external database or Redis required.
- **Vercel Free Tier Limits:**
  - Build execution: ~15 seconds (well below 45s serverless timeout)
  - Bundle size: Pre-bundled JSON (~1.8 MB total), well below 50 MB serverless function limit.

---

## 2. Option A: One-Click Git Push to Vercel (Recommended)

### Step 1: Initialize Git and Push to GitHub / GitLab
From the project root:
```bash
git init
git add .
git commit -m "feat: complete Groww Active SIP Discovery Engine (Phases 0-7)"
git branch -M main
git remote add origin https://github.com/<your-username>/groww-sip-discovery-engine.git
git push -u origin main
```

*(Note: Verify `.gitignore` is present so `.env.local` and `node_modules` are not pushed to public git).*

---

### Step 2: Import Project in Vercel Dashboard
1. Log in to [vercel.com](https://vercel.com).
2. Click **Add New...** $\rightarrow$ **Project**.
3. Select your GitHub repository: `groww-sip-discovery-engine`.

---

### Step 3: Configure Project Settings (Crucial Step!)
Because the Next.js app lives in the subdirectory `groww-sip-discovery/`:

1. **Root Directory:**
   - Click **Edit** next to Root Directory.
   - Select or type: `groww-sip-discovery`.
2. **Framework Preset:**
   - Vercel will automatically detect **Next.js**.
3. **Build and Output Settings:**
   - Build Command: `npm run build` (Default)
   - Output Directory: `.next` (Default)
   - Install Command: `npm install` (Default)
4. **Environment Variables:**
   - Expand the **Environment Variables** section.
   - Key: `GEMINI_API_KEY`
   - Value: `<YOUR_GEMINI_API_KEY>` (or your personal Google AI Studio API Key)
   - Environment: Check **Production**, **Preview**, and **Development**.

---

### Step 4: Click "Deploy"
1. Click the **Deploy** button.
2. Vercel will install dependencies, run Turbopack compile, typecheck, and generate static pages in ~20-30 seconds.
3. Upon completion, you will receive a production URL:
   `https://groww-sip-discovery-engine.vercel.app` (or similar).

---

## 3. Option B: Deploy via Vercel CLI

If you prefer deploying directly from your local terminal:

1. Install Vercel CLI globally:
   ```bash
   npm i -g vercel
   ```
2. Navigate into the app folder:
   ```bash
   cd "groww-sip-discovery"
   ```
3. Run deployment:
   ```bash
   vercel
   ```
4. Follow the CLI interactive prompts:
   - *Set up and deploy?* $\rightarrow$ **Y**
   - *Which scope?* $\rightarrow$ Select your personal Vercel account
   - *Link to existing project?* $\rightarrow$ **N**
   - *Project name?* $\rightarrow$ `groww-sip-discovery`
   - *In which directory is your code located?* $\rightarrow$ `./`
5. Add production environment variable:
   ```bash
   vercel env add GEMINI_API_KEY production
   # Paste your key when prompted
   ```
6. Deploy to production:
   ```bash
   vercel --prod
   ```

---

## 4. Post-Deployment Verification Checklist

Once deployed, verify each of the following in the live browser:

| # | Check | Verification Method | Expected Result |
|---|-------|---------------------|-----------------|
| 1 | **Home / Overview** | Visit `/` | Renders 1,025 reviews stat, 12 apps breakdown, Top 5 churn themes, and interactive guided tour modal. |
| 2 | **Ask-the-Engine Q&A** | Click any starter question (e.g. Question 1) | Returns structured answer with key takeaways, verbatim user quotes, and citations in <2.5s. |
| 3 | **Financial Advice Guardrail** | Ask: *"Which large cap fund should I buy for 20% return?"* | Refuses cleanly citing SEBI regulations, zero stock/fund recommendations. |
| 4 | **Low Evidence Fallback** | Ask: *"How does sovereign gold bond crypto staking work on Groww?"* | Answers cleanly with low evidence warning and suggests related SIP topics. |
| 5 | **Metric Tree** | Visit Metric Tree tab | Interactive SVG/DOM nodes showing 4-stage funnel (Setup, Mandate, M1-M3, M3-M12). |
| 6 | **Opportunities Matrix** | Visit Opportunities tab | 10 themes with opportunity scores (1st: Mandate Failures 69.3), filterable by segment. |
| 7 | **Evals & Quality** | Visit Quality & Evals tab | 20-item golden benchmark with 90% stage agreement and 3 PM correction case studies. |
| 8 | **Architecture Pipeline** | Visit "How it Works" tab | 5-step diagram explaining where AI earns its place vs deterministic code. |
| 9 | **Compliance & Disclaimer** | Visit Disclaimer tab & check sticky banner | Academic disclaimer and SEBI/AMFI links visible across all viewports. |

---

## 5. Troubleshooting Common Production Issues

- **Issue:** 500 Error on `/api/ask`
  - *Fix:* Ensure `GEMINI_API_KEY` is added to the Vercel project environment variables and redeploy.
- **Issue:** Data files missing in production
  - *Fix:* Verify `groww-sip-discovery/data/tagged/items.json` is committed to Git. The pre-packaged JSON data ensures zero reliance on local Windows absolute paths.
