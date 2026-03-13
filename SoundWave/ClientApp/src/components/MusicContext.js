import React, { createContext, useState, useRef } from 'react';

export const MusicContext = createContext();

export const MusicProvider = ({ children }) => {
    const [currentTrack, setCurrentTrack] = useState(null);
    const [musicTracks, setMusicTracks] = useState([]);
    const [playing, setPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const videoRef = useRef(null);

    return (
        <MusicContext.Provider value={{ currentTrack, setCurrentTrack, musicTracks, setMusicTracks, videoRef, playing, setPlaying, currentTime, setCurrentTime }}>
            {children}
        </MusicContext.Provider>
    );
};
