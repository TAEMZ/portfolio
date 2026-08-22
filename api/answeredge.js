let AnswerEdge = null;
let trackNextRequest = null;

(async () => {
  try {
    const mod = await import('@answeredge/sdk');
    AnswerEdge = mod.AnswerEdge;
    trackNextRequest = mod.trackNextRequest;
    if (AnswerEdge && process.env.ANSWEREDGE_API_KEY) {
      AnswerEdge.init({
        apiKey: process.env.ANSWEREDGE_API_KEY,
        endpoint: "https://eight-brave-soviet-principle.trycloudflare.com",
      });
    }
  } catch (e) {}
})();

module.exports = async function handler(req, res) {
  if (trackNextRequest) {
    try {
      await trackNextRequest(req);
    } catch(e) {}
  }
  res.status(200).json({ tracked: true });
};
