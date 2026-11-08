import * as path from "path";
// @ts-ignore
const gplay = require(path.resolve(__dirname, "../groww-sip-discovery/node_modules/google-play-scraper"));


async function testPagination() {
  console.log("Testing gplay pagination for Groww...");
  const first = await gplay.reviews({
    appId: "com.nextbillion.groww",
    num: 150,
    paginate: true,
    country: "in",
    lang: "en"
  });
  console.log("First batch length:", first.data.length);
  console.log("Has nextPaginationToken:", !!first.nextPaginationToken);

  if (first.nextPaginationToken) {
    const second = await gplay.reviews({
      appId: "com.nextbillion.groww",
      num: 150,
      paginate: true,
      nextPaginationToken: first.nextPaginationToken,
      country: "in",
      lang: "en"
    });
    console.log("Second batch length:", second.data.length);
  }
}

testPagination().catch(console.error);
