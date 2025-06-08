const axios = require('axios');
const cheerio = require('cheerio');

// Function to fetch and parse TV show data
async function fetchTVShowData(channelId) {
    try {
        const url = `https://elcinema.com/tvguide/${channelId}/`;
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1'
            }
        });
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

// Vercel serverless function handler
module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Handle POST request
    if (req.method === 'POST') {
        try {
            const { channelIds } = req.body;
            
            if (!Array.isArray(channelIds)) {
                return res.status(400).json({ error: 'channelIds must be an array' });
            }

            const shows = await Promise.all(channelIds.map(id => fetchTVShowData(id)));
            res.json({ shows });
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}; 
