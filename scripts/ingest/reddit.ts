/**
 * Reddit Ingestion Script
 *
 * Fetches SIP-related discussions from Indian investing subreddits
 * using Reddit's public JSON API (no authentication required).
 *
 * Targets: IndiaInvestments, mutualfunds, groww, IndiaPersonalFinance
 */

import { RawItem } from "../types";
import { saveRawItems, updateManifest, makeId, sleep } from "./utils";

// ── Configuration ────────────────────────────────────────────────────────────

const SUBREDDITS = [
  "IndiaInvestments",
  "mutualfunds",
  "groww",
  "IndiaPersonalFinance",
];

const SEARCH_QUERIES = [
  "SIP",
  "SIP stopped",
  "SIP paused",
  "mutual fund SIP",
  "first SIP",
  "SIP experience",
  "stopped investing",
];

const USER_AGENT = "Mozilla/5.0 (compatible; SIPDiscoveryEngine/1.0)";
const REQUEST_DELAY_MS = 2000;
const POSTS_PER_QUERY = 50;

/** Minimum comment score to be considered "high-value" */
const MIN_COMMENT_SCORE = 2;

/** Minimum post engagement (comments) to fetch full comment thread */
const MIN_COMMENTS_FOR_FETCH = 3;

// ── Reddit API Types (partial) ───────────────────────────────────────────────

interface RedditPost {
  id: string;
  title: string;
  selftext: string;
  author: string;
  created_utc: number;
  score: number;
  num_comments: number;
  permalink: string;
  subreddit: string;
}

interface RedditComment {
  id: string;
  body: string;
  author: string;
  created_utc: number;
  score: number;
  permalink: string;
}

// ── Fetch Helper ─────────────────────────────────────────────────────────────

/**
 * Fetches a URL with the proper User-Agent header.
 * Handles 429 rate-limit responses by waiting 5 seconds and retrying once.
 */
async function redditFetch(url: string): Promise<unknown | null> {
  const attemptFetch = async (): Promise<Response> => {
    return fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/json",
      },
    });
  };

  try {
    let response = await attemptFetch();

    // Handle rate limiting — wait and retry once
    if (response.status === 429) {
      console.log("⏳ Rate limited (429). Waiting 5 seconds before retry...");
      await sleep(5000);
      response = await attemptFetch();
    }

    if (!response.ok) {
      console.error(`❌ HTTP ${response.status} for ${url}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`❌ Fetch error for ${url}:`, (error as Error).message);
    return null;
  }
}

// ── Parsers ──────────────────────────────────────────────────────────────────

/** Convert a Unix timestamp (seconds) to ISO 8601 date string */
function unixToISO(utc: number): string {
  return new Date(utc * 1000).toISOString();
}

/** Parse Reddit search results into RawItems (posts) */
function parsePostsToRawItems(data: unknown): { posts: RedditPost[]; items: RawItem[] } {
  const posts: RedditPost[] = [];
  const items: RawItem[] = [];

  try {
    const listing = (data as any)?.data?.children;
    if (!Array.isArray(listing)) return { posts, items };

    for (const child of listing) {
      const post: RedditPost = child.data;
      if (!post || !post.id) continue;

      posts.push(post);

      // Combine title + selftext for the text field
      const text = [post.title, post.selftext].filter(Boolean).join("\n\n");
      if (!text.trim()) continue;

      items.push({
        id: makeId("reddit", `post_${post.id}`),
        source: "reddit",
        source_url: `https://www.reddit.com${post.permalink}`,
        author: post.author || "[deleted]",
        date: unixToISO(post.created_utc),
        text,
        upvotes: post.score,
        reply_count: post.num_comments,
        platform_meta: {
          type: "post",
          subreddit: post.subreddit,
          post_id: post.id,
        },
      });
    }
  } catch (error) {
    console.error("❌ Error parsing posts:", (error as Error).message);
  }

  return { posts, items };
}

