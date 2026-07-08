import { useState, useRef, useEffect, useCallback } from 'react';
import { CustomAPtop , GenreCarousel , StationInfo , MiniAudio , Controls } from './otherUi';
import './AudioPlayer.css'

function CustomAudioPlayer({ toggleTheme , darkMode , map , selectedGenre , setSelectedGenre }) {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [currentStation, setCurrentStation] = useState({
        name: '',
        country: '',
        state: '',
        streamUrl: ''
    });

    useEffect(() => {
        audioRef.current = new Audio();
        audioRef.current.crossOrigin = "anonymous";
        audioRef.current.preload = "none";
        audioRef.current.volume = 1;

        return () => {
            audioRef.current?.pause();
            audioRef.current = null;
        };
    }, []);

    const togglePlayPause = useCallback(() => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
        } else {
            audio.play().catch(err => console.error("Playback failed:", err));
            setIsPlaying(true);
        }
    }, [isPlaying]);

    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (!audioRef.current) return;

        audioRef.current.volume = newVolume;
        if (newVolume === 0) {
            setIsMuted(true);
        } else if (isMuted) {
            setIsMuted(false);
        }
    };

    useEffect(() => {
        if (!map) return;

        const handleStationClick = (e) => {
            const feature = e.features?.[0];
            if (!feature) return;

            const { streamUrl } = feature.properties;
            if (!streamUrl) return;

            setErrorMessage('');
            setCurrentStation(feature.properties);

            const audio = audioRef.current;
            const currentStream = audio.dataset.currentStream;

            if (currentStream !== streamUrl || !isPlaying) {
                audio.pause();
                audio.src = streamUrl;
                audio.dataset.currentStream = streamUrl;
                audio.play().catch(err => {
                    console.error("Playback failed:", err);
                    if((err.name === 'NotSupportedError' || err.name === 'NotAllowedError')){
                        setErrorMessage("Playback failed - Stream not available");
                        setIsPlaying(false);
                        
                        setTimeout(() => setErrorMessage(''), 3000);
                    }
                    
                });
                setIsPlaying(true);
            } else {
                // toggle if same station AND currently playing
                togglePlayPause();
            }
        };

        map.on('click', 'station-points', handleStationClick);

        return () => {
            map.off('click', 'station-points', handleStationClick);
        };
    }, [isPlaying, map, togglePlayPause]);

    return (
        <>
            <div className={`audio-player ${isExpanded ? '' : 'minimized'}`}>
                <CustomAPtop isExpanded={ isExpanded } setIsExpanded={ setIsExpanded } toggleTheme={ toggleTheme } darkMode={ darkMode } />

                <GenreCarousel isExpanded={ isExpanded } selectedGenre={ selectedGenre } setSelectedGenre={ setSelectedGenre } />
                    
                <StationInfo isExpanded={ isExpanded } currentStation={ currentStation } />

                <Controls isExpanded={ isExpanded } togglePlayPause={ togglePlayPause } isPlaying={ isPlaying } volume={ volume } isMuted={ isMuted } handleVolumeChange={ handleVolumeChange } />

                <MiniAudio isExpanded={ isExpanded } togglePlayPause={ togglePlayPause } isPlaying={ isPlaying } setIsExpanded={ setIsExpanded } />
            </div>
            {errorMessage && (
                <div className="error-toast">
                    {errorMessage}
                </div>
            )}
        </>
    )
}

export { CustomAudioPlayer };