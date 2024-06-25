// functions/gpt.js

const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const ASSISTANTS_API_URL = 'https://api.openai.com/v1/assistants';
const API_KEY = process.env.OPENAI_API_KEY;
const ASSISTANT_ID = 'asst_MzkZbILBkb0osJvbcnmuUtUF';

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Only POST requests are allowed' })
        };
    }

    const requestBody = JSON.parse(event.body);
    const userMessage = requestBody.input;
    const threadId = requestBody.threadId || null; // Get threadId from the request if provided

    if (!userMessage) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Input text is required' })
        };
    }

    try {
        let response;

        if (!threadId) {
            // Initialize a new thread if threadId is not provided
            console.log('Starting a new thread with assistant:', ASSISTANT_ID);
            response = await axios.post(`${ASSISTANTS_API_URL}/${ASSISTANT_ID}/threads`, {
                messages: [{ role: 'user', content: userMessage }]
            }, {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });
        } else {
            // Continue with an existing thread
            console.log('Continuing thread:', threadId);
            response = await axios.post(`${ASSISTANTS_API_URL}/${ASSISTANT_ID}/threads/${threadId}/messages`, {
                role: 'user',
                content: userMessage
            }, {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });
        }

        const responseData = response.data;
        const gptResponse = responseData.messages[responseData.messages.length - 1].content;
        const newThreadId = responseData.id;

        console.log('Thread ID:', newThreadId);
        console.log('Response:', gptResponse);

        return {
            statusCode: 200,
            body: JSON.stringify({
                output: gptResponse,
                threadId: newThreadId // Return threadId for the ongoing conversation
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
