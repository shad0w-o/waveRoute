# waveRoute

Interactive 2D world map plotting 5,000+ live radio stations as points. Click a station to stream it instantly, or filter the map by genre.

## Overview

waveRoute turns global radio into something you can explore visually instead of scrolling through a list.

- Browse 5,000+ live radio stations plotted on an interactive world map.
- Click any station marker to start streaming it immediately.
- Filter stations by genre to narrow down what's on the map.
- Built-in player with play/pause and volume controls, right on the map view.

## Tech Stack

**Frontend (`web/`)**
- React, Vite
- MapLibre GL JS for map rendering

**Backend (`api/`)**
- Node.js
- Express

## Project Structure

```
waveRoute/
├── api/     Backend server — serves and filters station data
├── web/     Frontend — map rendering, player UI, genre filters
└── .gitignore
```

## Running Locally

The `api/` and `web/` folders are independent — run them separately.

**Backend**
```bash
git clone https://github.com/shad0w-o/waveRoute.git
cd waveRoute/api
npm install
node app.js
# runs on http://localhost:3000 by default
```

**Frontend**
```bash
cd waveRoute/web
npm install
npm run dev
```

Make sure the frontend is pointed at the correct backend URL (e.g. `http://localhost:3000`) wherever it makes its `fetch` calls to `/getStations`.

## Credits

- [MapLibre](https://maplibre.org/) — map rendering engine
- [OpenStreetMap](https://www.openstreetmap.org/about/) — map data
