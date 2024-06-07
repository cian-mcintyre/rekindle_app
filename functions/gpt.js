// functions/gpt.js

const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Only POST requests are allowed' })
        };
    }

    const apiKey = process.env.OPENAI_API_KEY;
    const apiEndpoint = 'https://api.openai.com/v1/chat/completions';
    const requestBody = JSON.parse(event.body);
    const userMessage = requestBody.input;

    if (!userMessage) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Input text is required' })
        };
    }

    try {
        const response = await axios.post(apiEndpoint, {
            model: "gpt-4",
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: userMessage }
            ]
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            }
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ output: response.data.choices[0].message.content })
        };
    } catch (error) {
        if (error.response) {
            return {
                statusCode: error.response.status,
                body: JSON.stringify(error.response.data)
            };
        } else {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: error.message })
            };
        }
    }
};