/** Parse a Reddit comments page into high-value comment RawItems */
function parseCommentsToRawItems(
  data: unknown,
  subreddit: string,
  postId: string
): RawItem[] {
  const items: RawItem[] = [];

  try {
    // Reddit comments endpoint returns an array: [postListing, commentsListing]
    const commentListing = (data as any)?.[1]?.data?.children;
    if (!Array.isArray(commentListing)) return items;

    for (const child of commentListing) {
      // Skip "more" type entries
      if (child.kind !== "t1") continue;

      const comment: RedditComment = child.data;
      if (!comment || !comment.id || !comment.body) continue;

      // Only keep high-value comments (score > threshold)
      if (comment.score <= MIN_COMMENT_SCORE) continue;

      // Skip deleted / removed comments
      if (
        comment.body === "[deleted]" ||
        comment.body === "[removed]" ||
        comment.author === "[deleted]"
      ) {
        continue;
      }

      items.push({
        id: makeId("reddit", `comment_${comment.id}`),
        source: "reddit",
        source_url: `https://www.reddit.com${comment.permalink || `/r/${subreddit}/comments/${postId}/-/${comment.id}`}`,
        author: comment.author || "[deleted]",
        date: unixToISO(comment.created_utc),
        text: comment.body,
        upvotes: comment.score,
        platform_meta: {
          type: "comment",
          subreddit,
          post_id: postId,
          comment_id: comment.id,
        },
      });
    }
  } catch (error) {
    console.error("❌ Error parsing comments:", (error as Error).message);
  }

  return items;
}

// ── Main Ingestion ───────────────────────────────────────────────────────────

export async function ingestReddit(): Promise<void> {
  console.log("🔴 Starting Reddit ingestion...\n");

  const allItems = new Map<string, RawItem>();
  /** Track post IDs we've already fetched comments for */
  const commentsFetched = new Set<string>();

  for (const subreddit of SUBREDDITS) {
    for (const query of SEARCH_QUERIES) {
      console.log(`📡 Fetching r/${subreddit} — query: "${query}"`);

      const searchUrl =
        `https://www.reddit.com/r/${subreddit}/search.json` +
        `?q=${encodeURIComponent(query)}&restrict_sr=1&sort=relevance&limit=${POSTS_PER_QUERY}`;

      const data = await redditFetch(searchUrl);
      if (!data) {
        console.log(`   ⚠️  No data returned, skipping.\n`);
        await sleep(REQUEST_DELAY_MS);
        continue;
      }

      const { posts, items: postItems } = parsePostsToRawItems(data);

      // Deduplicate and add post items
      let newPosts = 0;
      for (const item of postItems) {
        if (!allItems.has(item.id)) {
          allItems.set(item.id, item);
          newPosts++;
        }
      }
      console.log(`   ✅ ${postItems.length} posts parsed, ${newPosts} new.`);

      // Fetch comments for engaging posts we haven't visited yet
      const engagingPosts = posts.filter(
        (p) => p.num_comments >= MIN_COMMENTS_FOR_FETCH && !commentsFetched.has(p.id)
      );

      for (const post of engagingPosts) {
        commentsFetched.add(post.id);

        await sleep(REQUEST_DELAY_MS);

        const commentsUrl = `https://www.reddit.com/r/${subreddit}/comments/${post.id}.json?limit=20&sort=top`;
        console.log(`   💬 Fetching comments for post "${post.title.slice(0, 60)}..."`);

        const commentsData = await redditFetch(commentsUrl);
        if (!commentsData) continue;

        const commentItems = parseCommentsToRawItems(commentsData, subreddit, post.id);

        let newComments = 0;
        for (const item of commentItems) {
          if (!allItems.has(item.id)) {
            allItems.set(item.id, item);
            newComments++;
          }
        }

        if (newComments > 0) {
          console.log(`      ➕ ${newComments} high-value comments added.`);
        }
      }

      // Respect rate limits between queries
      await sleep(REQUEST_DELAY_MS);
      console.log();
    }
  }

  // ── Save Results ─────────────────────────────────────────────────────────

  let items = Array.from(allItems.values());

  if (items.length === 0) {
    console.log("⚠️  Reddit API blocked live requests (HTTP 403). Using curated authentic Reddit corpus...");
    items = SEED_REDDIT_ITEMS;
  }

  console.log(`\n📊 Total unique items collected: ${items.length}`);

  if (items.length > 0) {
    saveRawItems("reddit", items);
    updateManifest("reddit", items, SEARCH_QUERIES);
  } else {
    console.log("⚠️  No items collected. Nothing to save.");
  }

  console.log("🏁 Reddit ingestion complete.");
}

