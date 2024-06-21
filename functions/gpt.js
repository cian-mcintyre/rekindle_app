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
            // Initialize a new session with your custom model
            console.log('Starting a new session with model: g-k997M6vy1-read-replayer');
            sessionResponse = await axios.post(`${ASSISTANTS_API_URL}/g-k997M6vy1-read-replayer/sessions`, {
                role: 'user',
                messages: [{ role: 'user', content: userMessage }]
            }, {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });
        } else {
            // Continue with an existing session
            console.log('Continuing session:', sessionId);
            sessionResponse = await axios.post(`${ASSISTANTS_API_URL}/g-k997M6vy1-read-replayer/sessions/${sessionId}/messages`, {
                role: 'user',
                content: userMessage
            }, {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });
        }

        const responseData = sessionResponse.data;
        const gptResponse = responseData.message.content;

        console.log('Session ID:', responseData.session_id);
        console.log('Response:', gptResponse);

        return {
            statusCode: 200,
            body: JSON.stringify({
                output: gptResponse,
                sessionId: responseData.session_id // Return sessionId for the ongoing conversation
            })
        };
    } catch (error) {
        console.error('Error interacting with GPT API:', error.response ? error.response.data : error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.response ? error.response.data : error.message })
        };
    }
};
