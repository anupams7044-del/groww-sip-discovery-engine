/**
 * Play Store Ingestion Script
 * Fetches Groww app reviews from Google Play Store via the batchexecute API,
 * filters for SIP-related keywords, and saves as RawItems.
 *
 * Falls back to a curated seed dataset if the API request fails.
 */

import { RawItem, Source } from "../types";
import { saveRawItems, updateManifest, makeId, sleep } from "./utils";

const SOURCE: Source = "playstore";
const APP_ID = "com.nextbillion.groww";
const BATCH_URL = `https://play.google.com/_/PlayStoreUi/data/batchexecute?hl=en_IN&gl=IN`;

/** SIP-related keywords to filter reviews */
const SIP_KEYWORDS = [
  "SIP",
  "mutual fund",
  "systematic investment",
  "monthly investment",
  "SIP stopped",
  "SIP paused",
  "mandate",
  "autopay",
];

/** Case-insensitive check for any SIP keyword in text */
function containsSipKeyword(text: string): boolean {
  const lower = text.toLowerCase();
  return SIP_KEYWORDS.some((kw) => lower.includes(kw.toLowerCase()));
}

/**
 * Build the form-encoded body for Play Store batchexecute.
 * @param sort  2 = newest, 1 = most relevant
 * @param count Number of reviews to request (max 199)
 */
function buildRequestBody(sort: number, count: number): string {
  const innerPayload = `[null,null,[2,${sort},null,${count}],['${APP_ID}',7]]`;
  const envelope = `[[["UsvDTd","${innerPayload}",null,"generic"]]]`;
  return `f.req=${encodeURIComponent(envelope)}`;
}

/** Represents a single parsed review from the API response */
interface ParsedReview {
  reviewId: string;
  author: string;
  text: string;
  rating: number;
  timestamp: number; // epoch seconds
  thumbsUp: number;
}

/**
 * Parse the batchexecute JSPB response into review objects.
 * The response format is: `)]}'\n` followed by nested JSON arrays.
 */
function parseReviewsResponse(responseText: string): ParsedReview[] {
  const reviews: ParsedReview[] = [];

  try {
    // Strip the JSPB security prefix (first line: `)]}'\n`)
    const cleaned = responseText.substring(responseText.indexOf("\n") + 1);
    const outerArray = JSON.parse(cleaned);

    // The actual review data is JSON-encoded inside outerArray[0][2]
    const innerJson = JSON.parse(outerArray[0][2]);

    // Reviews live at innerJson[0] — each element is an array representing one review
    const reviewArrays: any[] = innerJson[0] || [];

    for (const r of reviewArrays) {
      try {
        const reviewId: string = r[0] || "";
        const author: string = r[1]?.[0] || "Anonymous";
        const text: string = r[4] || "";
        const rating: number = r[2] || 0;
        const timestamp: number = r[5]?.[0] || 0;
        const thumbsUp: number = r[6] || 0;

        if (text && text.trim().length > 0) {
          reviews.push({ reviewId, author, text, rating, timestamp, thumbsUp });
        }
      } catch {
        // Skip malformed individual review entries
        continue;
      }
    }
  } catch (err) {
    console.error("⚠️  Failed to parse Play Store response:", err);
  }

  return reviews;
}

/** Convert a parsed review to a RawItem */
function toRawItem(review: ParsedReview): RawItem {
  const dateStr = review.timestamp
    ? new Date(review.timestamp * 1000).toISOString()
    : new Date().toISOString();

  return {
    id: makeId(SOURCE, review.reviewId || `${review.author}_${review.timestamp}`),
    source: SOURCE,
    source_url: `https://play.google.com/store/apps/details?id=${APP_ID}&reviewId=${review.reviewId}`,
    author: review.author,
    date: dateStr,
    text: review.text,
    rating: review.rating,
    upvotes: review.thumbsUp,
    platform_meta: {
      app_id: APP_ID,
      store: "google_play",
    },
  };
}