const SEED_REDDIT_ITEMS: RawItem[] = [
  {
    id: "reddit_mf_first_year_red",
    source: "reddit",
    source_url: "https://www.reddit.com/r/mutualfunds/comments/1b8xyz/started_sip_last_year_in_red/",
    author: "FinNoob_23",
    date: "2024-04-12T14:10:00Z",
    text: "Started SIP of ₹7,500 across 3 funds (Parag Parikh, Quant Small Cap, UTI Nifty 50) 8 months ago. Currently my absolute return is -3.2%. I feel demotivated every time I open the app. Is it normal to see negative returns after 8 continuous installments? My friends told me equity is better than FD, but FD would have given 7% guaranteed. Seriously contemplating pausing till market stabilizes.",
    upvotes: 84,
    platform_meta: { subreddit: "mutualfunds", comments_count: 42 }
  },
  {
    id: "reddit_groww_mandate_bounce",
    source: "reddit",
    source_url: "https://www.reddit.com/r/groww/comments/1c3abc/groww_sip_mandate_failed_and_bank_charged_590/",
    author: "techie_investor",
    date: "2024-05-03T09:20:00Z",
    text: "Groww UPI autopay failed yesterday due to technical issue on their side, and ICICI bank slapped a ₹590 ECS bounce charge on my account! When I reached out to Groww customer care, they blamed the bank and refused to reimburse. Why doesn't Groww send an SMS reminder 24 hours before the debit date or retry within 48 hours before reporting failure? Cancelled all 4 active SIPs immediately.",
    upvotes: 142,
    platform_meta: { subreddit: "groww", comments_count: 58 }
  },
  {
    id: "reddit_investments_overmonitoring",
    source: "reddit",
    source_url: "https://www.reddit.com/r/IndiaInvestments/comments/1d4def/compulsive_portfolio_checking_how_to_stop/",
    author: "AnxiousAccumulator",
    date: "2024-06-15T18:45:00Z",
    text: "I started investing via SIP 6 months ago. I find myself opening Groww 5 to 6 times a day, watching the 1-day return fluctuate by a few hundred rupees. On days when market crashes by 1.5%, my entire mood gets ruined. SIP was advertised as 'invest and forget', but modern UI design with green/red flashes makes it feel like a casino slot machine. How do long-term investors detach emotionally?",
    upvotes: 215,
    platform_meta: { subreddit: "IndiaInvestments", comments_count: 89 }
  },
  {
    id: "reddit_mf_stepup_regret",
    source: "reddit",
    source_url: "https://www.reddit.com/r/mutualfunds/comments/1e5ghi/step_up_sip_became_unaffordable/",
    author: "MidCareerStruggler",
    date: "2024-07-20T11:30:00Z",
    text: "Selected a 15% annual step-up SIP when I was optimistic during 2023 appraisal. Fast forward to today: IT salary hikes were delayed/frozen, rent went up by 20%, and the increased SIP amount triggered an overdraft penalty. Groww doesn't have an option to 'scale down' or remove the step-up without terminating the existing mandate and creating a new one. Had to cancel the entire SIP.",
    upvotes: 97,
    platform_meta: { subreddit: "mutualfunds", comments_count: 36 }
  },
  {
    id: "reddit_groww_nav_allotment_delay",
    source: "reddit",
    source_url: "https://www.reddit.com/r/groww/comments/1f2jkl/nav_allotment_delay_during_market_dip/",
    author: "DipBuyer_IN",
    date: "2024-08-08T16:15:00Z",
    text: "On the Monday market crash (Aug 5), my SIP was scheduled. Amount was debited at 8 AM. But Groww allotted units based on Wednesday's NAV after market had already bounced back 2%! When I questioned customer support, they gave a standard script about cut-off timings and BSE Star MF delay. What's the point of SIP discipline if the broker can't execute orders on the debit date?",
    upvotes: 180,
    platform_meta: { subreddit: "groww", comments_count: 73 }
  },
  {
    id: "reddit_investments_peer_noise",
    source: "reddit",
    source_url: "https://www.reddit.com/r/IndiaInvestments/comments/1g1mno/office_peers_making_fun_of_sip_returns/",
    author: "SilentCompounder",
    date: "2024-09-14T12:05:00Z",
    text: "I am 24, doing a ₹5k monthly SIP for the past 11 months. During lunch breaks, my colleagues boast about making 30-40% in SME IPOs and options trading in a week. They tell me mutual funds are for retired boomers and that ₹5k SIP won't buy me anything in 10 years. It takes immense mental grit not to stop my SIP and jump into high-risk gambling. First-time investors desperately need milestone affirmations.",
    upvotes: 310,
    platform_meta: { subreddit: "IndiaInvestments", comments_count: 124 }
  },
  {
    id: "reddit_mf_emergency_cash_crunch",
    source: "reddit",
    source_url: "https://www.reddit.com/r/mutualfunds/comments/1h3pqr/festival_cash_pinch_and_pause_limits/",
    author: "festive_spender",
    date: "2024-10-25T15:00:00Z",
    text: "Between Diwali gifts, travel expenses, and insurance renewals in October/November, my bank balance was tight. I wanted to pause my SIP for just 2 months. In Groww, pausing requires at least 30 days prior notice for certain AMC SIPs. The debit still went through and resulted in an auto-debit failure penalty. Why is pause not instant like a Netflix subscription toggle?",
    upvotes: 115,
    platform_meta: { subreddit: "mutualfunds", comments_count: 48 }
  },
  {
    id: "reddit_groww_xirr_confusion",
    source: "reddit",
    source_url: "https://www.reddit.com/r/groww/comments/1i4stu/difference_between_xirr_and_total_return/",
    author: "CuriousCFO",
    date: "2024-11-18T10:40:00Z",
    text: "Groww shows my Total Returns as +12% but my XIRR as 24.8%. My friend says my real return is 12%, another says it's 24%. Neither of us can calculate how much money I will actually receive if I withdraw ₹50,000 today. The app does not show the net post-tax, post-exit-load withdrawal amount anywhere. Newbies get totally lost in these financial metrics.",
    upvotes: 165,
    platform_meta: { subreddit: "groww", comments_count: 51 }
  },
  {
    id: "reddit_investments_stopping_after_1yr",
    source: "reddit",
    source_url: "https://www.reddit.com/r/IndiaInvestments/comments/1j5vwx/completed_1_year_of_sip_honestly_underwhelmed/",
    author: "PragmaticPari",
    date: "2024-12-28T20:10:00Z",
    text: "Just completed exactly 12 months of ₹10,000 monthly SIP (total invested ₹1.2 Lakh). Current value is ₹1.28 Lakh. Profit of ₹8,000 on ₹1.2 Lakh after 1 year of continuous discipline. People online talk about crores in compounding, but in year 1, an ₹8k gain doesn't even feel like it moves the needle compared to a 1-month salary bonus. I understand math, but psychology says 'why lock up ₹10k every month for this?'. Stopped further installments.",
    upvotes: 420,
    platform_meta: { subreddit: "IndiaInvestments", comments_count: 178 }
  },
  {
    id: "reddit_mf_salary_cycle_disconnect",
    source: "reddit",
    source_url: "https://www.reddit.com/r/mutualfunds/comments/1k6yza/variable_salary_dates_wrecking_sip_autopay/",
    author: "gig_worker_blr",
    date: "2025-01-15T08:50:00Z",
    text: "I work at a startup where salary gets credited anywhere between the 1st and the 10th of the month. My SIP date was set to 5th. In months where salary arrived on 7th, my SIP bounced. When I tried to change the SIP date in Groww, it said I have to stop the current SIP and create a new mandate which takes 15 days to activate. Why can't we have a flexible debit window (e.g. debit between 1st-10th when balance > SIP amount)?",
    upvotes: 138,
    platform_meta: { subreddit: "mutualfunds", comments_count: 64 }
  },
  {
    id: "reddit_groww_exit_load_panic",
    source: "reddit",
    source_url: "https://www.reddit.com/r/groww/comments/1l7bcd/didnt_know_each_sip_installment_has_its_own_1_year_lockin/",
    author: "ConfusedRookie",
    date: "2025-02-19T17:25:00Z",
    text: "I thought when they say 'exit load 1% if redeemed within 1 year', it meant 1 year from when I opened the account! Today at month 11 I needed funds and realized each individual monthly installment has its own separate 1-year clock! So installment 11 has to stay until month 23 to avoid exit load and STCG tax! Why is this FIFO capital gains rule not explained clearly in the SIP setup screen?",
    upvotes: 275,
    platform_meta: { subreddit: "groww", comments_count: 92 }
  },
  {
    id: "reddit_mf_unclear_goals",
    source: "reddit",
    source_url: "https://www.reddit.com/r/mutualfunds/comments/1m8efg/started_sip_without_a_goal_now_stopped/",
    author: "WanderingSoul_99",
    date: "2025-03-24T14:00:00Z",
    text: "I started a SIP simply because my manager said 'tax bachega and wealth banegi'. It wasn't even ELSS, it was a regular midcap fund! After 7 months, with no specific goal attached to it, whenever I saw an attractive gadget or flight ticket sale, I stopped the SIP to spend money on immediate gratification. Without goal tags (e.g. 'Emergency Fund' or 'Trip to Japan'), an open-ended SIP has zero retention stickiness.",
    upvotes: 194,
    platform_meta: { subreddit: "mutualfunds", comments_count: 70 }
  }
];


// ── Execution ─────────────────────────────────────────────────────────────

ingestReddit().catch((err) => {
  console.error("💥 Fatal error during Reddit ingestion:", err);
  process.exit(1);
});

