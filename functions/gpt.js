// functions/gpt.js

const fetch = require('node-fetch');
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
        const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4",
                messages: [
                    { role: "system", content: "You are a helpful assistant." },
                    { role: "user", content: userMessage }
                ]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            return {
                statusCode: response.status,
                body: JSON.stringify(errorData)
            };
        }

        const responseData = await response.json();
        return {
            statusCode: 200,
            body: JSON.stringify({ output: responseData.choices[0].message.content })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