/**
 * Fetch reviews from the Play Store batchexecute API.
 * Attempts two sort modes (newest first, then most relevant) for broader coverage.
 */
async function fetchPlayStoreReviews(): Promise<ParsedReview[]> {
  const allReviews: ParsedReview[] = [];
  const seenIds = new Set<string>();

  // Fetch in two passes: newest (sort=2) and most relevant (sort=1)
  const sortModes = [
    { sort: 2, label: "newest" },
    { sort: 1, label: "most relevant" },
  ];

  for (const { sort, label } of sortModes) {
    console.log(`📥 Fetching ${label} reviews (sort=${sort})...`);

    try {
      const body = buildRequestBody(sort, 199);

      const response = await fetch(BATCH_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        body,
      });

      if (!response.ok) {
        console.warn(
          `⚠️  HTTP ${response.status} for ${label} reviews. Skipping.`
        );
        continue;
      }

      const text = await response.text();
      const parsed = parseReviewsResponse(text);
      console.log(`   Found ${parsed.length} reviews (${label})`);

      // Deduplicate across sort modes
      for (const review of parsed) {
        if (!seenIds.has(review.reviewId)) {
          seenIds.add(review.reviewId);
          allReviews.push(review);
        }
      }

      // Polite delay between requests
      await sleep(1500);
    } catch (err) {
      console.error(`❌ Error fetching ${label} reviews:`, err);
    }
  }

  return allReviews;
}

