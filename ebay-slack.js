const axios = require("axios");
const cheerio = require("cheerio");
const { WebClient } = require("@slack/web-api");
require("dotenv").config();

const slackHook = process.env.SLACK_WEBHOOK;
const searchTerm = process.env.SEARCH_TERM;
let maxIdx = parseInt(process.env.MAX_INDEX);

async function searchEbayAndSendToSlack() {
  const url = `https://www.ebay.com/sch/i.html?_from=R40&_nkw=${encodeURIComponent(
    searchTerm
  )}&_sacat=0&_sop=10`;

  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const products = $(".s-item");
    let message = "";

    products.each((index, element) => {
      if (index > maxIdx) return false; // break;
      const name = $(element)
        .find(".s-item__title")
        .text()
        .trim()
        .replace("새 리스팅", "");
      if (name === "Shop on eBay") {
        maxIdx = maxIdx + 1;
        return;
      } // continue;
      const price = $(element).find(".s-item__price").text().trim();
      const link = $(element).find(".s-item__link").attr("href");
      message += `Product Name: ${name}\nPrice: ${price}\nLink: ${link}\n-------------------\n`;
    });

    await axios.post(slackHook, { text: message });
    console.log("Message sent to Slack.");
  } catch (error) {
    console.error("Error:", error);
  }
}

module.exports = searchEbayAndSendToSlack;
