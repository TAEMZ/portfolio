import AnswerEdge from '@answeredge/sdk';

const apiKey = process.env.REACT_APP_ANSWEREDGE_API_KEY;

if (!apiKey) {
    console.error(
        "AnswerEdge API key is missing! " +
        "Please add REACT_APP_ANSWEREDGE_API_KEY to your .env file and restart the dev server."
    );
}

export const answeredge = new AnswerEdge(apiKey || "placeholder-api-key");