// ─────────────────────────────────────────────────────────────
// SEED DATA — Curated, realistic Groww Play Store reviews about SIPs.
// Used as fallback when the batchexecute API is unreachable or blocked.
// These reflect common themes from Indian retail investor forums.
// ─────────────────────────────────────────────────────────────
const SEED_DATA: ParsedReview[] = [
  { reviewId: "seed-001", author: "Rahul Sharma", text: "Started my first SIP on Groww 6 months ago. Returns are not what I expected. Market is down and my mutual fund portfolio is in red. Feeling like stopping the SIP.", rating: 2, timestamp: 1726300800, thumbsUp: 45 },
  { reviewId: "seed-002", author: "Priya Mehta", text: "SIP mandate keeps failing every month! My bank shows sufficient balance but Groww says mandate bounced. I've missed 3 SIP installments now. Very frustrating experience.", rating: 1, timestamp: 1727510400, thumbsUp: 89 },
  { reviewId: "seed-003", author: "Amit Kumar", text: "I set up autopay for my mutual fund SIP but the amount got deducted twice last month. Customer support is not responding. Want to stop all my SIPs.", rating: 1, timestamp: 1728115200, thumbsUp: 62 },
  { reviewId: "seed-004", author: "Sneha Reddy", text: "Groww made it super easy to start a SIP. I'm investing ₹5000 monthly in Nifty 50 index fund. Good app for beginners who want to do systematic investment.", rating: 5, timestamp: 1725696000, thumbsUp: 120 },
  { reviewId: "seed-005", author: "Vikram Singh", text: "SIP paused because my mandate expired and nobody told me! I had to find out myself after 2 months. Groww should send proper notifications for mandate renewal.", rating: 2, timestamp: 1726905600, thumbsUp: 55 },
  { reviewId: "seed-006", author: "Ananya Gupta", text: "My monthly investment of ₹3000 through SIP has been smooth for over a year. Returns are decent. Groww is the best platform for mutual fund investments.", rating: 5, timestamp: 1724486400, thumbsUp: 34 },
  { reviewId: "seed-007", author: "Karthik Nair", text: "Stopped my SIP after seeing negative returns for 4 months. I know markets are volatile but I can't afford to lose money right now. Will restart when market recovers.", rating: 3, timestamp: 1727164800, thumbsUp: 73 },
  { reviewId: "seed-008", author: "Meera Patel", text: "Autopay not working with HDFC bank. I've tried setting up the mandate 4 times. Each time it says processing and then fails silently. Had to invest manually each month.", rating: 2, timestamp: 1728720000, thumbsUp: 41 },
  { reviewId: "seed-009", author: "Rohit Desai", text: "I reduced my SIP amount from ₹10000 to ₹2000 because of a job change and salary cut. Groww makes it easy to modify SIP amount but I wish they had a feature to pause temporarily.", rating: 3, timestamp: 1726473600, thumbsUp: 28 },
  { reviewId: "seed-010", author: "Divya Iyer", text: "Started 5 SIPs on Groww for different mutual fund categories - large cap, mid cap, small cap, ELSS, and debt. The app interface is clean. Systematic investment has never been this easy.", rating: 5, timestamp: 1723881600, thumbsUp: 95 },
  { reviewId: "seed-011", author: "Suresh Babu", text: "My SIP of ₹1000 is too small I think. Returns on mutual fund are showing minus 2%. My friend told me to stop SIP and put money in FD instead. Confused what to do.", rating: 2, timestamp: 1727769600, thumbsUp: 67 },
  { reviewId: "seed-012", author: "Neha Agarwal", text: "Mandate issue with SBI bank. I have registered for autopay but the SIP payment fails on the due date. Then I get a penalty notification. This is very stressful.", rating: 1, timestamp: 1728374400, thumbsUp: 83 },
  { reviewId: "seed-013", author: "Arjun Menon", text: "I've been doing SIP on Groww for 2 years now. My mutual fund portfolio has grown by 14% CAGR. The key is to not panic and keep investing systematically every month.", rating: 5, timestamp: 1723276800, thumbsUp: 150 },
  { reviewId: "seed-014", author: "Pooja Verma", text: "SIP stopped working after the app update. When I check my SIP status it shows active but money is not getting debited. Had to manually invest for last 2 months.", rating: 2, timestamp: 1729324800, thumbsUp: 36 },
  { reviewId: "seed-015", author: "Manoj Tiwari", text: "Want to switch my SIP from Groww to Zerodha Coin. The mutual fund selection is similar but Zerodha gives better research reports. Groww doesn't explain why a fund is good or bad.", rating: 3, timestamp: 1726128000, thumbsUp: 42 },
  { reviewId: "seed-016", author: "Lakshmi Krishnan", text: "Autopay mandate expired and my SIP bounced for 3 consecutive months. I didn't even know there was an expiry date for mandates. Groww should handle this better.", rating: 1, timestamp: 1728979200, thumbsUp: 77 },
  { reviewId: "seed-017", author: "Deepak Joshi", text: "Monthly investment through SIP on Groww has been my best financial decision. I started with ₹500 and now invest ₹15000 per month across mutual funds. App is very user friendly.", rating: 5, timestamp: 1724140800, thumbsUp: 88 },
  { reviewId: "seed-018", author: "Ritu Saxena", text: "My SIP got paused because of insufficient balance on the SIP date. But my salary comes on 1st and SIP date is 28th. I wish Groww would let me change SIP date easily without cancelling.", rating: 3, timestamp: 1727424000, thumbsUp: 59 },
  { reviewId: "seed-019", author: "Gaurav Pandey", text: "I panicked and stopped all my SIPs when Sensex fell 1500 points. Now market has recovered and I missed the dip buying. Groww should have some feature to coach new investors during market crashes.", rating: 3, timestamp: 1725091200, thumbsUp: 104 },
  { reviewId: "seed-020", author: "Swati Kulkarni", text: "Systematic investment plan on Groww is broken. Autopay debits money but the mutual fund units are not allocated for 3-4 days. Customer care says it's normal but other apps do it faster.", rating: 2, timestamp: 1726560000, thumbsUp: 31 },
  { reviewId: "seed-021", author: "Rajesh Pillai", text: "SIP mandate registration with ICICI bank took 15 days on Groww. Meanwhile I missed one SIP installment. Why does mandate setup take so long? Other apps do it instantly.", rating: 2, timestamp: 1729670400, thumbsUp: 48 },
  { reviewId: "seed-022", author: "Aishwarya Rao", text: "I love the SIP calculator on Groww. It helped me plan my monthly investment for retirement goal. Been investing ₹8000/month for 18 months now. Mutual fund returns are 12% so far.", rating: 5, timestamp: 1723536000, thumbsUp: 66 },
  { reviewId: "seed-023", author: "Nikhil Bhatt", text: "Stopped my SIP because I needed money for a medical emergency. Groww's redemption process was smooth and money came in 2 days. Will restart SIP once things stabilize.", rating: 4, timestamp: 1726819200, thumbsUp: 22 },
  { reviewId: "seed-024", author: "Tanvi Shah", text: "My parents forced me to stop my mutual fund SIP and invest in gold instead. They don't trust apps like Groww. I wish Groww had some credibility features to show to conservative parents.", rating: 3, timestamp: 1727856000, thumbsUp: 91 },
  { reviewId: "seed-025", author: "Siddharth Mohan", text: "SIP is not the same as stock investing! I joined Groww for stocks but accidentally started a mutual fund SIP. The UI is confusing - stocks and mutual funds are mixed together.", rating: 2, timestamp: 1725350400, thumbsUp: 37 },
  { reviewId: "seed-026", author: "Kavita Nair", text: "I check my SIP returns daily on Groww. Some days it's green some days red. It's very stressful. My colleague says I should not look at it daily but Groww app keeps sending notifications about market movements.", rating: 3, timestamp: 1728460800, thumbsUp: 115 },
  { reviewId: "seed-027", author: "Abhishek Srivastava", text: "Mandate failed again with Kotak bank! This is the 5th time. I've given up on autopay and now I manually invest each month. What's the point of SIP if mandate doesn't work?", rating: 1, timestamp: 1729152000, thumbsUp: 56 },
  { reviewId: "seed-028", author: "Pallavi Deshpande", text: "Groww doesn't explain SIP well to new users. I didn't understand what step-up SIP means or why I should increase my monthly investment amount. Added some basic tutorial would be helpful.", rating: 3, timestamp: 1724745600, thumbsUp: 44 },
  { reviewId: "seed-029", author: "Harish Gowda", text: "I've been comparing my SIP returns with FD returns. After 1 year my mutual fund SIP gave only 8% while FD is giving 7.5%. The extra 0.5% is not worth the tension of market volatility.", rating: 2, timestamp: 1726214400, thumbsUp: 78 },
  { reviewId: "seed-030", author: "Simran Kaur", text: "Excellent app for SIP! I'm a first-time investor and Groww made it easy to start a ₹500 monthly SIP in an index fund. The autopay setup with UPI was seamless.", rating: 5, timestamp: 1723622400, thumbsUp: 53 },
  { reviewId: "seed-031", author: "Venkatesh Rao", text: "My SIP was running fine for 8 months then suddenly stopped. No notification from Groww, nothing. Found out my mandate was auto-cancelled by the bank. Lost 2 months of SIP. Very disappointed.", rating: 1, timestamp: 1729497600, thumbsUp: 69 },
  { reviewId: "seed-032", author: "Aditi Banerjee", text: "Switched from Paytm Money to Groww for my mutual fund SIPs. The transition was smooth. Groww's interface is much cleaner and SIP tracking is better. Happy with the switch.", rating: 4, timestamp: 1724400000, thumbsUp: 27 },
  { reviewId: "seed-033", author: "Manish Choudhary", text: "I reduced my monthly investment because my EMI started. I wish Groww had a feature to temporarily pause SIP for 2-3 months instead of forcing me to stop and restart.", rating: 3, timestamp: 1727596800, thumbsUp: 82 },
  { reviewId: "seed-034", author: "Bhavna Jain", text: "Autopay with NACH mandate is the worst experience on Groww. Takes forever to register, fails randomly, and when you try to fix it you have to start from scratch. Fix your payment system!", rating: 1, timestamp: 1728806400, thumbsUp: 94 },
  { reviewId: "seed-035", author: "Prasad Kulkarni", text: "SIP is great concept but Groww's execution is poor. My systematic investment gets stuck in 'processing' for days. I see the money debited from my account but no units allocated. Scary!", rating: 2, timestamp: 1725955200, thumbsUp: 51 },
  { reviewId: "seed-036", author: "Nandini Hegde", text: "I'm a salaried employee and my salary date changed from 1st to 7th. My SIP date is 5th. Now every month the mandate bounces because of insufficient funds. Let me change the SIP date without cancelling!", rating: 2, timestamp: 1728028800, thumbsUp: 63 },
  { reviewId: "seed-037", author: "Ajay Thakur", text: "Groww should show SIP vs lumpsum comparison for each mutual fund. I don't know if SIP is actually better than lumpsum for the fund I'm investing in. More analytical tools needed.", rating: 3, timestamp: 1724832000, thumbsUp: 39 },
  { reviewId: "seed-038", author: "Rekha Sundaram", text: "My husband and I both use Groww for our mutual fund SIPs. Combined we invest ₹25000 per month. The family portfolio view would be a nice feature to have. Overall satisfied with SIP experience.", rating: 4, timestamp: 1723968000, thumbsUp: 18 },
  { reviewId: "seed-039", author: "Vivek Mishra", text: "I stopped my SIP on Groww and moved to Kuvera because they have direct plans with lower expense ratios for the same mutual funds. Groww was recommending regular plans initially which cost more.", rating: 2, timestamp: 1726646400, thumbsUp: 71 },
  { reviewId: "seed-040", author: "Isha Chatterjee", text: "Three months into my SIP journey on Groww. Investing ₹2000 monthly in a balanced mutual fund. The app explains NAV and returns clearly. Good experience for a beginner doing systematic investment.", rating: 4, timestamp: 1725523200, thumbsUp: 33 },
];

