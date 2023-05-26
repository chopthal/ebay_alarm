const cron = require("node-cron");
const searchEbayAndSendToSlack = require("./ebay-slack.js");

cron.schedule("0 9 * * 1", () => {
  searchEbayAndSendToSlack();
});
