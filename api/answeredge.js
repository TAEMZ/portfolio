const { AnswerEdge, trackNextRequest } = require('@answeredge/sdk');

AnswerEdge.init({
  apiKey: process.env.ANSWEREDGE_API_KEY,
  endpoint: "https://eight-brave-soviet-principle.trycloudflare.com",
});

module.exports = async function handler(req, res) {
  await trackNextRequest(req);
  res.status(200).json({ tracked: true });
};
