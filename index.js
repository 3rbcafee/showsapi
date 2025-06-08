const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS for all routes
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

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
app.post('/api/shows', async (req, res) => {
    try {
        const { channelIds } = req.body;
        
        if (!Array.isArray(channelIds)) {
            return res.status(400).json({ error: 'channelIds must be an array' });
        }

        const showPromises = channelIds.map(id => fetchTVShowData(id));
        const shows = await Promise.all(showPromises);

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