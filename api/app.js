const express = require('express');
const app = express();
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const fs = require('fs');
const path = require('path');

const NodeCache = require('node-cache');
const myCache = new NodeCache( { stdTTL: 0 } );

const fetchStations = require('./stations');

app.use(helmet());
app.use(compression());
app.use(cors({ origin: true }));

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

const CACHE_FILE = path.join(__dirname, 'stations.json');
const CACHE_KEY = "stationsData";
const REFRESH_INTERVAL = 24 * 60 * 60 * 1000;
let lastRefresh = 0;
let refreshing = false;
let stationFetchPromise = null;

app.get('/getStations' , async (req , res) => {
    try {
        const cachedData = myCache.get(CACHE_KEY);
        if(cachedData) {
            // console.log("GOT IT FROM CACHE");

            if (Date.now() - lastRefresh > REFRESH_INTERVAL && !refreshing) {
                // console.log("CACHE STALE → refreshing in background");
                refreshStations();
            }

            return res.json(cachedData);
        }
        
        const stationsData = await fetchStationsOnce();
        if(stationsData != null){
            return res.json(stationsData);
        } 
        else throw new Error("radio-browser api server error");
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch stations' });
    }
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

async function fetchStationsOnce() {
    if (!stationFetchPromise) {
        stationFetchPromise = fetchStations()
            .then((stationsData) => {
                if (stationsData) {
                    myCache.set(CACHE_KEY, stationsData);
                    saveToDisk(stationsData);
                    lastRefresh = Date.now();
                }

                return stationsData;
            })
            .finally(() => {
                stationFetchPromise = null;
            });
    }

    return stationFetchPromise;
}

async function refreshStations() {
    if(refreshing) return;
    refreshing = true;
    try {
        const stationsData = await fetchStations();
        if (stationsData) {
            myCache.set(CACHE_KEY, stationsData);
            saveToDisk(stationsData);
            lastRefresh = Date.now();
            console.log("CACHE REFRESHED SUCCESSFULLY");
        }
    } catch (err) {
        console.error("Background refresh failed:", err.message);
    } finally {
        refreshing = false;
    }
}

function loadFromDisk() {
  if (fs.existsSync(CACHE_FILE)) {
    try {
      const fileData = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
      myCache.set(CACHE_KEY, fileData);
      lastRefresh = Date.now();
      console.log('Loaded stations from disk');
    } catch (err) {
      console.error('Failed loading cache file:', err.message);
    }
  }
}

function saveToDisk(data) {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(data));
  } catch (err) {
    console.error('Failed writing cache file:', err.message);
  }
}

(async () => {
    loadFromDisk(); // Preload if disk cache missing
    if (!myCache.get(CACHE_KEY)) {
        await refreshStations();
    }

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
})();