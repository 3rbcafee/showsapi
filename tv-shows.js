(function() {
    class TVShowsFetcher {
        constructor(options = {}) {
            this.apiUrl = options.apiUrl || 'https://showsapi.vercel.app/api/shows';
            this.containerId = options.containerId || 'tv-shows-container';
            this.channelIds = options.channelIds || ['1292', '1264', '1203', '1340'];
            this.channelNames = options.channelNames || {
                '1292': 'DMC Drama',
                '1264': 'DMC',
                '1203': 'CBC',
                '1340': 'DMC Sport'
            };
        }

        async fetchShows() {
            try {
                console.log('Fetching shows for channels:', this.channelIds);
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
                console.log('Received data:', data);
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
                return `<div class="show-error">${show.error}</div>`;
            }
            
            const channelName = this.channelNames[show.channelId] || show.channelId;
            console.log('Rendering show:', { ...show, channelName });
            
            return `
                <div class="show-item">
                    <a href="#${show.channelId}" class="show-link">
                        <div class="show-content">
                            <img src="${show.showImage}" alt="${show.showName}" class="show-image">
                            <div class="show-info">
                                <h2 class="show-title">${show.showName}</h2>
                                <p class="channel-name">${channelName}</p>
                            </div>
                        </div>
                    </a>
                </div>
            `;
        }

        async render() {
            const container = document.getElementById(this.containerId);
            if (!container) {
                console.error(`Container with ID "${this.containerId}" not found`);
                return;
            }

            container.innerHTML = '<div class="loading">Loading shows...</div>';
            const shows = await this.fetchShows();
            console.log('Rendering shows:', shows);
            
            if (shows.length === 0) {
                container.innerHTML = '<div class="no-shows">No shows found</div>';
                return;
            }
            
            container.innerHTML = shows.map(show => this.renderShow(show)).join('');
        }
    }

    // Make it available globally
    window.TVShowsFetcher = TVShowsFetcher;
})(); 
