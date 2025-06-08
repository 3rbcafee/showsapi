class TVShowsFetcher {
    constructor(options = {}) {
        this.apiUrl = options.apiUrl || 'https://showsapi-3rbcafees-projects.vercel.app/api/shows';
        this.containerId = options.containerId || 'tv-shows-container';
        this.channelIds = options.channelIds || [];
        this.styles = `
            .tv-show-card {
                border: 1px solid #ddd;
                padding: 15px;
                margin: 10px 0;
                border-radius: 8px;
                display: flex;
                gap: 20px;
            }
            .tv-show-image {
                width: 150px;
                height: 200px;
                object-fit: cover;
            }
            .tv-show-info {
                flex: 1;
            }
            .tv-show-error {
                color: red;
                padding: 10px;
                border: 1px solid red;
                border-radius: 4px;
                margin: 10px 0;
            }
        `;
    }

    async fetchShows() {
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                mode: 'cors',
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
                error: `Failed to fetch shows: ${error.message}. Please check if the API is accessible.`
            }];
        }
    }

    renderShow(show) {
        if (show.error) {
            return `<div class="tv-show-error">${show.error}</div>`;
        }
        return `
            <div class="tv-show-card">
                <img src="${show.showImage}" alt="${show.showName}" class="tv-show-image">
                <div class="tv-show-info">
                    <h2><a href="${show.showLink}" target="_blank">${show.showName}</a></h2>
                    <p>${show.showDescription}</p>
                    <p><strong>Channel ID:</strong> ${show.channelId}</p>
                </div>
            </div>
        `;
    }

    async render() {
        // Add styles
        const styleSheet = document.createElement('style');
        styleSheet.textContent = this.styles;
        document.head.appendChild(styleSheet);

        // Get container
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error(`Container with ID "${this.containerId}" not found`);
            return;
        }

        // Show loading state
        container.innerHTML = '<div>Loading shows...</div>';

        // Fetch and render shows
        const shows = await this.fetchShows();
        container.innerHTML = shows.map(show => this.renderShow(show)).join('');
    }
}

// Make it available globally
window.TVShowsFetcher = TVShowsFetcher; 