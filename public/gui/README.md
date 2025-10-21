# Anime API GUI

A simple, modern web interface to explore and interact with the Anime API.

## Features

- **Home Tab**: View trending anime from the API
- **Search Tab**: Search for anime with auto-suggestions
- **Top 10 Tab**: Browse top 10 anime (daily, weekly, monthly)
- **Random Tab**: Get a random anime recommendation
- **Modal Details**: Click any anime to view detailed information

## How to Use

### After Deployment
Once your API is deployed (e.g., on Vercel, Railway, etc.), access the GUI at:
```
https://your-domain.com/gui/index.html
```

Or click the **"Explore API GUI"** button on the main landing page.

### Local Development

1. Make sure the API server is running:
   ```bash
   npm start
   # or
   npm run dev
   ```
   The server should be running on `http://localhost:4444`

2. Open the GUI in your browser:
   - Open `src/GUI/index.html` directly in your browser, or
   - Serve it using a simple HTTP server:
     ```bash
     cd src/GUI
     python3 -m http.server 8000
     # Then open http://localhost:8000
     ```
   - Or access via the public folder at `http://localhost:4444/gui/index.html`

3. Navigate through the tabs to explore different features:
   - **Home**: Browse trending anime automatically loaded
   - **Search**: Type in the search box to get suggestions and results
   - **Top 10**: Select time period (today/week/month) to view rankings
   - **Random**: Click the button to get a random anime

4. Click on any anime card to view detailed information in a modal

## Configuration

The API base URL is automatically configured in `app.js`:
```javascript
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:4444/api'
    : '/api'; // Use relative URL in production
```

The GUI automatically detects if it's running locally or in production:
- **Local**: Uses `http://localhost:4444/api`
- **Production**: Uses relative path `/api` (same domain as the GUI)

## API Endpoints Used

- `GET /api/` - Home/trending anime
- `GET /api/search?keyword={query}` - Search anime
- `GET /api/search/suggest?q={query}` - Search suggestions
- `GET /api/top-ten?filter={period}` - Top 10 anime
- `GET /api/random` - Random anime
- `GET /api/info?id={id}` - Anime details

## Technologies

- Pure HTML5
- CSS3 with Grid and Flexbox
- Vanilla JavaScript (ES6+)
- Fetch API for HTTP requests

## Browser Compatibility

Works on all modern browsers that support:
- ES6+ JavaScript
- CSS Grid
- Fetch API
