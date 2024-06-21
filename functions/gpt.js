// functions/gpt.js

const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const ASSISTANTS_API_URL = 'https://api.openai.com/v1/assistants';
const API_KEY = process.env.OPENAI_API_KEY;

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Only POST requests are allowed' })
        };
    }

    const requestBody = JSON.parse(event.body);
    const userMessage = requestBody.input;
    const sessionId = requestBody.sessionId || null; // Get sessionId from the request if provided

    if (!userMessage) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Input text is required' })
        };
    }

    try {
        let sessionResponse;
        if (!sessionId) {
            // Initialize a new session if sessionId is not provided
            sessionResponse = await axios.post(`${ASSISTANTS_API_URL}/sessions`, {
                model: 'g-FgKli30nK-rekindle', // Use your custom model's ID
                role: 'user',
                message: userMessage
            }, {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });
        } else {
            // Continue with an existing session
            sessionResponse = await axios.post(`${ASSISTANTS_API_URL}/sessions/${sessionId}/messages`, {
                role: 'user',
                message: userMessage
            }, {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });
        }

        const responseData = sessionResponse.data;
        const gptResponse = responseData.message.content;

        return {
            statusCode: 200,
            body: JSON.stringify({
                output: gptResponse,
                sessionId: responseData.session_id // Return sessionId for the ongoing conversation
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
