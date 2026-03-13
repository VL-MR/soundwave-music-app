import React, { useEffect, useState, useRef, useContext } from 'react';
import $ from 'jquery';
import { useParams } from 'react-router-dom';
import { Link, useLocation } from 'react-router-dom';
import { MusicContext } from './MusicContext';
import './NavMenu.css';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import axios from 'axios';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogContent';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
export function SearchPage() {
    const [searchData, setSearchData] = useState({ artists: [], tracks: [], charts: [], albums: [], genres: [], radio: [] });
    const { searchUrl } = useParams();
    const { currentTrack, setCurrentTrack, musicTracks, setMusicTracks } = useContext(MusicContext);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const location = useLocation();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedTrack, setSelectedTrack] = useState([]);
    const [playlists, setPlaylists] = useState([]);
    const [selectedPlaylists, setSelectedPlaylists] = useState([]);
    const node = useRef();
    const dropdownNode = useRef();
    const userID = localStorage.getItem('userID');
    useEffect(() => {
        fetchSearchData(searchUrl);
    }, [searchUrl]);

    async function fetchFavoriteTracks() {
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

    const fetchSearchData = (searchUrl) => {
        fetch(`/api?Url=${encodeURIComponent("https://zvon.top/find")}&q=${encodeURIComponent(searchUrl)}`, {
            method: 'GET',
            redirect: 'manual'
        })
            .then(response => {
                if (response.type === 'basic') {
                    var xhr = new XMLHttpRequest();
                    xhr.open("GET", `/api?Url=${"https://zvon.top/find"}&q=${response.url}`, true);
                    xhr.onreadystatechange = () => {
                        if (xhr.readyState === 4 && xhr.status === 200) {
                            var responseHTML = xhr.responseText;
                            var artistList = $(responseHTML).find('ul[class="grid gridCovers ajaxSection_content  circles "] .cover_item');
                            var albumsList = $(responseHTML).find('ul[class="grid gridCovers ajaxSection_content "] .cover_item');
                            var favoriteArtists;
                            axios.get(`/favoriteartist?userID=${userID}`)
                                .then(response => {
                                    favoriteArtists = response.data;
                                })
                                .catch(error => {
                                    console.error(`Error fetching data: ${error}`);
                                })
                            axios.get('/artist')
                                .then(response => {
                                    const dbArtists = response.data;

                                    const promises = artistList.map(function () {
                                        var artistName = $(this).find(".title").text().trim();
                                        var artistImage = $(this).find(".cover_img").attr("data-src");
                                        var artistUrl = $(this).find("a").attr("href");

                                        if (artistName && artistImage && artistUrl) {
                                            var isFavorite = false;
                                            if (favoriteArtists) {
                                                var favoriteArtist = favoriteArtists.find(artist => decodeURIComponent(artist.favoriteArtistUrl) === artistUrl && artist.favoriteArtistType === 'artists');
                                                if (favoriteArtist) {
                                                    isFavorite = true;
                                                }
                                            }
                                            const dbArtist = dbArtists.find(artist => artist.name === artistName && artist.type === 'artists');

                                            if (!dbArtist || dbArtist.isVisible) {
                                                return Promise.resolve({ name: artistName, realName: artistName, image: artistImage, url: artistUrl, type: 'artists', visible: true, isFavorite: isFavorite });
                                            }
                                            else if (!dbArtist.isVisible && userID == 1) {
                                                return Promise.resolve({ name: artistName, realName: artistName, image: artistImage, url: artistUrl, type: 'artists', visible: false, isFavorite: isFavorite });
                                            }
                                        }

                                        return Promise.resolve(null);
                                    });

                                    return Promise.all(promises);
                                })
                                .then(artists => {
                                    artists = artists.filter(artist => artist !== null);

                                    setSearchData(prevData => ({ ...prevData, artists: artists }));
                                })
                                .catch(error => {
                                    console.error(`Error fetching data: ${error}`);
                                });

                            axios.get('/artist')
                                .then(response => {
                                    const dbAlbums = response.data;

                                    const promises = albumsList.map(function () {
                                        var albumName = $(this).find(".title").text().trim();
                                        var albumImage = $(this).find(".cover_img").attr("data-src");
                                        var albumUrl = $(this).find("a").attr("href");

                                        if (albumName && albumImage && albumUrl) {
                                            var isFavorite = false;
                                            if (favoriteArtists) {
                                                var favoriteAlbum = favoriteArtists.find(album => decodeURIComponent(album.favoriteArtistUrl) === albumUrl && album.favoriteArtistType === 'albums');
                                                if (favoriteAlbum) {
                                                    isFavorite = true;
                                                }
                                            }
                                            const dbAlbum = dbAlbums.find(album => album.name === albumName && album.type === 'albums');

                                            if (!dbAlbum || dbAlbum.isVisible) {
                                                return Promise.resolve({ name: albumName, realName: albumName, image: albumImage, url: albumUrl, type: 'albums', visible: true, isFavorite: isFavorite });
                                            }
                                            else if (!dbAlbum.isVisible && userID == 1) {
                                                return Promise.resolve({ name: albumName, realName: albumName, image: albumImage, url: albumUrl, type: 'albums', visible: false, isFavorite: isFavorite });
                                            }
                                        }

                                        return Promise.resolve(null);
                                    });

                                    return Promise.all(promises);
                                })
                                .then(albums => {
                                    albums = albums.filter(album => album !== null);

                                    setSearchData(prevData => ({ ...prevData, albums: albums }));
                                })
                                .catch(error => {
                                    console.error(`Error fetching data: ${error}`);
                                });

                            //setSearchData({ artists: artists, albums: albums });
                            searchTracks(1);
                        }
                    };
                    xhr.send();
                } else {
                    return response.text();
                }
            })
            .catch(error => {
                console.error('Fetch error:', error);
            });

    };

    const searchTracks = async (page) => {
        //const serverPage = Math.ceil(page / 3.33);
        var favoriteTraсks = await fetchFavoriteTracks();
        var url = encodeURIComponent(searchUrl.toLowerCase().replace(/\s+/g, '-'));
        console.log(url);
        var xhr2 = new XMLHttpRequest();
        var regex = /[а-яА-ЯЁё]/;

        if (regex.test(searchUrl)) {
            xhr2.open("GET", `/api?Url=${"https://zvon.top/search/"}&q=${url}`, true);
        } else {
            xhr2.open("GET", `/api?Url=${"https://zvon.top/search/"}${url}&selection=tracks&page=${page}`, true);
        }
        xhr2.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        xhr2.onreadystatechange = () => {
            if (xhr2.readyState === 4 && xhr2.status === 200) {
                var responseHTML = xhr2.responseText;
                var musicList = $(responseHTML);
                axios.get('/song')
                    .then(response => {
                        const dbTracks = response.data;
                        const promises = musicList.map(function () {
                            var musicItem = $(this);
                            var musicTitle = musicItem.data('title');
                            var songUrl = `/song/${musicItem.data('id')}`;
                            var musicUrl = $(this).find(".play").data("url");
                            var musicImage = musicItem.data('img');
                            var musicArtist = musicItem.data('artist');
                            var musicArtistUrl = musicItem.find('.popupMenu_link__personalMusic').attr('href');
                            var musicDuration = musicItem.find('.duration').text();
                            var isLyric = $(this).find(".lyricsIcon").length > 0;

                            if (musicTitle && musicUrl && musicImage && musicArtist && musicArtistUrl && musicDuration) {
                                var isFavorite = false;
                                if (favoriteTraсks) {
                                    var favoriteTrack = favoriteTraсks.find(track => {
                                        let trackTitle = track.title.replace(/\(.*?\)/g, '').trim().toLowerCase();
                                        let compareTitle = musicTitle.replace(/\(.*?\)/g, '').trim().toLowerCase();
                                        return track.songUrl === songUrl || trackTitle === compareTitle;
                                    });
                                    if (favoriteTrack) {
                                        isFavorite = true;
                                    }
                                }
                                const dbTrack = dbTracks.find(track => decodeURIComponent(track.url) === musicUrl);

                                if (!dbTrack || dbTrack.isVisible) {
                                    return Promise.resolve({ title: musicTitle, url: musicUrl, songUrl: songUrl, image: musicImage, artist: musicArtist, artistUrl: musicArtistUrl, duration: musicDuration, isVisible: true, dropdownOpen: false, isLyric: isLyric, isFavorite: isFavorite });
                                }
                                else if (!dbTrack.isVisible && userID == 1) {
                                    return Promise.resolve({ title: musicTitle, url: musicUrl, songUrl: songUrl, image: musicImage, artist: musicArtist, artistUrl: musicArtistUrl, duration: musicDuration, isVisible: false, dropdownOpen: false, isLyric: isLyric, isFavorite: isFavorite });
                                }
                            }

                            return Promise.resolve(null);
                        });

                        return Promise.all(promises);
                    })
                    .then(tracks => {
                        tracks = tracks.filter(track => track !== null);
                        setSearchData(prevSearchData => ({
                            ...prevSearchData,
                            tracks: tracks
                        }));
                    })
                    .catch(error => {
                        console.error(`Error fetching data: ${error}`);
                    });
                var lastPage = xhr2.getResponseHeader('Last-Page');
                if (lastPage) {
                    //setTotalPages(Math.ceil(parseInt(lastPage, 10) * 100 / 30));
                    setTotalPages(Math.ceil(parseInt(lastPage, 10)));
                }
                //var startIndex = ((page - 1) % 3) * 30;
                //var endIndex = startIndex + 30;
                //if (tracks.length < endIndex) {
                //    endIndex = tracks.length;
                //}
                //var itemsForApplicationPage = tracks.slice(startIndex, endIndex);
                //setSearchData(prevSearchData => ({
                //    ...prevSearchData,
                //    //tracks: itemsForApplicationPage
                //    tracks: tracks
                //}));
            }
        }
        xhr2.send();

    }

    const handlePlayTrack = (track, tracks) => {
        setMusicTracks(tracks);
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

    const handlePageClick = (pageNumber) => {
        setCurrentPage(pageNumber);
        searchTracks(pageNumber);
        //window.scrollTo(0, 0);
    };

    const startPage = currentPage - 2 < 1 ? 1 : currentPage - 2;
    const endPage = startPage + 4 > totalPages ? totalPages : startPage + 4;

    const pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
    }

    while (pageNumbers.length < 5 && pageNumbers[0] > 1) {
        pageNumbers.unshift(pageNumbers[0] - 1);
    }

    while (pageNumbers.length < 5 && pageNumbers[pageNumbers.length - 1] < totalPages) {
        pageNumbers.push(pageNumbers[pageNumbers.length - 1] + 1);
    }

    const handleAddToFavorite = (artist) => {
        if (artist) {
            let type = artist.type;
            let url = artist.url;
            if (type != 'radio') {
                url = encodeURIComponent(artist.url)
            }
            const newFavoriteArtist = {
                FavoriteArtistName: artist.name,
                FavoriteArtistType: type,
                FavoriteArtistUrl: url,
                FavoriteArtistImage: artist.image,
            };
            axios.post(`/favoriteartist?userID=${userID}`, newFavoriteArtist)
                .then(() => {
                    setSearchData(prevData => ({
                        ...prevData,
                        [artist.type]: prevData[artist.type].map(item =>
                            item.url === artist.url ? { ...item, isFavorite: !item.isFavorite } : item
                        )
                    }));
                })
                .catch(error => {
                    console.error(`Error adding artist to favorites: ${error}`);
                });
        }
    }

    const handleDeleteFromFavorite = (artist) => {
        if (artist) {
            let url = artist.type !== 'radio' ? encodeURIComponent(artist.url) : artist.url;

            axios.get(`/favoriteartist?userID=${userID}`)
                .then(response => {
                    const favoriteArtists = response.data;
                    const favoriteArtist = favoriteArtists.find(favArtist => favArtist.favoriteArtistUrl === url);

                    if (favoriteArtist) {
                        axios.delete(`/favoriteartist?userID=${userID}&id=${favoriteArtist.favoriteArtistID}`)
                            .then(() => {
                                setSearchData(prevData => ({
                                    ...prevData,
                                    [artist.type]: prevData[artist.type].map(item =>
                                        item.url === artist.url ? { ...item, isFavorite: !item.isFavorite } : item
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

    const handleShowHide = (artist) => {
        if (artist.visible == true) {
            axios.get('/artist')
                .then(response => {
                    const dbArtists = response.data;
                    const foundArtist = dbArtists.find(dbArtist => dbArtist.type === artist.type && dbArtist.realName === artist.realName);

                    if (foundArtist) {
                        axios.put(`/artist/${foundArtist.artistID}`, { ...foundArtist, isVisible: false })
                            .then(response => {
                                //setSearchData(prevData => ({
                                //    ...prevData,
                                //    [artist.type]: [...prevData[artist.type], response.data]
                                //}));
                                fetchSearchData(searchUrl);
                            })
                    } else {
                        const newArtist = {
                            name: artist.name,
                            realName: artist.realName,
                            type: artist.type,
                            url: artist.url,
                            image: artist.image,
                            isVisible: false,
                            IsEdit: false,
                        };
                        axios.post('/artist', newArtist)
                            .then(response => {
                                //setSearchData(prevData => ({
                                //    ...prevData,
                                //    [artist.type]: [...prevData[artist.type], response.data]
                                //}));
                                fetchSearchData(searchUrl);
                            })
                            .catch(error => {
                                console.error(`Error adding playlist: ${error}`);
                            })
                    }
                });
        } else {
            axios.get('/artist')
                .then(response => {
                    const dbArtists = response.data;
                    const foundArtist = dbArtists.find(dbArtist => dbArtist.type === artist.type && dbArtist.realName === artist.realName);

                    if (foundArtist) {
                        if (foundArtist.isEdit == false) {
                            axios.delete(`/artist/${foundArtist.artistID}`)
                                .then(response => {
                                    //setSearchData(prevData => ({
                                    //    ...prevData,
                                    //    [artist.type]: [...prevData[artist.type], response.data]
                                    //}));
                                    fetchSearchData(searchUrl);
                                })
                        }
                        else {
                            axios.put(`/artist/${foundArtist.artistID}`, { ...foundArtist, isVisible: true })
                                .then(response => {
                                    //setSearchData(prevData => ({
                                    //    ...prevData,
                                    //    [artist.type]: [...prevData[artist.type], response.data]
                                    //}));
                                    fetchSearchData(searchUrl);
                                })
                        }
                    }
                });
        }
    }

    const Pagination = ({ currentPage, totalPages, handlePageClick, pageNumbers }) => (
        <div className="pagination">
            {currentPage !== 1 && (
                <button className="pagination-button" onClick={() => handlePageClick(1)}>
                    {'<<'}
                </button>
            )}
            {pageNumbers.map((pageNumber) => (
                <button
                    className={`pagination-button ${pageNumber === currentPage ? 'current-page' : ''}`}
                    key={pageNumber}
                    onClick={() => handlePageClick(pageNumber)}
                >
                    {pageNumber}
                </button>
            ))}
            {currentPage !== totalPages && (
                <button className="pagination-button" onClick={() => handlePageClick(totalPages)}>
                    {'>>'}
                </button>
            )}
        </div>
    );

    const toggleDropdown = (index) => {
        setSearchData(prevData => ({
            ...prevData,
            tracks: prevData.tracks.map((track, i) => {
                if (i === index) {
                    return { ...track, dropdownOpen: !track.dropdownOpen };
                }
                return track;
            })
        }));
    };

    const toggleDialog = () => {
        setDialogOpen(prevState => !prevState);
    };

    const handleClickOutside = (event) => {
        if ((node.current && !node.current.contains(event.target)) && (dropdownNode.current && !dropdownNode.current.contains(event.target))) {
            setSearchData(prevTracks => {
                const newTracks = [...prevTracks];
                newTracks.forEach(track => track.dropdownOpen = false);
                return newTracks;
            });
        }
    };

    const handleCheckboxChange = (event, id) => {
        if (event.target.checked) {
            setSelectedPlaylists(prevSelectedPlaylists => [...prevSelectedPlaylists, id]);
        } else {
            setSelectedPlaylists(prevSelectedPlaylists => prevSelectedPlaylists.filter(playlistId => playlistId !== id));
        }
    };

    useEffect(() => {
        const userID = localStorage.getItem('userID');
        if (userID) {
            axios.get(`/playlist?userID=${userID}`)
                .then(response => {
                    setPlaylists(response.data);
                })
                .catch(error => {
                    console.error(`Error fetching data: ${error}`);
                });
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleAddToPlaylist = (track, playlistsId) => {
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
        toggleDialog();
        setSelectedPlaylists([]);
    };

    const handleAddToFavorite2 = (track) => {
        if (track) {
            const newTrack = {
                PlaylistID: playlists[0].playlistID,
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
                    setSearchData(prevData => ({
                        ...prevData,
                        tracks: prevData.tracks.map(item =>
                            item.songUrl === track.songUrl ? { ...item, isFavorite: true } : item
                        )
                    }));
                })
                .catch(error => {
                    console.error(`Error adding artist to favorites: ${error}`);
                });
        }
    }

    const handleDeleteFromFavorite2 = (track) => {
        if (track) {
            axios.get(`/playlistsong/${playlists[0].playlistID}`)
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
                                setSearchData(prevData => ({
                                    ...prevData,
                                    tracks: prevData.tracks.map(item =>
                                        item.songUrl === track.songUrl ? { ...item, isFavorite: true } : item
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

    const EyeOpenIcon = () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z" stroke="grey" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 12C2 12 5 4 12 4C19 4 22 12 22 12C22 12 19 20 12 20C5 20 2 12 2 12Z" stroke="grey" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );

    const EyeClosedIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="white" viewBox="0 0 24 24" width="24" height="24">
            <path d="M2 10.5c2.537 3.667 5.37 5.5 8.5 5.5s5.963-1.833 8.5-5.5M4.5 13.423l-2 2.077M16.5 13.423l2 2.077M12.5 16l1 2.5M8.5 16l-1 2.5" />
        </svg>
    );

    const FullHeartIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="#FF6B6B" stroke="#FF6B6B" viewBox="0 0 24 24" width="24" height="24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
    );

    const EmptyHeartIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#FF6B6B" viewBox="0 0 24 24" width="24" height="24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
    );

    return (
        <div>
            {searchData.artists.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                    <div style={{ backgroundColor: '#1a1a1a', border: '1px solid rgb(111, 103, 91)', borderRadius: '5px', paddingTop: '20px', paddingBottom: '20px' }}>
                        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: 'white' }}>Исполнители</h2>
                        <div className="artist-grid">
                            {searchData.artists.map((artist, index) => (
                                <div>
                                    <div key={index} className="artist-tile">
                                        <Link to={`/artist/${encodeURIComponent(artist.url)}`} style={{ textDecoration: 'none', color: 'white' }}>
                                            <LazyLoadImage src={artist.image} alt={artist.name} effect="blur"
                                                style={{ filter: artist.visible === false && userID == 1 ? 'grayscale(100%)' : 'none' }} />
                                        </Link>
                                        {(userID == 1) && (
                                            <div className="eye-icon-wrapper" onClick={(event) => {
                                                event.stopPropagation();
                                                handleShowHide(artist);
                                            }}>
                                                {artist.visible === false && userID == 1 ? <EyeClosedIcon /> : <EyeOpenIcon />}
                                            </div>
                                        )}
                                        {userID && (
                                            <div className="heart-icon-wrapper" onClick={(event) => {
                                                event.stopPropagation();
                                                if (artist.isFavorite) {
                                                    handleDeleteFromFavorite(artist);
                                                } else {
                                                    handleAddToFavorite(artist);
                                                }
                                            }}>
                                                {artist.isFavorite === false ? <EmptyHeartIcon /> : <FullHeartIcon />}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p style={{ color: 'white' }}>{artist.name}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {searchData.albums.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                    <div style={{ backgroundColor: '#1a1a1a', border: '1px solid rgb(111, 103, 91)', borderRadius: '5px', paddingTop: '20px' }}>
                        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: 'white' }}>Альбомы</h2>
                        <div className="artist-grid">
                            {searchData.albums.map((album, index) => (
                                <div>
                                    <div key={index} className="artist-tile">
                                        <Link to={`/artist/${encodeURIComponent(album.url)}`} style={{ textDecoration: 'none', color: 'white' }}>
                                            <LazyLoadImage src={album.image} alt={album.name} effect="blur"
                                                style={{ filter: album.visible === false && userID == 1 ? 'grayscale(100%)' : 'none' }} />
                                        </Link>
                                        {(userID == 1) && (
                                            <div className="eye-icon-wrapper" onClick={(event) => {
                                                event.stopPropagation();
                                                handleShowHide(album);
                                            }}>
                                                {album.visible === false && userID == 1 ? <EyeClosedIcon /> : <EyeOpenIcon />}
                                            </div>
                                        )}
                                        {userID && (
                                            <div className="heart-icon-wrapper" onClick={(event) => {
                                                event.stopPropagation();
                                                if (album.isFavorite) {
                                                    handleDeleteFromFavorite(album);
                                                } else {
                                                    handleAddToFavorite(album);
                                                }
                                            }}>
                                                {album.isFavorite === false ? <EmptyHeartIcon /> : <FullHeartIcon />}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p style={{ color: 'white' }}>{album.name}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {searchData.tracks.length > 0 && (
                <div>
                    <h2 style={{ textAlign: 'center', marginBottom: '20px', color: 'white' }}>Треки</h2>
                    <ul className="track-list">
                        {searchData.tracks.map((track, index) => (
                            <li key={index} className="track-item"
                                style={{ filter: track.isVisible === false && userID == 1 ? 'grayscale(100%)' : 'none' }}
                                onClick={() => handleClick(track.songUrl)}>
                                <button onClick={(event) => {
                                    event.stopPropagation();
                                    handlePlayTrack(track, searchData.tracks);
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
                                <LazyLoadImage src={track.image} alt={track.title} />
                                <div>
                                    <p>{track.title}</p>
                                    <Link to={`/artist/${encodeURIComponent(track.artistUrl)}`} className="track-link"
                                        onClick={(event) => event.stopPropagation()}>
                                        {track.artist}
                                    </Link>
                                </div>
                                {userID && (
                                    <p className="track-download" onClick={(event) => {
                                        event.stopPropagation();
                                        if (track.isFavorite) {
                                            handleDeleteFromFavorite2(track);
                                        } else {
                                            handleAddToFavorite2(track);
                                        }
                                    }}>
                                        {track.isFavorite === false ? <EmptyHeartIcon /> : <FullHeartIcon />}
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
                                {userID && (
                                    <div className="track-download" ref={node => { node = node; }} style={{ position: 'relative', display: 'block' }}>
                                        <div onClick={(event) => {
                                            toggleDropdown(index);
                                            setSelectedTrack(track);
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
                                                }}>Добавить в плейлист</div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </li>
                        ))}
                        <Dialog open={dialogOpen} onClose={toggleDialog}>
                            <DialogTitle>Add to Playlist</DialogTitle>
                            <DialogContent dividers style={{ display: 'flex', flexDirection: 'column' }}>
                                {playlists.map(playlist => (
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                onChange={(event) => handleCheckboxChange(event, playlist.playlistID)}
                                            />
                                        }
                                        label={playlist.playlistName}
                                    />

                                ))}
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => handleAddToPlaylist(selectedTrack, selectedPlaylists)} color="primary">
                                    Add
                                </Button>
                                <Button onClick={toggleDialog} color="primary">
                                    Cancel
                                </Button>
                            </DialogActions>
                        </Dialog>
                    </ul>
                    <Pagination currentPage={currentPage} totalPages={totalPages} handlePageClick={handlePageClick} pageNumbers={pageNumbers} />
                </div>
            )}
        </div>
    );
}
