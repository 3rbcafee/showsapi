(function() {
    class TVShowsFetcher {
        constructor(options = {}) {
            this.apiUrl = options.apiUrl || 'https://showsapi-3rbcafees-projects.vercel.app/api/shows';
            this.containerId = options.containerId || 'tv-shows-container';
            this.channelIds = options.channelIds || [];
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
                return `<div style="color: red; padding: 10px; border: 1px solid red; margin: 10px 0;">${show.error}</div>`;
            }
            return `
                <div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; display: flex; gap: 20px;">
                    <img src="${show.showImage}" alt="${show.showName}" style="width: 150px; height: 200px; object-fit: cover;">
                    <div style="flex: 1;">
                        <h2><a href="${show.showLink}" target="_blank">${show.showName}</a></h2>
                        <p>${show.showDescription}</p>
                        <p><strong>Channel ID:</strong> ${show.channelId}</p>
                    </div>
                </div>
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