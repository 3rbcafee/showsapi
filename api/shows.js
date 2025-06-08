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
        const $ = cheerio.load(response.data);

        // Find the first show in the list
        const firstShow = $('.row').first();
        console.log('First show element found:', firstShow.length > 0);
        
        // Extract show details with more specific selectors
        const showImage = firstShow.find('.columns.small-3.large-1 a img').attr('src');
        const showName = firstShow.find('.columns.small-6.large-3 ul.unstyled.no-margin li a').first().text().trim();
        
        console.log('Raw HTML:', firstShow.html());
        console.log('Extracted data:', { channelId, showImage, showName });

        if (!showImage || !showName) {
            console.error('Failed to extract show data:', {
                showImageFound: !!showImage,
                showNameFound: !!showName,
                html: firstShow.html()
            });
        }

        return {
            channelId,
            showImage,
            showName
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
