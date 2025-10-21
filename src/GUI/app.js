// Configuration
const API_BASE_URL = 'http://localhost:4444/api';

// DOM Elements
const tabs = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const modal = document.getElementById('anime-modal');
const modalBody = document.getElementById('modal-body');
const closeModal = document.querySelector('.close');

// Tab Switching
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const targetTab = tab.dataset.tab;

        // Remove active class from all tabs and contents
        tabs.forEach(t => t.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        // Add active class to clicked tab and corresponding content
        tab.classList.add('active');
        document.getElementById(`${targetTab}-tab`).classList.add('active');

        // Load content based on tab
        loadTabContent(targetTab);
    });
});

// Load Tab Content
function loadTabContent(tab) {
    switch(tab) {
        case 'home':
            loadHomeContent();
            break;
        case 'top-ten':
            loadTopTen('today');
            break;
        case 'search':
            // Search is triggered by user input
            break;
        case 'random':
            // Random is triggered by button click
            break;
    }
}

// API Fetch Helper
async function fetchAPI(endpoint) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`);
        const data = await response.json();
        if (data.success) {
            return data.results;
        } else {
            throw new Error(data.message || 'API request failed');
        }
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Home Tab
async function loadHomeContent() {
    const loadingEl = document.getElementById('home-loading');
    const contentEl = document.getElementById('home-content');

    loadingEl.style.display = 'block';
    contentEl.innerHTML = '';

    try {
        const data = await fetchAPI('/');
        loadingEl.style.display = 'none';

        if (data.trending && data.trending.length > 0) {
            contentEl.innerHTML = data.trending.map(anime => createAnimeCard(anime)).join('');
        } else if (data.spotlight && data.spotlight.length > 0) {
            contentEl.innerHTML = data.spotlight.map(anime => createAnimeCard(anime)).join('');
        } else {
            contentEl.innerHTML = '<p class="error-message">No anime found</p>';
        }
    } catch (error) {
        loadingEl.style.display = 'none';
        contentEl.innerHTML = `<p class="error-message">Error loading content: ${error.message}</p>`;
    }
}

// Create Anime Card
function createAnimeCard(anime) {
    const title = anime.name || anime.title || 'Unknown Title';
    const imageUrl = anime.poster || anime.image || 'https://via.placeholder.com/200x280?text=No+Image';
    const id = anime.id || anime.animeId || '';
    const episodes = anime.episodes || anime.totalEpisodes || 'N/A';
    const type = anime.type || anime.category || 'N/A';

    return `
        <div class="anime-card" onclick="showAnimeDetails('${id}')">
            <img src="${imageUrl}" alt="${title}" onerror="this.src='https://via.placeholder.com/200x280?text=No+Image'">
            <div class="anime-card-body">
                <h3>${title}</h3>
                <div class="anime-info">
                    <span>${type}</span>
                    <span>EP: ${episodes}</span>
                </div>
            </div>
        </div>
    `;
}

// Show Anime Details
async function showAnimeDetails(id) {
    if (!id) return;

    modal.style.display = 'block';
    modalBody.innerHTML = '<div class="loading">Loading details...</div>';

    try {
        const data = await fetchAPI(`/info?id=${id}`);

        const detailsHTML = `
            <div class="anime-detail-content">
                <img src="${data.poster || 'https://via.placeholder.com/250x350'}" alt="${data.name}">
                <div class="anime-detail-info">
                    <h2>${data.name || 'Unknown Title'}</h2>
                    <p><span class="label">Japanese:</span> ${data.jname || 'N/A'}</p>
                    <p><span class="label">Type:</span> ${data.info?.type || 'N/A'}</p>
                    <p><span class="label">Episodes:</span> ${data.info?.episodes || 'N/A'}</p>
                    <p><span class="label">Status:</span> ${data.info?.status || 'N/A'}</p>
                    <p><span class="label">Aired:</span> ${data.info?.aired || 'N/A'}</p>
                    <p><span class="label">Premiered:</span> ${data.info?.premiered || 'N/A'}</p>
                    <p><span class="label">Duration:</span> ${data.info?.duration || 'N/A'}</p>
                    <p><span class="label">Rating:</span> ${data.info?.rating || 'N/A'}</p>
                    <p><span class="label">Studios:</span> ${data.info?.studios || 'N/A'}</p>
                    <p><span class="label">Genres:</span> ${data.info?.genres || 'N/A'}</p>
                    ${data.description ? `<p style="margin-top: 15px;">${data.description}</p>` : ''}
                </div>
            </div>
        `;

        modalBody.innerHTML = detailsHTML;
    } catch (error) {
        modalBody.innerHTML = `<p class="error-message">Error loading details: ${error.message}</p>`;
    }
}

// Search Functionality
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const searchResults = document.getElementById('search-results');
const searchLoading = document.getElementById('search-loading');
const searchSuggestions = document.getElementById('search-suggestions');

// Search suggestions with debounce
let searchTimeout;
searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const query = e.target.value.trim();

    if (query.length < 2) {
        searchSuggestions.innerHTML = '';
        return;
    }

    searchTimeout = setTimeout(async () => {
        try {
            const data = await fetchAPI(`/search/suggest?q=${encodeURIComponent(query)}`);

            if (data.suggestions && data.suggestions.length > 0) {
                searchSuggestions.innerHTML = data.suggestions.map(suggestion =>
                    `<div class="suggestion-item" onclick="searchAnime('${suggestion.name || suggestion}')">${suggestion.name || suggestion}</div>`
                ).join('');
            } else {
                searchSuggestions.innerHTML = '';
            }
        } catch (error) {
            console.error('Suggestions error:', error);
            searchSuggestions.innerHTML = '';
        }
    }, 300);
});

// Search function
async function searchAnime(query) {
    if (!query && searchInput.value.trim()) {
        query = searchInput.value.trim();
    }

    if (!query) return;

    searchInput.value = query;
    searchSuggestions.innerHTML = '';
    searchResults.innerHTML = '';
    searchLoading.style.display = 'block';

    try {
        const data = await fetchAPI(`/search?keyword=${encodeURIComponent(query)}`);
        searchLoading.style.display = 'none';

        if (data.animes && data.animes.length > 0) {
            searchResults.innerHTML = data.animes.map(anime => createAnimeCard(anime)).join('');
        } else {
            searchResults.innerHTML = '<p class="error-message">No results found</p>';
        }
    } catch (error) {
        searchLoading.style.display = 'none';
        searchResults.innerHTML = `<p class="error-message">Error searching: ${error.message}</p>`;
    }
}

searchBtn.addEventListener('click', () => searchAnime());
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchAnime();
    }
});

// Top Ten Functionality
const topTenFilters = document.querySelectorAll('input[name="top-period"]');
topTenFilters.forEach(filter => {
    filter.addEventListener('change', (e) => {
        if (e.target.checked) {
            loadTopTen(e.target.value);
        }
    });
});

async function loadTopTen(period = 'today') {
    const loadingEl = document.getElementById('top-ten-loading');
    const contentEl = document.getElementById('top-ten-content');

    loadingEl.style.display = 'block';
    contentEl.innerHTML = '';

    try {
        const data = await fetchAPI(`/top-ten?filter=${period}`);
        loadingEl.style.display = 'none';

        if (data[period] && data[period].length > 0) {
            contentEl.innerHTML = data[period].map((anime, index) => `
                <div class="anime-list-item" onclick="showAnimeDetails('${anime.id}')">
                    <div class="rank">#${index + 1}</div>
                    <img src="${anime.poster}" alt="${anime.name}" onerror="this.src='https://via.placeholder.com/80x110'">
                    <div class="anime-list-item-info">
                        <h3>${anime.name}</h3>
                        <p>Episodes: ${anime.episodes || 'N/A'}</p>
                    </div>
                </div>
            `).join('');
        } else {
            contentEl.innerHTML = '<p class="error-message">No data available</p>';
        }
    } catch (error) {
        loadingEl.style.display = 'none';
        contentEl.innerHTML = `<p class="error-message">Error loading top ten: ${error.message}</p>`;
    }
}

// Random Anime
const randomBtn = document.getElementById('random-btn');
const randomLoading = document.getElementById('random-loading');
const randomContent = document.getElementById('random-content');

randomBtn.addEventListener('click', async () => {
    randomContent.innerHTML = '';
    randomLoading.style.display = 'block';

    try {
        const data = await fetchAPI('/random');
        randomLoading.style.display = 'none';

        const detailsHTML = `
            <div class="anime-detail-content">
                <img src="${data.poster || 'https://via.placeholder.com/250x350'}" alt="${data.name}">
                <div class="anime-detail-info">
                    <h2>${data.name || 'Unknown Title'}</h2>
                    <p><span class="label">Japanese:</span> ${data.jname || 'N/A'}</p>
                    <p><span class="label">Type:</span> ${data.info?.type || 'N/A'}</p>
                    <p><span class="label">Episodes:</span> ${data.info?.episodes || 'N/A'}</p>
                    <p><span class="label">Status:</span> ${data.info?.status || 'N/A'}</p>
                    <p><span class="label">Rating:</span> ${data.info?.rating || 'N/A'}</p>
                    <p><span class="label">Genres:</span> ${data.info?.genres || 'N/A'}</p>
                    ${data.description ? `<p style="margin-top: 15px;">${data.description}</p>` : ''}
                    <button class="big-btn" style="margin-top: 20px;" onclick="showAnimeDetails('${data.id}')">View Full Details</button>
                </div>
            </div>
        `;

        randomContent.innerHTML = detailsHTML;
    } catch (error) {
        randomLoading.style.display = 'none';
        randomContent.innerHTML = `<p class="error-message">Error loading random anime: ${error.message}</p>`;
    }
});

// Modal Controls
closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// Initialize
loadHomeContent();