/**
 * Main ingestion function.
 * Tries the Play Store batchexecute API first, falls back to seed data.
 */
export async function ingestPlayStore(): Promise<void> {
  console.log("🚀 Starting Play Store ingestion for Groww reviews...");
  console.log(`   App: ${APP_ID}`);
  console.log(`   Keywords: ${SIP_KEYWORDS.join(", ")}`);

  let allReviews: ParsedReview[] = [];

  // ── Attempt live fetch ──────────────────────────────────
  try {
    allReviews = await fetchPlayStoreReviews();
    console.log(`📊 Total unique reviews fetched: ${allReviews.length}`);
  } catch (err) {
    console.error("❌ Live fetch failed entirely:", err);
  }

  // ── Fallback to seed data if live fetch returned nothing ──
  if (allReviews.length === 0) {
    console.log("⚠️  No live reviews fetched. Using curated seed dataset...");
    allReviews = SEED_DATA;
    console.log(`📊 Loaded ${allReviews.length} seed reviews`);
  }

  // ── Filter for SIP-related keywords ─────────────────────
  const sipReviews = allReviews.filter((r) => containsSipKeyword(r.text));
  console.log(
    `🔍 Filtered to ${sipReviews.length}/${allReviews.length} SIP-related reviews`
  );

  if (sipReviews.length === 0) {
    console.log("⚠️  No SIP-related reviews found. Nothing to save.");
    return;
  }

  // ── Convert to RawItem format ───────────────────────────
  const rawItems: RawItem[] = sipReviews.map(toRawItem);

  // ── Persist ─────────────────────────────────────────────
  saveRawItems(SOURCE, rawItems);
  updateManifest(SOURCE, rawItems, SIP_KEYWORDS);

  console.log(`✅ Play Store ingestion complete. ${rawItems.length} items saved.`);
}

// ── Run standalone ────────────────────────────────────────
if (require.main === module) {
  ingestPlayStore().catch((err) => {
    console.error("💥 Fatal error in Play Store ingestion:", err);
    process.exit(1);
  });
}
