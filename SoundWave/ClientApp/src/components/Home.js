import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import $ from 'jquery';
import { MusicContext } from './MusicContext';
import './NavMenu.css';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogContent';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import axios from 'axios';
import { ColorExtractor } from 'react-color-extractor'

export class Home extends Component {

    static contextType = MusicContext;
    constructor(props) {
        super(props);
        this.toggleDropdown = this.toggleDropdown.bind(this);

        this.state = {
            musicTracks: [],
            topCharts: [],
            newAlbums: [],
            currentTrack: null,
            selectTrack: null,
            isPlaying: false,
            dialogOpen: false,
            playlists: [],
            selectedPlaylists: [],
            userID: null,
            colors: {}
        };
    }

    async componentDidMount() {
        const userID1 = localStorage.getItem('userID');
        this.setState({ userID: userID1 });
        const favoriteTraсks = await this.fetchFavoriteTracks(userID1);
        console.log(favoriteTraсks);

        var xhr = new XMLHttpRequest();
        xhr.open("GET", "/api/top-today", true);

        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var responseHTML = xhr.responseText;
                var musicList = $(responseHTML).find(".item");
                //var limit = 20;
                //var count = 0;
                var start = 0;
                var end = 20;
                axios.get('/song')
                    .then(response => {
                        const dbTracks = response.data;
                        const promises = musicList.slice(start, end).map(function () {
                            //if (count >= limit) {
                            //    return Promise.resolve(null);
                            //}
                            //count++;

                            var musicItem = $(this);
                            var musicTitle = musicItem.data('title');
                            var songUrl = `/song/${musicItem.data('id')}`;
                            var musicUrl = $(this).find(".play").data("url");
                            var musicImage = musicItem.data('img').replace("_small", "_big");
                            var musicArtist = musicItem.data('artist');
                            var musicArtistUrl = musicItem.find('.popupMenu_link__personalMusic').attr('href');
                            var musicDuration = musicItem.find('.duration').text();
                            var isLyric = $(this).find(".lyricsIcon").length > 0;

                            if (musicTitle && musicUrl && musicImage && musicArtist && musicArtistUrl && musicDuration) {
                                var isFavorite = false;
                                if (favoriteTraсks) {
                                    var favoriteTrack = favoriteTraсks.find(track => {
                                        let trackTitle = track.title?.toString().replace(/\(.*?\)/g, '').trim().toLowerCase() || '';
                                        let compareTitle = musicTitle?.toString().replace(/\(.*?\)/g, '').trim().toLowerCase() || '';
                                        return track.songUrl === songUrl || trackTitle === compareTitle;
                                    });
                                    if (favoriteTrack) {
                                        isFavorite = true;
                                    }
                                }
                                var dbTrack;
                                if (songUrl) {
                                    dbTrack = dbTracks.find(track => track.songUrl === `https://zvon.top${songUrl}`);
                                    if (!dbTrack) {
                                        dbTrack = dbTracks.find(track => {
                                            let dbTitle = track.title?.toString().replace(/\(.*?\)/g, '').trim().toLowerCase() || '';
                                            let compareTitle = musicTitle?.toString().replace(/\(.*?\)/g, '').trim().toLowerCase() || '';

                                            return dbTitle === compareTitle;
                                        });
                                    }
                                }
                                else {
                                    dbTrack = dbTracks.find(track => track.title === musicTitle);
                                }
                                if (!dbTrack || (!dbTrack.isEdit && dbTrack.isVisible)) {
                                    return { title: musicTitle, url: musicUrl, songUrl: songUrl, image: musicImage, artist: musicArtist, artistUrl: musicArtistUrl, duration: musicDuration, dropdownOpen: false, isLyric: isLyric, lyric: "", isVisible: true, isFavorite: isFavorite };
                                }
                                else if (!dbTrack.isEdit && !dbTrack.isVisible && this.state.userID == 1) {
                                    return { title: musicTitle, url: musicUrl, songUrl: songUrl, image: musicImage, artist: musicArtist, artistUrl: musicArtistUrl, duration: musicDuration, dropdownOpen: false, isLyric: isLyric, lyric: "", isVisible: false, isFavorite: isFavorite };
                                }
                                else if (dbTrack.isEdit && dbTrack.isVisible) {
                                    return { title: dbTrack.title, url: dbTrack.url, songUrl: dbTrack.songUrl, image: dbTrack.image, artist: dbTrack.artist, artistUrl: dbTrack.artistUrl, duration: dbTrack.duration, dropdownOpen: false, isLyric: dbTrack.isLyric, isVideo: dbTrack.isVideo, lyric: dbTrack.lyric, video: dbTrack.video, isVisible: dbTrack.isVisible, isFavorite: isFavorite };
                                }
                                else if (dbTrack.isEdit && !dbTrack.isVisible && this.state.userID == 1) {
                                    return { title: dbTrack.title, url: dbTrack.url, songUrl: dbTrack.songUrl, image: dbTrack.image, artist: dbTrack.artist, artistUrl: dbTrack.artistUrl, duration: dbTrack.duration, dropdownOpen: false, isLyric: dbTrack.isLyric, isVideo: dbTrack.isVideo, lyric: dbTrack.lyric, video: dbTrack.video, isVisible: dbTrack.isVisible, isFavorite: isFavorite };
                                }
                            }

                            return Promise.resolve(null);
                        });
                        return Promise.all(promises);
                    })
                    .then(tracks => {
                        tracks = tracks.filter(track => track !== null);
                        //console.log(tracks);
                        this.setState({ musicTracks: tracks });
                    })
                    .catch(error => {
                        console.error(`Error fetching data: ${error}`);
                    });

            }
        };

        xhr.send();


        var xhr2 = new XMLHttpRequest();
        xhr2.open("GET", `/api/charts`, true);
        xhr2.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        xhr2.onreadystatechange = () => {
            if (xhr2.readyState === 4 && xhr2.status === 200) {
                var responseHTML = xhr2.responseText;
                var gridCoversList = $(responseHTML).find('ul[class="gridCovers"] .cover_item');
                var gridCovers = [];
                var limit = 24;
                gridCoversList.each(function (index) {
                    if (index < limit) {
                        var coverTitle = $(this).find(".title").text().trim();
                        var coverUrl = $(this).find("a").attr("href");
                        var coverImage = $(this).find(".cover_img").attr("src");
                        gridCovers.push({ name: coverTitle, url: coverUrl, image: coverImage });
                    }
                });
                this.setState({ topCharts: gridCovers });
            }
        };

        xhr2.send();

        if (userID1) {
            axios.get(`/playlist?userID=${userID1}`)
                .then(response => {
                    this.setState({ playlists: response.data });
                })
                .catch(error => {
                    console.error(`Error fetching data: ${error}`);
                })
        }
        document.addEventListener('click', this.handleClickOutside, true);
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.handleClickOutside, true);
    }

    async fetchFavoriteTracks(userID) {
        try {
            const playlistResponse = await axios.get(`/playlist?userID=${userID}`);
            const favoriteId = playlistResponse.data[0].playlistID;

            const songResponse = await axios.get(`/playlistsong/${favoriteId}`);
            const favoriteTracks = songResponse.data;
            return favoriteTracks;
        } catch (error) {
            console.error(`Error fetching data: ${error}`);
        }
    }

    handlePlayTrack = (track) => {
        const { currentTrack, setCurrentTrack, musicTracks, setMusicTracks } = this.context;
        setMusicTracks(this.state.musicTracks);
        if (currentTrack === track) {
            setCurrentTrack(null);
        } else {
            if (currentTrack) {
                setCurrentTrack(null);
            }
            setCurrentTrack(track);
        }
    }

    downloadTrack = async (track) => {
        const url = encodeURIComponent(track.url);
        const name = encodeURIComponent(track.title);

        const response = await fetch(`/song/download?url=${url}&name=${name}`);
        const blob = await response.blob();

        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = track.title + ".mp3";
        link.click();
    };

    handleClick = (songUrl) => {
        window.history.pushState({}, '', `/song/${encodeURIComponent(songUrl)}`);
        window.dispatchEvent(new PopStateEvent('popstate'));
    }

    toggleDropdown = (index) => {
        this.setState(prevState => {
            const newTracks = [...prevState.musicTracks];
            newTracks[index].dropdownOpen = !newTracks[index].dropdownOpen;
            return { musicTracks: newTracks };
        });
    }

    toggleDialog = () => {
        this.setState(prevState => ({ dialogOpen: !prevState.dialogOpen }));
    };

    handleClickOutside = (event) => {
        const domNode = this.node;
        if (!domNode || !domNode.contains(event.target)) {
            this.setState({
                dropdownOpen: false
            });
        }
    }

    handleCheckboxChange = (event, id) => {
        if (event.target.checked) {
            this.setState(prevState => ({
                selectedPlaylists: [...prevState.selectedPlaylists, id]
            }));
        } else {
            this.setState(prevState => ({
                selectedPlaylists: prevState.selectedPlaylists.filter(playlistId => playlistId !== id)
            }));
        }
    }

    handleAddToPlaylist = (track, playlistsId) => {
        if (track) {
            playlistsId.forEach(playlistId => {
                const newTrack = {
                    PlaylistID: playlistId,
                    title: track.title,
                    artist: track.artist,
                    Duration: track.duration,
                    SongUrl: track.songUrl,
                    ArtistUrl: track.artistUrl,
                    url: track.url,
                    image: track.image,
                    isLyric: track.isLyric || false,
                    isLyric: track.isVideo || false,
                };
                axios.post('/playlistsong', newTrack)
                    .catch(error => {
                        console.error(`Error adding playlist: ${error}`);
                    });
            });
        }
        this.toggleDialog();
        this.state.selectedTrack = null;
    }

    setDominantColor = (colors, index) => {
        this.setState(prevState => ({
            colors: {
                ...prevState.colors,
                [index]: colors[0]
            }
        }));
    };

    handleMouseEnter = (index) => {
        const color = this.state.colors[index];
        if (color) {
            const artistTiles = document.querySelectorAll('.artist-tile');
            const img = artistTiles[index].querySelector('img');
            img.style.boxShadow = `0 0 30px ${color}`;
        }
    };

    handleMouseLeave = (index) => {
        const artistTiles = document.querySelectorAll('.artist-tile');
        const img = artistTiles[index].querySelector('img');
        img.style.boxShadow = 'none';
    };

    FullHeartIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="#FF6B6B" stroke="#FF6B6B" viewBox="0 0 24 24" width="24" height="24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
    );

    EmptyHeartIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#FF6B6B" viewBox="0 0 24 24" width="24" height="24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
    );

    handleAddToFavorite = (track) => {
        if (track) {
            const newTrack = {
                PlaylistID: this.state.playlists[0].playlistID,
                title: track.title,
                artist: track.artist,
                Duration: track.duration,
                SongUrl: track.songUrl,
                ArtistUrl: track.artistUrl,
                url: track.url,
                image: track.image,
                isLyric: track.isLyric || false,
                isVideo: track.isVideo || false,
            };
            axios.post(`/playlistsong`, newTrack)
                .then(() => {
                    this.setState(prevState => ({
                        musicTracks: prevState.musicTracks.map(item =>
                            item.songUrl === track.songUrl ? { ...item, isFavorite: true } : item
                        )
                    }));
                })
                .catch(error => {
                    console.error(`Error adding artist to favorites: ${error}`);
                });
        }
    }

    handleDeleteFromFavorite = (track) => {
        if (track) {
            axios.get(`/playlistsong/${this.state.playlists[0].playlistID}`)
                .then(response => {
                    const favoriteTracks = response.data;
                    var favoriteTrack = favoriteTracks.find(favTrack => {
                        let trackTitle = favTrack.title.replace(/\(.*?\)/g, '').trim().toLowerCase();
                        let compareTitle = track.title.replace(/\(.*?\)/g, '').trim().toLowerCase();

                        return favTrack.songUrl === track.songUrl || trackTitle === compareTitle;
                    });
                    if (favoriteTrack) {
                        axios.delete(`/playlistsong/${favoriteTrack.playlistSongID}`)
                            .then(() => {
                                this.setState(prevState => ({
                                    musicTracks: prevState.musicTracks.map(item =>
                                        item.songUrl === track.songUrl ? { ...item, isFavorite: false } : item
                                    )
                                }));
                            })
                            .catch(error => {
                                console.error(`Error removing artist from favorites: ${error}`);
                            });
                    }
                })
                .catch(error => {
                    console.error(`Error fetching favorite artists: ${error}`);
                });
        }
    }

    render() {
        const { musicTracks } = this.state;

        const { currentTrack } = this.context;
        return (
            <div>
                <div style={{ paddingBottom: '20px' }}>
                    <h1 style={{ color: 'white' }}>Присоединяйтесь к музыкальному путешествию с SoundWave! Откройте для себя сегодняшний топ треков:</h1>
                </div>
                <div>
                    {musicTracks && (
                        <ul className="track-list">
                            {musicTracks.map((track, index) => (
                                <li key={index} className="track-item" onClick={() => this.handleClick(track.songUrl)}>
                                    <button onClick={(event) => {
                                        event.stopPropagation();
                                        this.handlePlayTrack(track);
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
                                    <img src={track.image} alt={track.title} />
                                    <div>
                                        <p>{track.title}</p>
                                        <Link to={`/artist/${encodeURIComponent(track.artistUrl)}`} className="track-link"
                                            onClick={(event) => event.stopPropagation()}>
                                            {track.artist}
                                        </Link>
                                    </div>
                                    {this.state.userID && (
                                        <p className="track-download" onClick={(event) => {
                                            event.stopPropagation();
                                            if (track.isFavorite) {
                                                this.handleDeleteFromFavorite(track);
                                            } else {
                                                this.handleAddToFavorite(track);
                                            }
                                        }}>
                                            {track.isFavorite === false ? <this.EmptyHeartIcon /> : <this.FullHeartIcon />}
                                        </p>
                                    )}
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
                                            this.downloadTrack(track);
                                            event.stopPropagation();
                                        }}
                                    >
                                        <svg className="download-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                            <polyline points="7 10 12 15 17 10"></polyline>
                                            <line x1="12" y1="15" x2="12" y2="3"></line>
                                        </svg>
                                    </p>
                                    {this.state.userID && (
                                        <div className="track-download" ref={node => { this.node = node; }} style={{ position: 'relative', display: 'block' }}>
                                            <div onClick={(event) => {
                                                this.toggleDropdown(index);
                                                this.selectedTrack = track;
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
                                                    maxHeight: '300px',
                                                    backgroundColor: '#141516', color: 'white'
                                                }}>
                                                    <div style={{ margin: '10px 0', padding: '0 10px' }} onClick={(event) => {
                                                        this.toggleDialog();
                                                        event.stopPropagation();
                                                    }}>Добавить в плейлист</div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </li>
                            ))}
                            <Dialog open={this.state.dialogOpen} onClose={this.toggleDialog}>
                                <DialogTitle style={{ backgroundColor: '#141516', color: 'white' }}>Add to Playlist</DialogTitle>
                                <DialogContent dividers style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#141516', color: 'white' }}>
                                    {this.state.playlists.slice(1).length > 0 ? this.state.playlists.slice(1).map((playlist, index) => (
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    onChange={(event) => this.handleCheckboxChange(event, playlist.playlistID)}
                                                />
                                            }
                                            label={playlist.playlistName}
                                        />

                                    )) : <p>Плейлисты отсутствуют</p>}
                                </DialogContent>
                                <DialogActions style={{ backgroundColor: '#141516', color: 'white' }}>
                                    <Button onClick={() => this.handleAddToPlaylist(this.selectedTrack, this.state.selectedPlaylists)} color="primary">
                                        Add
                                    </Button>
                                    <Button onClick={this.toggleDialog} color="primary">
                                        Cancel
                                    </Button>
                                </DialogActions>
                            </Dialog>
                        </ul>
                    )}
                </div>
                <h2 style={{ color: 'white', paddingLeft: '20px' }}>А так же вы можете посмотреть наш список популярных чартов:</h2>
                <div style={{ backgroundColor: '#1a1a1a', border: '1px solid rgb(111, 103, 91)', borderRadius: '5px', paddingTop: '20px' }}>
                    <div className="artist-grid" style={{ paddingLeft: '20px' }}>
                        {this.state.topCharts.map((charts, index) => (
                            <div
                                key={index}
                                className="artist-tile"
                                style={{ marginBottom: '30px' }}
                                onMouseEnter={() => this.handleMouseEnter(index)}
                                onMouseLeave={() => this.handleMouseLeave(index)}
                            >
                                <Link to={`/artist/${encodeURIComponent(charts.url)}`} style={{ textDecoration: 'none', color: 'white' }}>
                                    <ColorExtractor getColors={colors => this.setDominantColor(colors, index)}>
                                        <img src={charts.image} alt={charts.name} />
                                    </ColorExtractor>
                                    <p>{charts.name}</p>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }
}
