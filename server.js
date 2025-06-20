const express = require ( 'express')
const axios = require ( 'axios')
const dotenv = require ( 'dotenv')

dotenv.config(); // Load environment variables from .env file

const app = express();
const port = process.env.PORT || 3001; // Choose a port for your proxy server

// Middleware to parse JSON request bodies
app.use(express.json());

// Set CORS headers to allow requests from your Vercel frontend
// IMPORTANT: Replace 'YOUR_VERCEL_FRONTEND_URL' with your actual Vercel deployment URL
// For development, you can use '*' but be aware of security implications in production.
app.use((req, res, next) => {
  const allowedOrigins = [
    'https://your-vercel-app.vercel.app', // Your production Vercel URL
    'http://localhost:3000', // Your local development URL (if applicable)
    // Add any custom domains your Vercel app uses
  ];
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});



// Define your Yandex API proxy endpoint
app.get('/api/yandex-proxy', async (req, res) => {
  const yandexApiKey = process.env.YANDEX_API_KEY;
  if (!yandexApiKey) {
    return res.status(500).json({ error: 'Server configuration error: Yandex API key or base URL missing.' });
  }



  try {
    const requestConfig = {
      method: "get",
      url: `https://api-maps.yandex.ru/v3/?apikey=${yandexApiKey}&lang=ru_RU`,
      headers: {
        'Content-Type': 'application/json',
        "cache-control":"no-cache",
"origin":"http://localhost:3000",
"pragma":"no-cache",
"referer":"http://localhost:3000/",
"user-agent":"Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
        },
    };

    const yandexResponse = await axios(requestConfig);

    res.json(yandexResponse.data);
  } catch (error) {
    console.error('Error proxying Yandex API request:', error.message);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Yandex API Response Error:', error.response.data);
      console.error('Yandex API Status:', error.response.status);
      res.status(error.response.status).json(error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from Yandex API:', error.request);
      res.status(500).json({ error: 'No response from Yandex API.' });
    } else {
      // Something else happened in setting up the request that triggered an Error
      console.error('Error setting up Yandex API request:', error.message);
      res.status(500).json({ error: 'Error processing Yandex API request.' });
    }
  }
});

app.listen(port, () => {
  console.log(`Yandex Proxy Server listening at http://localhost:${port}`);
});