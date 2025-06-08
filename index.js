const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Configure CORS with specific options
const corsOptions = {
    origin: '*', // Allow all origins
    methods: ['GET', 'POST', 'OPTIONS'], // Allow these methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow these headers
    credentials: true, // Allow credentials
    preflightContinue: false,
    optionsSuccessStatus: 204
};

// Apply CORS middleware with options
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(express.static('./')); // Serve static files from root directory

// Function to fetch and parse TV show data
async function fetchTVShowData(channelId) {
    try {
        const url = `https://api.allorigins.win/raw?url=https://elcinema.com/tvguide/${channelId}/`;
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        // Find the first show in the list
        const firstShow = $('.boxed-category-3').first();
        
        // Extract show details
        const showImage = firstShow.find('img').attr('src');
        const showName = firstShow.find('a').first().text().trim();
        const showDescription = firstShow.find('ul.unstyled.no-margin li').last().text().trim();
        const showLink = firstShow.find('a').first().attr('href');

        return {
            channelId,
            showImage,
            showName,
            showDescription,
            showLink
        };
    } catch (error) {
        console.error(`Error fetching data for channel ${channelId}:`, error.message);
        return {
            channelId,
            error: 'Failed to fetch show data'
        };
    }
}

// API endpoint to fetch shows for multiple channels
app.post('/api/shows', cors(corsOptions), async (req, res) => {
    try {
        const { channelIds } = req.body;
        
        if (!Array.isArray(channelIds)) {
            return res.status(400).json({ error: 'channelIds must be an array' });
        }

        const showPromises = channelIds.map(id => fetchTVShowData(id));
        const shows = await Promise.all(showPromises);

        // Set CORS headers explicitly for this response
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        
        res.json({ shows });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Serve the main HTML page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
}); 