(function() {
    class TVShowsFetcher {
        constructor(options = {}) {
            this.apiUrl = options.apiUrl || 'https://showsapi.vercel.app/api/shows';
            this.containerId = options.containerId || 'tv-shows-container';
            this.channelIds = options.channelIds || ['1292', '1264', '1203', '1340'];
        }

        async fetchShows() {
            try {
                const response = await fetch(this.apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ channelIds: this.channelIds })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                return data.shows;
            } catch (error) {
                console.error('Error fetching shows:', error);
                return [{
                    error: `Failed to fetch shows: ${error.message}`
                }];
            }
        }

        renderShow(show) {
            if (show.error) {
                return `<div>${show.error}</div>`;
            }
            return `
                <a href="#${show.channelId}">
                    <div>
                        <img src="${show.showImage}" alt="${show.showName}">
                        <h2>${show.showName}</h2>
                    </div>
                </a>
            `;
        }

        async render() {
            const container = document.getElementById(this.containerId);
            if (!container) {
                console.error(`Container with ID "${this.containerId}" not found`);
                return;
            }

            container.innerHTML = '<div>Loading shows...</div>';
            const shows = await this.fetchShows();
            container.innerHTML = shows.map(show => this.renderShow(show)).join('');
        }
    }

    // Make it available globally
    window.TVShowsFetcher = TVShowsFetcher;
})(); 