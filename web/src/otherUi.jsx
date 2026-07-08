import { useState } from "react";
import { FaLinkedin } from "react-icons/fa6";
import { LuMail } from "react-icons/lu";
import { MdDarkMode , MdLightMode } from "react-icons/md";
import { FaChevronLeft, FaChevronRight, FaRegNewspaper } from "react-icons/fa6";
import { FiHeadphones , FiRadio , FiZap , FiWind , FiFeather , FiDisc , FiActivity , FiSun , FiMinimize2 , FiMaximize2 , FiPlay , FiPause , FiVolumeX , FiVolume2 } from "react-icons/fi";

const GENRES = [
    { genre: 'All', icon: FiHeadphones },
    { genre: 'Pop', icon: FiRadio },
    { genre: 'Rock', icon: FiZap },
    { genre: 'Jazz', icon: FiWind },
    { genre: 'Classical', icon: FiFeather },
    { genre: 'Talk', icon: FiDisc },
    { genre: 'Electronic', icon: FiActivity },
    { genre: 'Hits', icon: FiSun },
    { genre: 'News', icon: FaRegNewspaper }
];

function Theme({ toggleTheme ,  mode }) {
    return (
        <div onClick={ toggleTheme } className="z theme-in">
            {
                mode === true ? <MdDarkMode className="icons"/> : <MdLightMode className="icons"/>
            }
        </div>
    );
}

function Links() {
    return (
        <div className="z links">
            <a href="https://www.linkedin.com/in/ankababu-s-351829358/" target="_blank" rel="noreferrer"> <FaLinkedin className="icons"/> </a>
            <a href="mailto:ankababu774@gmail.com"> <LuMail className="icons"/> </a>
        </div>
    );
}

function CustomAPtop({ isExpanded , setIsExpanded , toggleTheme , darkMode }) {
    if(!isExpanded) return null;

    return (
        <>
            <div className='overall-top'>
                <Links />
                <div className='t-h'>
                    <Theme toggleTheme={ toggleTheme } mode={ darkMode } />
                    <div style={{ display: 'flex' }} onClick={() => setIsExpanded(false)} >
                        <FiMinimize2 className="icons-mini theme-in" />
                    </div>
                </div>
            </div>
        </>
    );
}

function GenreCarousel({ isExpanded, selectedGenre, setSelectedGenre }){
    const [genreStartIndex, setGenreStartIndex] = useState(0);
    const visibleGenres = 3;
    const slideAmount = 95;

    if(!isExpanded) return null;

    const scrollGenresLeft = () => {
        if (genreStartIndex > 0) {
            setGenreStartIndex(genreStartIndex - 1);
        }
    };

    const scrollGenresRight = () => {
        if (genreStartIndex < GENRES.length - visibleGenres) {
            setGenreStartIndex(genreStartIndex + 1);
        }
    };

    return (
        <div className="genre-selector">  {/* genre selector */}
            <button onClick={scrollGenresLeft} disabled={genreStartIndex === 0} className="genre-arrow">
                <FaChevronLeft />
            </button>

            <div className="genre-list">
                <div className="genre-list-inner"
                    style={{
                        transform: `translateX(-${genreStartIndex * slideAmount}px)`
                    }}>
                    {GENRES.map((item) => {
                        const IconComponent = item.icon;

                        return (
                            <div key={item.genre}
                                onClick={() => setSelectedGenre(item.genre)}
                                className={`each-genre ${selectedGenre === item.genre ? 'active' : ''}`}
                            >
                                <IconComponent className="icons-mini-spl" />
                                <div>{item.genre}</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <button onClick={scrollGenresRight} disabled={genreStartIndex >= GENRES.length - visibleGenres} className="genre-arrow">
                <FaChevronRight />
            </button>
        </div>
    )
}

function StationInfo({ currentStation , isExpanded }){
    if(currentStation.name === ''){
        return (
            <div style={{ padding: '6px' }}>
                Currently Not Playing Anything!
            </div>
        )
    }

    return (
        <div className="station-info">
            <div className="station-name">{currentStation?.name}</div>
            <div className="station-location">
                { currentStation.state === undefined || currentStation.state === "" || isExpanded === false ? `${currentStation.country}` : `${currentStation.state}, ${currentStation.country}` }
            </div>
        </div>
    )
}

function MiniAudio({ isExpanded , togglePlayPause , isPlaying , setIsExpanded }){
    if(isExpanded) return null;

    return (
        <>
            <div className="inside-mini">
                <div onClick={togglePlayPause} className="control-btn-mini">
                    {isPlaying ? <FiPause className="icons-mini" /> : <FiPlay className="icons-mini" />}
                </div>

                <div onClick={() => setIsExpanded(true)} className="control-btn-mini">
                    <FiMaximize2 className="icons-mini" />
                </div>
            </div>
        </>
    )
}

function Controls({ isExpanded , togglePlayPause , isPlaying , volume , isMuted , handleVolumeChange }){
    if(!isExpanded) return null;

    return (
        <div className="controls z">
            <div onClick={togglePlayPause} className="control-btn">
                {isPlaying ? <FiPause className='icons-mini'/> : <FiPlay className='icons-mini'/>}
            </div>

            <div className="control-btn">
                <div style={{ display: 'flex' }}>
                    {isMuted ? <FiVolumeX className='icons-mini'/> : <FiVolume2 className='icons-mini'/>}
                </div>
                <div className="volume-slider">
                    <input type="range" min="0" max="1" step="0.01" value={isMuted ? 0 : volume} onChange={handleVolumeChange} className="slider" />
                </div>
            </div>
        </div>
    )
}

export { CustomAPtop , GenreCarousel , StationInfo , MiniAudio , Controls };
