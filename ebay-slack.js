const axios = require("axios");
const cheerio = require("cheerio");
const { WebClient } = require("@slack/web-api");
require("dotenv").config();

async function searchEbayAndSendToSlack() {
  const searchTerm = "biacore";
  const url = `https://www.ebay.com/sch/i.html?_from=R40&_nkw=${encodeURIComponent(
    process.env.SEARCH_TERM
  )}&_sacat=0&_sop=10`;

  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const products = $(".s-item");

    let message = ""; // 메시지를 저장할 변수

    products.each((index, element) => {
      if (index > process.env.MAX_INDEX) return;

      const name = $(element).find(".s-item__title").text().trim();
      const price = $(element).find(".s-item__price").text().trim();
      const link = $(element).find(".s-item__link").attr("href");

      // 메시지에 상품 정보 추가
      message += `Product Name: ${name}\nPrice: ${price}\nLink: ${link}\n-------------------\n`;
    });

    // Slack 워크스페이스에 API 요청을 보내기 위한 WebClient 생성
    const slackClient = new WebClient(process.env.SLACK_TOKEN);

    // 메시지를 Slack 채널로 전송
    const responseSlack = await slackClient.chat.postMessage({
      channel: process.env.SLACK_CHANNEL,
      text: message,
    });

    console.log("Message sent to Slack. Timestamp:", responseSlack.ts);
  } catch (error) {
    console.error("Error:", error);
  }
}

searchEbayAndSendToSlack();
