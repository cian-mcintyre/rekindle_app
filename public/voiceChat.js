// public/voiceChat.js

let threadId = null; // Store threadId for maintaining context

document.getElementById('activateVoiceChat').addEventListener('click', function() {
    startVoiceChat();
});

function startVoiceChat() {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    const button = document.getElementById('activateVoiceChat');
    const icon = button.querySelector('.icon');
    icon.style.display = 'none';

    const loader = document.createElement('div');
    loader.className = 'loader';
    button.appendChild(loader);

    recognition.start();

    recognition.onstart = function() {
        console.log('Speech recognition service has started');
    };

    recognition.onresult = function(event) {
        const userText = event.results[0][0].transcript;
        console.log('Recognized text:', userText);
        displayUserText(userText);
        getGPTResponse(userText);
        loader.className = 'thinking';
    };

    recognition.onspeechend = function() {
        recognition.stop();
        console.log('Speech recognition service disconnected');
    };

    recognition.onerror = function(event) {
        console.error('Speech recognition error detected: ' + event.error);
        button.removeChild(loader);
        icon.style.display = 'block';
    };

    recognition.onend = function() {
        console.log('Speech recognition service ended');
    };
}

function getGPTResponse(text) {
    const apiEndpoint = '/.netlify/functions/gpt';

    console.log('Sending request to GPT API with text:', text);

    fetch(apiEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ input: text, threadId: threadId }) // Include the threadId for context
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => {
                console.error('Error response:', text);
                throw new Error(`HTTP error! status: ${response.status} - ${text}`);
            });
        }
        return response.json();
    })
    .then(data => {
        console.log('GPT response:', data);
        const gptResponse = data.output;
        threadId = data.threadId; // Update threadId for continued conversation
        displayGPTResponse(gptResponse);
        speakResponse(gptResponse);
        const button = document.getElementById('activateVoiceChat');
        const loader = button.querySelector('.thinking');
        if (loader) button.removeChild(loader);
        const icon = button.querySelector('.icon');
        icon.style.display = 'block';
    })
    .catch(error => {
        console.error('Error interacting with GPT:', error);
        const button = document.getElementById('activateVoiceChat');
        const loader = button.querySelector('.thinking');
        if (loader) button.removeChild(loader);
        const icon = button.querySelector('.icon');
        icon.style.display = 'block';
        displayGPTResponse("Sorry, the request took too long or there was an error. Please try again.");
    });
}

function speakResponse(text) {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = function() {
        console.log('Speech synthesis started');
    };
    utterance.onend = function() {
        console.log('Speech synthesis ended');
    };
    utterance.onerror = function(event) {
        console.error('Speech synthesis error detected: ' + event.error);
    };
    synth.speak(utterance);
}

function displayUserText(text) {
    const chatWindow = document.getElementById('chatWindow');
    const userTextElement = document.createElement('div');
    userTextElement.className = 'chat-message user-message';
    userTextElement.innerText = text;
    chatWindow.appendChild(userTextElement);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function displayGPTResponse(text) {
    const chatWindow = document.getElementById('chatWindow');
    const gptResponseElement = document.createElement('div');
    gptResponseElement.className = 'chat-message gpt-message';
    gptResponseElement.innerText = text;
    chatWindow.appendChild(gptResponseElement);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}
