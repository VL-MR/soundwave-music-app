import React, { useEffect, useState, useContext, useRef } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogContent';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import $ from 'jquery';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { MusicContext } from './MusicContext';
import './NavMenu.css';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { ColorExtractor } from 'react-color-extractor';
import axios from 'axios';
export function UserPlaylistSongs() {
    const { currentTrack, setCurrentTrack, musicTracks, setMusicTracks } = useContext(MusicContext);
    const [songs, setSongs] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedTrack, setSelectedTrack] = useState(null);
    const { playlistId } = useParams();
    const userID = localStorage.getItem('userID');
    const [open, setOpen] = useState(false);
    const [results, setResults] = useState([]);
    const [addTracks, setAddTracks] = useState([]);
    const [inputArtist, setInputArtist] = useState("");
    const suggestNode = useRef(null);
    const [realPlaylistId, setRealPlaylistId] = useState(null);
    useEffect(() => {
        if (playlistId === 'favorites') {
            axios.get(`/playlist?userID=${userID}`)
                .then(response => {
                    setRealPlaylistId(response.data[0].playlistID);
                    const favoriteId = response.data[0].playlistID;
                    axios.get(`/playlistsong/${favoriteId}`)
                        .then(response => {
                            setSongs(response.data);
                        })
                        .catch(error => {
                            console.error(`Error fetching data: ${error}`);
                        })
                })
                .catch(error => {
                    console.error(`Error fetching data: ${error}`);
                })
        } else {
            axios.get(`/playlistsong/${playlistId}`)
                .then(response => {
                    setSongs(response.data);
                })
                .catch(error => {
                    console.error(`Error fetching data: ${error}`);
                })
        }
    }, [playlistId, userID]);


    const handlePlayTrack = (track) => {
        setMusicTracks(songs);

        if (currentTrack === track) {
            setCurrentTrack(null);
        } else {
            if (currentTrack) {
                setCurrentTrack(null);
            }
            setCurrentTrack(track);
        }
    }

    const downloadTrack = async (track) => {
        const url = encodeURIComponent(track.url);
        const name = encodeURIComponent(track.title);

        const response = await fetch(`/song/download?url=${url}&name=${name}`);
        const blob = await response.blob();

        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = track.title + ".mp3";
        link.click();
    };

    const handleClick = (songUrl) => {
        window.history.pushState({}, '', `/song/${encodeURIComponent(songUrl)}`);
        window.dispatchEvent(new PopStateEvent('popstate'));
    }

    const toggleDropdown = (index) => {
        setSongs(prevSongs => {
            const newSongs = [...prevSongs];
            newSongs[index].dropdownOpen = !newSongs[index].dropdownOpen;
            return newSongs;
        });
    }

    const toggleDialog = () => {
        setDialogOpen(prevState => !prevState);
    };

    const handleDeleteFromPlaylist = (songId) => {
        if (songId) {
            axios.delete(`/playlistsong/${songId}`)
                .then(() => {
                    setSongs(prevSongs => prevSongs.filter(song => song.playlistSongID !== songId));
                })
                .catch(error => {
                    console.error(`Error deleting song: ${error}`);
                });
            console.log(songId);
        }
        toggleDialog();
    }
    const getInfo = async (inputValue, type) => {
        let str = inputValue.toLowerCase().replace(/\s+/g, '-');
        if (type === "tracks") {
            if (inputArtist !== null && inputArtist !== "") {
                str = inputArtist.toLowerCase().replace(/\s+/g, '-') + "-" + str;
            }
        }
        let url = `/api?Url=${"https://zvon.top/search/"}&q=${str}&selection=${type}&page=${1}`;
        let headers = type !== 'artists' ? { "X-Requested-With": "XMLHttpRequest" } : {};

        try {
            let response = await fetch(url, { method: 'GET', headers: headers });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            let responseHTML = await response.text();
            let data = $(responseHTML);

            let dbArtists = await axios.get('/artist').then(response => response.data);

            if (type === "tracks") {
                let tracks = processTracks(data, dbArtists);
                setResults(tracks);
            } else {
                var artistList = data.find('ul[class="grid gridCovers ajaxSection_content  circles "] .cover_item');
                let artists = await processArtists(artistList, dbArtists);
                setResults(artists);
            }
        } catch (error) {
            console.error(`Error fetching data: ${error}`);
        }
    }

    const processTracks = (musicList, dbArtists) => {
        let tracks = [];

        musicList.each(function () {
            let track = extractTrackData(this);
            if (track) {
                const dbArtist = dbArtists.find(artist => artist.name === track.artist && artist.type === 'artists');
                if (dbArtist && (track.artist == dbArtist.name)) {
                    track.isVisible = dbArtist.isVisible;
                }
                if (!dbArtist || dbArtist.isVisible || (!dbArtist.isVisible && userID == 1)) {
                    tracks.push(track);
                }
            }
        });

        return tracks.slice(0, 10);
    }

    const extractTrackData = (element) => {
        let musicTitle = $(element).find(".track").text().trim();
        let musicUrl = $(element).find(".play").data("url");
        let musicImage = $(element).data("img");
        let musicArtist = $(element).find(".artist").text().trim();
        let musicArtistUrl = $(element).find(".popupMenu_link__personalMusic").attr("href");
        let songUrl = $(element).find(".artist").parent().attr("href");
        let musicDuration = $(element).find(".duration").text().trim();
        let isLyric = $(element).find(".lyricsIcon").length > 0;

        if (musicTitle && musicUrl && musicImage && musicArtist && musicArtistUrl && musicDuration) {
            return { name: musicTitle, url: musicUrl, image: musicImage, artist: musicArtist, artistUrl: musicArtistUrl, duration: musicDuration, songUrl: songUrl, type: "tracks", isVisible: true, isLyric: isLyric };
        }

        return null;
    }

    const processArtists = async (artistList, dbArtists) => {
        let promises = artistList.map(function () {
            let artist = extractArtistData(this);
            if (artist) {
                const dbArtist = dbArtists.find(artist => artist.name === artist.name && artist.type === 'artists');
                if (dbArtist && (artist.name == dbArtist.name)) {
                    artist.isVisible = dbArtist.isVisible;
                }
                if (!dbArtist || dbArtist.isVisible || (!dbArtist.isVisible && userID == 1)) {
                    return Promise.resolve(artist);
                }
            }

            return Promise.resolve(null);
        });

        let artists = await Promise.all(promises);
        return artists.filter(artist => artist !== null).slice(0, 10);
    }

    const extractArtistData = (element) => {
        let artistName = $(element).find(".title").text().trim();
        let artistImage = $(element).find(".cover_img").attr("src");
        let artistUrl = $(element).find("a").attr("href");

        if (artistName && artistImage && artistUrl) {
            return { name: artistName, image: artistImage, url: artistUrl, type: 'artists' };
        }

        return null;
    }

    const handleInputChange = (type) => (e) => {
        if (type == "artists") {
            setInputArtist(e.target.value);
        }
        if (e.target.value && e.target.value.length > 1) {
            getInfo(e.target.value, type);
        }
    };


    //const getInfo = (inputValue, type) => {
    //    var xhr = new XMLHttpRequest();
    //    if (type === "tracks") {
    //        let str;
    //        str = inputValue.toLowerCase().replace(/\s+/g, '-');
    //        if (inputArtist !== "") {
    //            str = inputArtist + "-" + inputValue.toLowerCase().replace(/\s+/g, '-');
    //        }
    //        xhr.open("GET", `/api?Url=${"https://zvon.top/search/"}&q=${str}&selection=traks&page=${1}`, true);
    //        xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    //        xhr.onreadystatechange = () => {
    //            if (xhr.readyState === 4 && xhr.status === 200) {
    //                var responseHTML = xhr.response;
    //                var musicList = $(responseHTML);
    //                var tracks = [];

    //                axios.get('/artist')
    //                    .then(response => {
    //                        const dbArtists = response.data;

    //                        musicList.each(function () {
    //                            var musicTitle = $(this).find(".track").text().trim();
    //                            var musicUrl = $(this).find(".play").data("url");
    //                            var musicImage = $(this).find(".playlistImg img").attr("data-src");
    //                            var musicArtist = $(this).find(".artist").text().trim();
    //                            var musicArtistUrl = $(this).find(".popupMenu_link__personalMusic").attr("href");
    //                            var songUrl = $(this).find(".artist").parent().attr("href");
    //                            var musicDuration = $(this).find(".duration").text().trim();
    //                            var isLyric = $(this).find(".lyricsIcon").length > 0;

    //                            if (musicTitle && musicUrl && musicImage && musicArtist && musicArtistUrl && musicDuration) {
    //                                const dbArtist = dbArtists.find(artist => artist.artistName === musicArtist && artist.artistType === 'artists');

    //                                if (!dbArtist || dbArtist.isVisible) {
    //                                    tracks.push({ name: musicTitle, url: musicUrl, image: musicImage, artist: musicArtist, artistUrl: musicArtistUrl, duration: musicDuration, songUrl: songUrl, type: "tracks", isVisible: true, isLyric: isLyric });
    //                                }
    //                                else if (!dbArtist.isVisible && userID == 1) {
    //                                    tracks.push({ name: musicTitle, url: musicUrl, image: musicImage, artist: musicArtist, artistUrl: musicArtistUrl, duration: musicDuration, songUrl: songUrl, type: "tracks", isVisible: false, isLyric: isLyric });
    //                                }
    //                            }
    //                        });

    //                        tracks = tracks.slice(0, 10);
    //                        setResults(tracks);
    //                    })
    //                    .catch(error => {
    //                        console.error(`Error fetching data: ${error}`);
    //                    });

    //                setResults(tracks);
    //            }
    //        };
    //    }
    //    else {
    //        xhr.open("GET", `/api?Url=${"https://zvon.top/search/"}&q=${inputValue.toLowerCase().replace(/\s+/g, '-')}&selection=artists&page=${1}`, true);
    //        xhr.onreadystatechange = () => {
    //            if (xhr.readyState === 4 && xhr.status === 200) {
    //                var responseHTML = xhr.responseText;
    //                var artistList = $(responseHTML).find('ul[class="grid gridCovers ajaxSection_content  circles "] .cover_item');
    //                axios.get('/artist')
    //                    .then(response => {
    //                        const dbArtists = response.data;
    //                        const promises = artistList.map(function () {
    //                            var artistName = $(this).find(".title").text().trim();
    //                            var artistImage = $(this).find(".cover_img").attr("data-src");
    //                            var artistUrl = $(this).find("a").attr("href");

    //                            if (artistName && artistImage && artistUrl) {
    //                                const dbArtist = dbArtists.find(artist => artist.artistName === artistName && artist.artistType === 'artists');

    //                                if (!dbArtist || dbArtist.isVisible) {
    //                                    return Promise.resolve({ name: artistName, image: artistImage, url: artistUrl, type: 'artists', isVisible: true });
    //                                }
    //                                else if (!dbArtist.isVisible && userID == 1) {
    //                                    return Promise.resolve({ name: artistName, image: artistImage, url: artistUrl, type: 'artists', isVisible: false });
    //                                }
    //                            }

    //                            return Promise.resolve(null);
    //                        });

    //                        return Promise.all(promises);
    //                    })
    //                    .then(artists => {
    //                        artists = artists.filter(artist => artist !== null).slice(0, 10);
    //                        setResults(artists);
    //                    })
    //                    .catch(error => {
    //                        console.error(`Error fetching data: ${error}`);
    //                    });
    //            }
    //        }
    //    }
    //    xhr.send();
    //}


    //useEffect(() => {
    //    function handleClickOutside(event) {
    //        if (suggestNode.current && !suggestNode.current.contains(event.target)) {
    //            setResults([]);
    //        }
    //    }
    //    document.addEventListener('mousedown', handleClickOutside);
    //    return () => {
    //        document.removeEventListener('mousedown', handleClickOutside);
    //    };
    //}, []);

    const handleSearchClick = (result, event) => {
        setResults([]);
        if (result.type == "artists") {
            setInputArtist(result.name);
        }
        else {
            setAddTracks(prevTracks => [...prevTracks, result]);
        }
    };

    const handleDeleteSearchTrackClick = (index, event) => {
        setAddTracks(prevTracks => prevTracks.filter((track, i) => i !== index));
    };

    const handleAddToPlaylistTrack = () => {
        let id = realPlaylistId;
        if (id === null) {
            id = playlistId;
        }
        if (addTracks) {
            const newTracks = addTracks.map(track => ({
                PlaylistID: id,
                title: track.name,
                artist: track.artist,
                Duration: track.duration,
                SongUrl: track.songUrl,
                ArtistUrl: track.artistUrl,
                url: track.url,
                image: track.image,
                isLyric: track.isLyric || false,
                isVideo: track.isVideo || false,
            }));

            newTracks.forEach(track => {
                axios.post('/playlistsong', track)
                    .then(response => {
                        setSongs(prevSongs => [...prevSongs, response.data]);
                    })
                    .catch(error => {
                        console.error(`Error adding playlist: ${error}`);
                    });
            });
        }
        setResults([]);
        setAddTracks([]);
        setOpen(false);
    };


    return (
        <div>
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle style={{ backgroundColor: '#141516', color: 'white' }}>Добавление трека</DialogTitle>
                <DialogContent style={{ height: '500px', backgroundColor: '#141516' }}>
                    <h5 style={{ color: 'white' }}>Выберите трек:</h5>
                    <div className="search-container">
                        <div className="search-bar">
                            <input
                                type="search"
                                placeholder="Поиск"
                                onChange={handleInputChange("tracks")}
                                style={{ paddingLeft: '15px', outline: 'none' }}
                            />
                        </div>
                        <div
                            className="suggestContainer"
                            ref={suggestNode}
                        >
                            {results.length > 0 && (
                                <div>
                                    {['tracks'].map(type => {
                                        const resultsForType = results.filter(result => result.type === type);
                                        return resultsForType.length > 0 && (
                                            <div className="category">
                                                <div className="type">{type.charAt(0).toUpperCase() + type.slice(1)}</div>
                                                {resultsForType.map((result, index) => (
                                                    <div key={index} className="suggest" onClick={(e) => handleSearchClick(result, e)}>
                                                        <LazyLoadImage src={result.image} alt={result.name} onError={(e) => { e.target.src = '/images/unknown_artist.jpg' }}
                                                            style={{ filter: result.isVisible === false && userID == 1 ? 'grayscale(100%)' : 'none' }} />
                                                        <span>{result.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                    <h5 style={{ color: 'white', marginTop: '10px' }}>Выберите исполнителя:</h5>
                    <div className="search-container">
                        <div className="search-bar">
                            <input
                                type="search"
                                placeholder="Поиск"
                                onChange={handleInputChange("artists")}
                                style={{ paddingLeft: '15px', outline: 'none' }}
                                value={inputArtist}
                            />
                        </div>
                        <div
                            className="suggestContainer"
                            ref={suggestNode}
                        >
                            {results.length > 0 && (
                                <div>
                                    {['artists'].map(type => {
                                        const resultsForType = results.filter(result => result.type === type);
                                        return resultsForType.length > 0 && (
                                            <div className="category">
                                                <div className="type">{type.charAt(0).toUpperCase() + type.slice(1)}</div>
                                                {resultsForType.map((result, index) => (
                                                    <div key={index} className="suggest" onClick={(e) => handleSearchClick(result, e)}>
                                                        <LazyLoadImage src={result.image} alt={result.name} onError={(e) => { e.target.src = '/images/unknown_artist.jpg' }}
                                                            style={{ filter: result.isVisible === false && userID == 1 ? 'grayscale(100%)' : 'none' }} />
                                                        <span>{result.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                    <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap' }}>
                        {addTracks.map((track, index) => (
                            <div style={{
                                backgroundColor: 'rgb(10, 10, 10)',
                                borderRadius: '10px',
                                padding: '5px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'flex-start',
                                marginBottom: '10px',
                                marginRight: '10px'
                            }} key={index}>
                                <LazyLoadImage style={{
                                    height: '30px',
                                    borderRadius: '5px',
                                    marginRight: '10px'
                                }} src={track.image} alt={track.name} onError={(e) => { e.target.src = '/images/unknown_artist.jpg' }} />
                                <div style={{
                                    flexGrow: 0,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    marginRight: '10px'
                                }}>
                                    <span style={{ color: 'white' }}>{track.name}</span>
                                    <span style={{ color: 'white' }}>{track.artist}</span>
                                </div>
                                <button style={{
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    color: 'white',
                                    cursor: 'pointer'
                                }} onClick={() => handleDeleteSearchTrackClick(index)}>X</button>
                            </div>
                        ))}
                    </div>

                </DialogContent>
                <DialogActions style={{ backgroundColor: '#141516' }}>
                    <Button onClick={handleAddToPlaylistTrack} color="primary">
                        Подтвердить
                    </Button>
                    <Button onClick={() => setOpen(false)} color="primary">
                        Отмена
                    </Button>
                </DialogActions>
            </Dialog>
            {!realPlaylistId && (
                <Link to="/userplaylists">
                    <button>Назад к плейлистам</button>
                </Link>
            )}
            {/*<Button variant="outlined" color="primary" onClick={() => setOpen(true)}>*/}
            {/*    Добавить трек*/}
            {/*</Button>*/}
            {songs && (
                <ul className="track-list">
                    {songs.map((track, index) => (
                        <li key={index} className="track-item" onClick={() => handleClick(track.songUrl)}>
                            <button onClick={(event) => {
                                event.stopPropagation();
                                handlePlayTrack(track);
                            }} style={{ background: 'none', border: 'none' }}>
                                {currentTrack === track ?
                                    <svg xmlns="http://www.w3.org/2000/svg" width="3.2em" height="3.2em" viewBox="2 0 16 16">
                                        <path fillRule="evenodd" d="M6 5a.5.5 0 0 0-.5.5v5a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-5a.5.5 0 0 0-.5-.5H6zm4 0a.5.5 0 0 0-.5.5v5a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-5a.5.5 0 0 0-.5-.5h-1z" />
                                    </svg>
                                    :
                                    <svg xmlns="http://www.w3.org/2000/svg" width="2.5em" height="2.5em" viewBox="0 0 16 16">
                                        <path fillRule="evenodd" d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z" />
                                    </svg>
                                }
                            </button>
                            <img src={!track.image.includes("/") ? `/file/${track.image}` : track.image} alt={track.title} />
                            <div>
                                <p>{track.title}</p>
                                <Link to={`/artist/${encodeURIComponent(track.artistUrl)}`} className="track-link"
                                    onClick={(event) => event.stopPropagation()}>
                                    {track.artist}
                                </Link>
                            </div>
                            <p className="track-duration">{track.duration}</p>
                            <p className="track-download">
                                {track.isVideo && (
                                    <svg width="30" height="30" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z" stroke="darkviolet" transform="translate(2.5, 2.5)" />
                                        <rect x="0.5" y="0.5" width="19" height="19" rx="3.5" stroke="darkviolet" />
                                    </svg>
                                )}
                            </p>
                            <p className="track-download">
                                {track.isLyric && (
                                    <svg width="30" height="30" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M14.9 5.1002V3.7002H4.40002V5.1002H14.9ZM14.9 7.9002V6.5002H4.40002V7.9002H14.9ZM10 
10.7002V9.3002H4.40002V10.7002H10ZM15.215 9.3282L11.015 10.1122C10.903 10.1262 10.882 10.1332 10.812 10.2032C10.735 10.2662 10.7 10.3572 
10.7 10.4622V13.6752C10.497 13.5842 10.238 13.5772 10.049 13.5772C9.67102 13.5772 9.34902 13.7102 9.08302 13.9762C8.81702 14.2422 8.69102
14.5642 8.69102 14.9422C8.69102 15.3132 8.81702 15.6352 9.08302 15.9012C9.34902 16.1672 9.67102 16.3002 10.049 16.3002C10.392 16.3002 10.693 16.1882 10.952 
15.9642C11.211 15.7402 11.365 15.4672 11.407 15.1312V11.6662L14.9 10.8892V13.3252C14.697 13.2342 14.508 13.1922 14.319 13.1922C13.941 13.1922 13.542 13.3252 13.276
13.5912C13.01 13.8502 12.877 14.1722 12.877 14.5502C12.877 14.9282 13.01 15.2432 13.276 15.5092C13.542 15.7752 13.864 15.9082 14.242 15.9082C14.613 15.9082 14.935 15.7752
15.201 15.5092C15.467 15.2432 15.6 14.9282 15.6 
14.5502V9.7202C15.6 9.6082 15.565 9.5102 15.488 9.4332C15.4553 9.39382 15.413 9.3635 15.3652 9.34512C15.3174 9.32673 15.2657 9.32091 15.215 9.3282ZM8.60002
13.5002V12.1002H4.40002V13.5002H8.60002ZM7.20002 16.3002V14.9002H4.40002V16.3002H7.20002Z" fill="darkviolet" stroke="none" />
                                        <rect x="0.5" y="0.5" width="19" height="19" rx="3.5" stroke="darkviolet" />
                                    </svg>
                                )}
                            </p>
                            {/*<p className="track-download" onClick={(event) => { window.open(track.url, '_blank'); event.stopPropagation(); }}>*/}
                            <p
                                className="track-download"
                                onClick={(event) => {
                                    downloadTrack(track);
                                    event.stopPropagation();
                                }}
                            >
                                <svg className="download-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="7 10 12 15 17 10"></polyline>
                                    <line x1="12" y1="15" x2="12" y2="3"></line>
                                </svg>
                            </p>
                            <div className="track-download" ref={node => { node = node; }} style={{ position: 'relative', display: 'block' }}>
                                <div onClick={(event) => {
                                    toggleDropdown(index);
                                    setSelectedTrack(track.playlistSongID);
                                    event.stopPropagation();
                                }}>
                                    <svg className="download-icon" width="2em" height="2em" viewBox="2 0 16 16">
                                        <circle cx="8" cy="4" r="0.5" />
                                        <circle cx="8" cy="8" r="0.5" />
                                        <circle cx="8" cy="12" r="0.5" />
                                    </svg>
                                </div>
                                {track.dropdownOpen && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '100%',
                                        right: 0,
                                        width: 'fit-content',
                                        backgroundColor: 'white',
                                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                        zIndex: 1000,
                                        overflowY: 'auto',
                                        maxHeight: '300px'
                                    }}>
                                        <div style={{ margin: '10px 0', padding: '0 10px' }} onClick={(event) => {
                                            toggleDialog();
                                            event.stopPropagation();
                                        }}>Удалить из плейлиста</div>
                                    </div>
                                )}
                            </div>
                        </li>
                    ))}
                    <li className="track-item" onClick={() => setOpen(true)}>
                        <Button color="primary" style={{ width: '100%' }}>
                            + Добавить трек
                        </Button>
                    </li>
                    <Dialog open={dialogOpen} onClose={toggleDialog}>
                        <DialogTitle>Вы уверены?</DialogTitle>
                        <DialogActions>
                            <Button onClick={() => handleDeleteFromPlaylist(selectedTrack)} color="primary">
                                Подтвердить
                            </Button>
                            <Button onClick={toggleDialog} color="primary">
                                Отмена
                            </Button>
                        </DialogActions>
                    </Dialog>
                </ul>
            )}
        </div>
    );

}
