
const https = require('https');

const apiKey = process.env.GEMINI_API_KEY;

const options = {
    hostname: 'generativelanguage.googleapis.com',
    port: 443,
    path: `/v1beta/models?key=${apiKey}`,
    method: 'GET'
};

const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log('Available Models:');
        try {
            const json = JSON.parse(data);
            if (json.models) {
                json.models.forEach(m => console.log(m.name));
            } else {
                console.log('No models found or error:', data);
            }
        } catch (e) {
            console.log('Error parsing response:', data);
        }
    });
});

req.on('error', (e) => {
    console.error('Request error:', e);
});

req.end();
