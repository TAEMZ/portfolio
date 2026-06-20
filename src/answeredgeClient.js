import AnswerEdge from '@answeredge/sdk';

const apiKey = process.env.REACT_APP_ANSWEREDGE_API_KEY;

if (!apiKey) {
    console.warn(
        "AnswerEdge API key is missing! " +
        "Please add REACT_APP_ANSWEREDGE_API_KEY to your .env file and restart the dev server."
    );
}

// Initialize the singleton
AnswerEdge.init({
    apiKey: apiKey || "placeholder-api-key",
    endpoint: "https://notes-ranking-acquire-particle.trycloudflare.com"
});

export { AnswerEdge };
