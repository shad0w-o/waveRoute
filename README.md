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
- Vanilla JavaScript, HTML, CSS
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

```bash
# clone the repo
git clone https://github.com/shad0w-o/waveRoute.git
cd waveRoute

# install and run the backend
cd api
npm install
npm start

# serve the frontend
cd ../web
# open index.html or serve with a static server of your choice
```

## Credits

- [MapLibre](https://maplibre.org/) — map rendering engine
- [OpenStreetMap](https://www.openstreetmap.org/about/) — map data
