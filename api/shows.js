const axios = require('axios');
const cheerio = require('cheerio');

// Function to fetch and parse TV show data
async function fetchTVShowData(channelId) {
    try {
        const url = `https://elcinema.com/tvguide/${channelId}/`;
        console.log(`Fetching from URL: ${url}`);
        
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1'
            }
        });

        // Log the response status and content type
        console.log('Response status:', response.status);
        console.log('Content type:', response.headers['content-type']);

        const $ = cheerio.load(response.data);
        
        // Find all show rows
        const showRows = $('.row');
        console.log('Number of show rows found:', showRows.length);

        // Get the first show
        const firstShow = showRows.first();
        
        // Extract show details using the exact structure from the example
        const showImage = firstShow.find('.columns.small-3.large-1 a img').attr('src');
        const showName = firstShow.find('.columns.small-6.large-3 ul.unstyled.no-margin li a').first().text().trim();
        
        // Log the raw HTML for debugging
        console.log('First show HTML:', firstShow.html());
        console.log('Show image URL:', showImage);
        console.log('Show name:', showName);

        // If we couldn't find the data, try alternative selectors
        if (!showImage || !showName) {
            console.log('Trying alternative selectors...');
            const altShowImage = firstShow.find('img').first().attr('src');
            const altShowName = firstShow.find('a').first().text().trim();
            
            console.log('Alternative image URL:', altShowImage);
            console.log('Alternative show name:', altShowName);

            return {
                channelId,
                showImage: altShowImage || showImage,
                showName: altShowName || showName
            };
        }

        return {
            channelId,
            showImage,
            showName
        };
    } catch (error) {
        console.error(`Error fetching data for channel ${channelId}:`, error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response headers:', error.response.headers);
        }
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
            console.log('Received channelIds:', channelIds);
            
            if (!Array.isArray(channelIds)) {
                return res.status(400).json({ error: 'channelIds must be an array' });
            }

            const shows = await Promise.all(channelIds.map(id => fetchTVShowData(id)));
            console.log('Sending response:', { shows });
            res.json({ shows });
        } catch (error) {
            console.error('Server error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}; 
