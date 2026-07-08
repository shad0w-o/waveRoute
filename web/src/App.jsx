import { useCallback, useEffect , useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { CustomAudioPlayer } from './audioPlayer.jsx';

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:3000" : "");

function getGenreFilter(genre) {
    return genre === 'All' ? null : ['in', genre.toLowerCase(), ['get', 'tags']];
}

function applyGenreFilter(map, genre) {
    if (!map.getLayer('station-points') || !map.getLayer('station-aura')) return;

    const filter = getGenreFilter(genre);
    map.setFilter('station-points', filter);
    map.setFilter('station-aura', filter);
}

export default function Map() {
    const [darkMode, setDarkMode] = useState(true);
	const containerRef = useRef(null);
	const mapRef = useRef(null);
	const [mapInstance, setMapInstance] = useState(null);
	const [stationsData , setStationsData] = useState(null);
	const [isLoadingStations, setIsLoadingStations] = useState(true);
	const [stationsError, setStationsError] = useState('');
    const selectedRef = useRef(null);
    const selectedGenreRef = useRef('All');
    const [selectedGenre, setSelectedGenre] = useState('All');

    function toggleTheme() {
        const html = document.documentElement;
        html.classList.toggle("dark");
        setDarkMode(!darkMode);
    }

    const getStationsData = useCallback(async () => {
        setIsLoadingStations(true);
        setStationsError('');

        try {
            const response = await fetch(`${API_BASE}/getStations`);
            if (!response.ok) {
                throw new Error(`Stations request failed with ${response.status}`);
            }

            const data = await response.json();
            setStationsData(data);
        } catch(error) {
            console.error(error);
            setStationsError('Stations unavailable');
        } finally {
            setIsLoadingStations(false);
        }
    }, []);

	useEffect(() => {
		getStationsData();
	} , [getStationsData])

    useEffect(() => {
        selectedGenreRef.current = selectedGenre;
    }, [selectedGenre]);

    useEffect(() => {
        const isMobile = window.innerWidth < 768;

        const map = new maplibregl.Map({
            container: containerRef.current,
            style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
            zoom: isMobile ? 1.5 : 0,
            renderWorldCopies: false,
            attributionControl: false,
            pitchWithRotate: false,
            dragRotate: false
        });

        map.touchZoomRotate.disableRotation();
        map.dragRotate.disable();
        map.keyboard.disableRotation();
        mapRef.current = map;
        setMapInstance(map);

        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (!mapRef.current) return;
        const newStyle = darkMode 
            ? 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
            : 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json';
        
        mapRef.current.setStyle(newStyle);
    }, [darkMode]);

	useEffect(() => {
        if (!mapRef.current || !stationsData?.data?.features?.length) return;
        
        const map = mapRef.current;
        
        const popup = new maplibregl.Popup({
            closeButton: false,
            closeOnClick: false
        }).setMaxWidth("300px");

        let currentFeatureCoordinates = undefined;

        const handleMouseMove = (e) => { // thanks to mapLibre docs for this hover popup
            const featureCoordinates = e.features[0].geometry.coordinates.toString();
            if (currentFeatureCoordinates !== featureCoordinates) {
                currentFeatureCoordinates = featureCoordinates;
                map.getCanvas().style.cursor = 'pointer';

                const coordinates = e.features[0].geometry.coordinates.slice();
                const { name, country } = e.features[0].properties;
                
                // Ensure that if the map is zoomed out such that multiple copies of the feature are visible, the popup appears over the copy being pointed 
                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                }

                // Populate the popup and set its coordinates based on the feature found.
                popup.setLngLat(coordinates).setHTML(`${name} 
                    <div class="cName">${country || ''}</div>`).addTo(map);
            }
        };

        const handleMouseLeave = () => {
            currentFeatureCoordinates = undefined;
            map.getCanvas().style.cursor = '';
            popup.remove();
        };
        
        const addStations = () => {
            if (map.getSource('stations')) {
                if (map.getLayer('station-aura')) map.removeLayer('station-aura');
                if (map.getLayer('station-points')) map.removeLayer('station-points');
                map.removeSource('stations');
            }

            map.addSource('stations', {
                type: 'geojson',
                data: stationsData.data,
                promoteId: 'id'
            });

            map.addLayer({
                id: 'station-aura',
                type: 'circle',
                source: 'stations',
                paint: {
                    'circle-radius': [
                        'case',
                        ['boolean', ['feature-state', 'selected'], false],
                        14,
                        0
                    ],
                    'circle-color': '#db3c3c',
                    'circle-opacity': [
                        'case',
                        ['boolean', ['feature-state', 'selected'], false],
                        0.25,
                        0
                    ]
                }
            });

            map.addLayer({
                id: 'station-points',
                type: 'circle',
                source: 'stations',
                paint: {
                    'circle-radius': [
                        'case',
                        ['boolean', ['feature-state', 'selected'], false],
                        6.4,
                        3.2
                    ],
                    'circle-color': [
                        'case',
                        ['boolean', ['feature-state', 'selected'], false],
                        '#db3c3c',
                        darkMode ? 'rgb(210,210,210)' : 'rgb(80,80,80)'
                    ],
                    'circle-stroke-width': [
                        'case',
                        ['boolean', ['feature-state', 'selected'], false],
                        0,
                        1
                    ],
                    'circle-stroke-color': darkMode ? '#000000' : '#ffffff'
                }
            });

            if (selectedRef.current !== null) {
                map.setFeatureState(
                    { source: 'stations', id: selectedRef.current },
                    { selected: true }
                );
            }

            applyGenreFilter(map, selectedGenreRef.current);
        };

        const handleStationClick = (e) => {
            const id = e.features[0].properties.id;

            if (selectedRef.current !== null) {
                map.setFeatureState(
                    { source: 'stations', id: selectedRef.current },
                    { selected: false }
                );
            }

            map.setFeatureState(
                { source: 'stations', id },
                { selected: true }
            );

            selectedRef.current = id;
        };

        if (map.isStyleLoaded()) {
            addStations();
        } else {
            map.once('style.load', addStations);
        }
        
        const isMobile = window.matchMedia("(pointer: coarse)").matches;
        if (!isMobile) {
            map.on('mousemove', 'station-points', handleMouseMove);
            map.on('mouseleave', 'station-points', handleMouseLeave);
        }
        map.on('click', 'station-points', handleStationClick);

        return () => {
            map.off('style.load', addStations);
            map.off('mousemove', 'station-points', handleMouseMove);
            map.off('mouseleave', 'station-points', handleMouseLeave);
            map.off('click', 'station-points', handleStationClick);
        };
        
    }, [stationsData ,  darkMode]);

    useEffect(() => {
        if (!mapRef.current) return;
        applyGenreFilter(mapRef.current, selectedGenre);
    }, [selectedGenre]);

	return (
		<>
			<div ref={containerRef} style={{ position: 'absolute', width: '100vw', height: '100vh'}}> </div>
            {(isLoadingStations || stationsError) && (
                <div className="map-status z" role="status">
                    <div>{stationsError || 'Loading stations...'}</div>
                    {stationsError && (
                        <button type="button" onClick={getStationsData}>
                            Retry
                        </button>
                    )}
                </div>
            )}
            <CustomAudioPlayer toggleTheme={ toggleTheme } darkMode={ darkMode } map={ mapInstance } selectedGenre={selectedGenre}
            setSelectedGenre={setSelectedGenre}/>
		</>
	);
}
