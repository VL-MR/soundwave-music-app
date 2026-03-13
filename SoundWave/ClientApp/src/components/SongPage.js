import React, { useEffect, useState, useRef, useContext, useCallback, useLayoutEffect, memo, forwardRef } from 'react';
import $ from 'jquery';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { MusicContext } from './MusicContext';
import './NavMenu.css';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogContent';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { LazyLoadImage, trackWindowScroll } from 'react-lazy-load-image-component';
import ReactPlayer from 'react-player';
import axios from 'axios';
//import { Player, ControlBar, PlayToggle } from 'video-react';
//import 'video-react/dist/video-react.css';
//const ReactPlayerComponent = forwardRef((props, ref) => (
//    <ReactPlayer ref={ref} {...props} />
//));

//const MemoizedReactPlayer = memo(ReactPlayerComponent);
//const MemoizedReactPlayer = memo(forwardRef((props, ref) => (
//    <ReactPlayer ref={ref} {...props} />
//))); // не работает перемотка 
export function SongPage() {
    const [songTracks, setSongTracks] = useState([]);
    const [mainTrack, setMainTrack] = useState(null);
    const [artistTracks, setArtistTracks] = useState([]);
    const [similarTracks, setSimilarTracks] = useState([]);
    const [lyrics, setLyrics] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [selectedTrack, setSelectedTrack] = useState([]);
    const [playlists, setPlaylists] = useState([]);
    const [selectedPlaylists, setSelectedPlaylists] = useState([]);
    const [dbSongs, setDbSongs] = useState([]);
    const node = useRef();
    const { songUrl } = useParams();
    const { currentTrack, setCurrentTrack, musicTracks, setMusicTracks, videoRef, playing, setPlaying, currentTime } = useContext(MusicContext);
    const [inputArtist, setInputArtist] = useState({ url: "", name: "" });
    const [results, setResults] = useState([]);
    const suggestNode = useRef(null);
    const [newSong, setNewSong] = useState({
        title: '',
        artist: '',
        Duration: '',
        SongUrl: '',
        ArtistUrl: '',
        url: '',
        image: '',
        Lyric: '',
        Video: '',
        ArtistID: '',
    });
    const userID = localStorage.getItem('userID');
    useEffect(() => {
        fetchArtistTracks(songUrl);
    }, [songUrl]);
    useEffect(() => {
        const combinedTracks = mainTrack ? [mainTrack, ...artistTracks, ...similarTracks] : [...artistTracks, ...similarTracks];
        setSongTracks(combinedTracks);
    }, [mainTrack, artistTracks, similarTracks]);

    //useLayoutEffect(() => {
    //    if (videoRef.current) {
    //        if (playing) {
    //            videoRef.current.play();
    //        } else {
    //            videoRef.current.pause();
    //        }
    //    }
    //}, [playing]);

    //useLayoutEffect(() => {
    //    if (videoRef.current && videoRef.current.readyState >= 4) {
    //        const wasPlaying = !videoRef.current.paused;
    //        if (wasPlaying) {
    //            videoRef.current.pause();
    //        }
    //        console.log("setTime: " + currentTime);
    //        videoRef.current.currentTime = currentTime;
    //        if (wasPlaying) {
    //            videoRef.current.play();
    //        }
    //    }
    //}, [currentTime]);

    //useLayoutEffect(() => {
    //    if (videoRef.current && currentTime != 0) {
    //        videoRef.current.seek(currentTime);
    //        console.log("seek");
    //        console.log(videoRef.current);
    //    }
    //}, [currentTime]);

    const MemoizedReactPlayer = memo(forwardRef((props, ref) => (
        <ReactPlayer ref={ref} {...props} />
    )));

    const fetchDbSongs = async () => {
        try {
            const response = await axios.get('/song');
            if (response.status === 200) {
                return response.data;
            } else {
                console.error('Ошибка при получении данных из базы данных:', response.status);
                throw new Error('Не удалось получить данные из базы данных');
            }
        } catch (error) {
            console.error('Ошибка при выполнении запроса к базе данных:', error);
            throw error;
        }
    };

    const fetchSimilarSongs = async (artistUrl, favoriteTraсks) => {
        var xhr = new XMLHttpRequest();
        //console.log(artistUrl);
        if (artistUrl && artistUrl.includes("/")) {
            xhr.open("GET", `/api?Url=${artistUrl}&page=${1}`, true);
        }
        else {
            xhr.open("GET", "/api/top-today", true);
        }
        if (!artistUrl || artistUrl.includes("/")) {
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    var responseHTML = xhr.responseText;
                    var musicList = $(responseHTML).find(".item");
                    //var limit = 20;
                    //var count = 0;
                    var start = 50;
                    var end = 60;
                    if (artistUrl) {
                        start = 0;
                        end = 10;
                    }
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
                                    var dbTrack;
                                    if (songUrl) {
                                        dbTrack = dbTracks.find(track => track.songUrl === `https://zvon.top${songUrl}`);
                                        if (!dbTrack) {
                                            dbTrack = dbTracks.find(track => {
                                                let dbTitle = track.title.replace(/\(.*?\)/g, '').trim().toLowerCase();
                                                let compareTitle = musicTitle.replace(/\(.*?\)/g, '').trim().toLowerCase();

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
                                    else if (!dbTrack.isEdit && !dbTrack.isVisible && userID == 1) {
                                        return { title: musicTitle, url: musicUrl, songUrl: songUrl, image: musicImage, artist: musicArtist, artistUrl: musicArtistUrl, duration: musicDuration, dropdownOpen: false, isLyric: isLyric, lyric: "", isVisible: false, isFavorite: isFavorite };
                                    }
                                    else if (dbTrack.isEdit && dbTrack.isVisible) {
                                        return { title: dbTrack.title, url: dbTrack.url, songUrl: dbTrack.songUrl, image: dbTrack.image, artist: dbTrack.artist, artistUrl: dbTrack.artistUrl, duration: dbTrack.duration, dropdownOpen: false, isLyric: dbTrack.isLyric, isVideo: dbTrack.isVideo, lyric: dbTrack.lyric, video: dbTrack.video, isVisible: dbTrack.isVisible, isFavorite: isFavorite };
                                    }
                                    else if (dbTrack.isEdit && !dbTrack.isVisible && userID == 1) {
                                        return { title: dbTrack.title, url: dbTrack.url, songUrl: dbTrack.songUrl, image: dbTrack.image, artist: dbTrack.artist, artistUrl: dbTrack.artistUrl, duration: dbTrack.duration, dropdownOpen: false, isLyric: dbTrack.isLyric, isVideo: dbTrack.isVideo, lyric: dbTrack.lyric, video: dbTrack.video, isVisible: dbTrack.isVisible, isFavorite: isFavorite };
                                    }
                                }

                                return Promise.resolve(null);
                            });
                            return Promise.all(promises);
                        })
                        .then(tracks => {
                            tracks = tracks.filter(track => track !== null);
                            if (artistUrl) {
                                setArtistTracks(tracks);
                            }
                            else {
                                setSimilarTracks(tracks);
                            }
                        })
                        .catch(error => {
                            console.error(`Error fetching data: ${error}`);
                        });

                }
            };

            xhr.send();
        }
        else {
            var favoriteTracks = await fetchFavoriteTracks();
            var url = songUrl.replace("https://zvon.top/", "");
            axios.get(`/song`)
                .then(response => {
                    let count = 0;
                    const filteredTracks = response.data.filter(track => {
                        if (track.artistID == artistUrl && track.songID != url && count < 10) {
                            count++;
                            return true;
                        }
                        return false;
                    });
                    filteredTracks.forEach(track => {
                        let isFavorite = false;
                        if (favoriteTracks) {
                            var favoriteTrack = favoriteTracks.find(favTrack => {
                                let trackTitle = favTrack.title.replace(/\(.*?\)/g, '').trim().toLowerCase();
                                let compareTitle = track.title.replace(/\(.*?\)/g, '').trim().toLowerCase();

                                return favTrack.songUrl === track.songUrl || trackTitle === compareTitle;
                            });
                            if (favoriteTrack) {
                                isFavorite = true;
                            }
                        }
                        track.isFavorite = isFavorite;
                    });
                    setArtistTracks(filteredTracks);
                })
                .catch(error => {
                    console.error(`Error fetching data: ${error}`);
                });

        }
    };

    const fetchArtistTracks = async (songUrl) => {
        console.log(songUrl);
        if (songUrl.startsWith("/song")) {
            songUrl = `https://zvon.top${songUrl}`;
        }
        var url = songUrl.replace("https://zvon.top/", "");
        console.log(url);
        var favoriteTraсks = await fetchFavoriteTracks();
        if (url.includes("/")) {
            try {
                const dbsongs = await fetchDbSongs();
                //console.log('DB songs fetched:', dbsongs);

                const apiResponse = await fetch(`/api?Url=${songUrl}`);
                if (apiResponse.ok) {
                    const responseHTML = await apiResponse.text();

                    var mainTrackList = $(responseHTML).find(".songs.oneSong.songsListen.oneSongLyrics");
                    var mainTrack = parseTrack(mainTrackList, dbsongs, favoriteTraсks, true);
                    setMainTrack(mainTrack);

                    var artistTrackElements = $(responseHTML).find(".module-layout .unstyled.songs.mainSongs.songsListen.favoriteConf .item");
                    var artistTracks = [];
                    artistTrackElements.each(function () {
                        var track = parseTrack($(this), dbsongs, favoriteTraсks);
                        if (track) {
                            artistTracks.push(track);
                        }
                    });

                    artistTracks = artistTracks.filter(function (track) {
                        return track != null;
                    });
                    var similarTrackElements = $(responseHTML).find(".widget-tracks .mainSongs.unstyled.songs.songsListen.favoriteConf .item");
                    var similarTracks = [];
                    similarTrackElements.each(function () {
                        var track = parseTrack($(this), dbsongs, favoriteTraсks);
                        if (track) {
                            similarTracks.push(track);
                        }
                    });

                    similarTracks = similarTracks.filter(function (track) {
                        return track != null;
                    });
                    var lyricsText = $(responseHTML).find(".lyricsText pre").text().trim();
                    if (lyricsText && mainTrack.isEdit != true) {
                        setLyrics(lyricsText);
                    }
                    else {
                        if (mainTrack != undefined) {
                            setLyrics(mainTrack.lyric);
                        }
                    }
                    setArtistTracks(artistTracks);
                    setSimilarTracks(similarTracks);
                } else {
                    throw new Error('Network response was not ok.');
                }
            } catch (error) {
                console.error('Error fetching songs:', error);
            }
        }
        else {
            try {
                const response = await axios.get(`/song/${url}`);
                if (response.status === 200) {
                    var isFavorite = false;
                    if (favoriteTraсks) {
                        for (let i = 0; i < response.data.length; i++) {
                            var favoriteTrack = favoriteTraсks.find(track => {
                                let trackTitle = track.title.replace(/\(.*?\)/g, '').trim().toLowerCase();
                                console.log(trackTitle);
                                console.log(response.data[i].title);
                                let compareTitle = response.data[i].title.replace(/\(.*?\)/g, '').trim().toLowerCase();
                                return trackTitle === compareTitle;
                            });
                            if (favoriteTrack) {
                                isFavorite = true;
                                break;
                            }
                        }
                    }
                    console.log(response.data);
                    setMainTrack({ ...response.data, isFavorite: isFavorite });
                    if (response.data.lyric) {
                        setLyrics(response.data.lyric);
                    }
                    if (response.data.artistUrl) {
                        await fetchSimilarSongs(response.data.artistUrl, favoriteTraсks);
                    }
                    await fetchSimilarSongs(null, favoriteTraсks);

                } else {
                    console.error('Ошибка при получении данных из базы данных:', response.status);
                    throw new Error('Не удалось получить данные из базы данных');
                }
            } catch (error) {
                console.error('Ошибка при выполнении запроса к базе данных:', error);
                throw error;
            }
        }
    };

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

    const parseTrack = (trackElement, dbsongs, favoriteTraсks, isMainTrack = false) => {
        var musicTitle = trackElement.find(".track").text().trim();
        var musicUrl = trackElement.find(".play").data("url");
        var musicImage = trackElement.find(".playlistImg img").attr("src");
        var musicArtist = trackElement.find(".artist").text().trim();
        var musicArtistUrl = trackElement.find(".popupMenu_link__personalMusic").attr("href");
        var songUrl1 = trackElement.find(".artist").parent().attr("href");
        var musicDuration = trackElement.find(".duration").text().trim();
        var isLyric = trackElement.find(".lyricsIcon").length > 0;
        if (musicTitle && musicUrl && musicImage && musicArtist && musicArtistUrl && musicDuration) {
            var isFavorite = false;
            if (favoriteTraсks) {
                var favoriteTrack = favoriteTraсks.find(track => {
                    let trackTitle = track.title.replace(/\(.*?\)/g, '').trim().toLowerCase();
                    let compareTitle = musicTitle.replace(/\(.*?\)/g, '').trim().toLowerCase();
                    return trackTitle === compareTitle;
                });
                if (favoriteTrack) {
                    isFavorite = true;
                }
            }
            if (isMainTrack) {
                const dbTrack = dbsongs.find(track => track.songUrl === songUrl);
                if (dbTrack && dbTrack.isEdit) {
                    return {
                        id: dbTrack.songID,
                        title: dbTrack.title,
                        url: dbTrack.url,
                        songUrl: dbTrack.songUrl,
                        image: dbTrack.image,
                        artist: dbTrack.artist,
                        artistUrl: dbTrack.artistUrl,
                        duration: dbTrack.duration,
                        isLyric: dbTrack.isLyric,
                        isVideo: dbTrack.isVideo,
                        lyric: dbTrack.lyric,
                        video: dbTrack.video,
                        isFavorite: isFavorite,
                    };
                } else {
                    return {
                        title: musicTitle,
                        url: musicUrl,
                        songUrl: songUrl1,
                        image: musicImage,
                        artist: musicArtist,
                        artistUrl: musicArtistUrl,
                        duration: musicDuration,
                        isLyric: isLyric,
                        isVideo: false,
                        lyric: "",
                        video: "",
                        isFavorite: isFavorite,
                    };
                }
            } else {
                //console.log(dbsongs[5].url + "|" + musicUrl);
                //console.log(musicTitle);
                //console.log(Array.from(dbsongs[5].url));
                //console.log(Array.from(musicUrl));
                //if (dbsongs[5].url === musicUrl) {
                //    console.log("Yes!");
                //}
                //console.log(musicUrl);
                //console.log('Поиск трека в базе данных', musicUrl);
                //console.log('Доступные треки в базе данных', dbsongs.map(track => track.url));
                var dbTrack;
                if (songUrl1) {
                    var songurl = songUrl1.replace('https://zvon.top', '');
                    dbTrack = dbsongs.find(track => track.songUrl === songurl);
                }
                else {
                    dbTrack = dbsongs.find(track => track.title === musicTitle);
                }
                //console.log(dbTrack);
                if (!dbTrack || (!dbTrack.isEdit && dbTrack.isVisible)) {
                    return { title: musicTitle, url: musicUrl, songUrl: songUrl1, image: musicImage, artist: musicArtist, artistUrl: musicArtistUrl, duration: musicDuration, dropdownOpen: false, isLyric: isLyric, lyric: "", isVisible: true, isFavorite: isFavorite };
                }
                else if (!dbTrack.isEdit && !dbTrack.isVisible && userID == 1) {
                    return { title: musicTitle, url: musicUrl, songUrl: songUrl1, image: musicImage, artist: musicArtist, artistUrl: musicArtistUrl, duration: musicDuration, dropdownOpen: false, isLyric: isLyric, lyric: "", isVisible: false, isFavorite: isFavorite };
                }
                else if (dbTrack.isEdit && dbTrack.isVisible) {
                    return { title: dbTrack.title, url: dbTrack.url, songUrl: dbTrack.songUrl, image: dbTrack.image, artist: dbTrack.artist, artistUrl: dbTrack.artistUrl, duration: dbTrack.duration, dropdownOpen: false, isLyric: dbTrack.isLyric, isVideo: dbTrack.isVideo, lyric: dbTrack.lyric, video: dbTrack.video, isVisible: dbTrack.isVisible, isFavorite: isFavorite };
                }
                else if (dbTrack.isEdit && !dbTrack.isVisible && userID == 1) {
                    return { title: dbTrack.title, url: dbTrack.url, songUrl: dbTrack.songUrl, image: dbTrack.image, artist: dbTrack.artist, artistUrl: dbTrack.artistUrl, duration: dbTrack.duration, dropdownOpen: false, isLyric: dbTrack.isLyric, isVideo: dbTrack.isVideo, lyric: dbTrack.lyric, video: dbTrack.video, isVisible: dbTrack.isVisible, isFavorite: isFavorite };
                }
            }
        }
    };

    const handlePlayTrack = (track) => {
        setMusicTracks(songTracks);

        if (currentTrack === track) {
            setCurrentTrack(null);
            setPlaying(false);
        } else {
            if (currentTrack) {
                setCurrentTrack(null);
                setPlaying(false);
            }
            setCurrentTrack(track);
            setPlaying(true);
        }
    }

    const handleClick = (songUrl) => {
        window.history.pushState({}, '', `/song/${encodeURIComponent(songUrl)}`);
        window.dispatchEvent(new PopStateEvent('popstate'));
    }

    const toggleDropdown = (index) => {
        setSongTracks(prevTracks => prevTracks.map((track, i) => {
            if (i === index) {
                return { ...track, dropdownOpen: !track.dropdownOpen };
            }
            return track;
        }));
    };

    const toggleMainTrackDropdown = () => {
        setMainTrack(prevTrack => ({ ...prevTrack, dropdownOpen: !prevTrack.dropdownOpen }));
    };

    const toggleDialog = () => {
        setDialogOpen(prevState => !prevState);
    };

    const handleClickOutside = (event) => {
        if (node.current && !node.current.contains(event.target)) {
            setSongTracks(prevTracks => {
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
        console.log(playlistsId);
        console.log(track);
        if (track) {
            playlistsId.forEach(playlistId => {
                const newTrack = {
                    PlaylistID: playlistId,
                    title: track.title || "",
                    artist: track.artist || "",
                    Duration: track.duration || "",
                    SongUrl: track.songUrl || "0",
                    ArtistUrl: track.artistUrl || "",
                    url: track.url || "",
                    image: track.image || "",
                    isLyric: false,
                };
                axios.post('/playlistsong', newTrack)
                    .catch(error => {
                        console.error(`Error adding playlist: ${error}`);
                    });
            });
        }
        toggleDialog();
    };

    const getInfo = (inputValue, type) => {
        var xhr = new XMLHttpRequest();
        if (type === "tracks") {
            let str;
            str = inputValue.toLowerCase().replace(/\s+/g, '-');
            if (inputArtist.name !== "") {
                str = inputArtist.name + "-" + inputValue.toLowerCase().replace(/\s+/g, '-');
            }
            xhr.open("GET", `/api?Url=${"https://zvon.top/search/"}&q=${str}&selection=traks&page=${1}`, true);
            xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    var responseHTML = xhr.response;
                    var musicList = $(responseHTML);
                    var tracks = [];

                    axios.get('/artist')
                        .then(response => {
                            const dbArtists = response.data;

                            musicList.each(function () {
                                var musicTitle = $(this).find(".track").text().trim();
                                var musicUrl = $(this).find(".play").data("url");
                                var musicImage = $(this).find(".playlistImg img").attr("data-src");
                                var musicArtist = $(this).find(".artist").text().trim();
                                var musicArtistUrl = $(this).find(".popupMenu_link__personalMusic").attr("href");
                                var songUrl = $(this).find(".artist").parent().attr("href");
                                var musicDuration = $(this).find(".duration").text().trim();

                                if (musicTitle && musicUrl && musicImage && musicArtist && musicArtistUrl && musicDuration) {
                                    const dbArtist = dbArtists.find(artist => artist.artistName === musicArtist && artist.artistType === 'artists');

                                    if (!dbArtist || dbArtist.isVisible) {
                                        tracks.push({ name: musicTitle, url: musicUrl, image: musicImage, artist: musicArtist, artistUrl: musicArtistUrl, duration: musicDuration, songUrl: songUrl, type: "tracks", isVisible: true });
                                    }
                                    else if (!dbArtist.isVisible && userID == 1) {
                                        tracks.push({ name: musicTitle, url: musicUrl, image: musicImage, artist: musicArtist, artistUrl: musicArtistUrl, duration: musicDuration, songUrl: songUrl, type: "tracks", isVisible: false });
                                    }
                                }
                            });

                            tracks = tracks.slice(0, 10);
                            setResults(tracks);
                        })
                        .catch(error => {
                            console.error(`Error fetching data: ${error}`);
                        });

                    setResults(tracks);
                }
            };
        }
        else {
            xhr.open("GET", `/api?Url=${"https://zvon.top/search/"}&q=${inputValue.toLowerCase().replace(/\s+/g, '-')}&selection=artists&page=${1}`, true);
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    var responseHTML = xhr.responseText;
                    var artistList = $(responseHTML).find('ul[class="grid gridCovers ajaxSection_content  circles "] .cover_item');
                    axios.get('/artist')
                        .then(response => {
                            const dbArtists = response.data;
                            const promises = artistList.map(function () {
                                var artistName = $(this).find(".title").text().trim();
                                var artistImage = $(this).find(".cover_img").attr("data-src");
                                var artistUrl = $(this).find("a").attr("href");

                                if (artistName && artistImage && artistUrl) {
                                    const dbArtist = dbArtists.find(artist => artist.artistName === artistName && artist.artistType === 'artists');

                                    if (!dbArtist || dbArtist.isVisible) {
                                        return Promise.resolve({ name: artistName, image: artistImage, url: artistUrl, type: 'artists', isVisible: true });
                                    }
                                    else if (!dbArtist.isVisible && userID == 1) {
                                        return Promise.resolve({ name: artistName, image: artistImage, url: artistUrl, type: 'artists', isVisible: false });
                                    }
                                }

                                return Promise.resolve(null);
                            });

                            return Promise.all(promises);
                        })
                        .then(artists => {
                            artists = artists.filter(artist => artist !== null).slice(0, 10);
                            setResults(artists);
                        })
                        .catch(error => {
                            console.error(`Error fetching data: ${error}`);
                        });
                }
            }
        }
        xhr.send();
    }

    const handleInputChange = (type) => (e) => {
        if (type == "artists") {
            setInputArtist(e.target.value);
        }
        if (e.target.value && e.target.value.length > 1) {
            getInfo(e.target.value, type);
        }
    };

    const handleSearchClick = (result, event) => {
        setResults([]);
        if (result.type == "artists") {
            setInputArtist(result);
        }
    };

    const handleEditSong = () => {
        let isLyric = false
        let isVideo = false;
        if (newSong) {
            if (newSong.Lyric != null) {
                isLyric = true;
            }
            else {
                isLyric = false;
            }
            if (newSong.Video != null) {
                isVideo = true;
            }
            else {
                isVideo = false;
            }
            const newTrack = {
                title: newSong.title,
                artist: inputArtist.name,
                Duration: newSong.Duration,
                SongUrl: mainTrack.id || songUrl || "",
                ArtistUrl: inputArtist.url,
                url: newSong.url,
                image: newSong.image.name || newSong.image,
                Lyric: newSong.Lyric || "",
                Video: encodeURIComponent(newSong.Video.name) || "",
                ArtistID: 0,
                IsLyric: newSong.Lyric !== "" ? true : false,
                IsVideo: isVideo,
                IsVisible: newSong.isVisible || true,
                IsEdit: true,
                IsAdd: newSong.isAdd || false,
                IsNew: newSong.isNew || false,
            };
            console.log(newTrack);
            axios.get('/song')
                .then(response => {
                    var url = mainTrack.songUrl;
                    if (url != "") {
                        url = songUrl;
                    }
                    if (!url.includes("https://zvon.top/")) {
                        url = "https://zvon.top/" + url;
                    }
                    const existingTrack = response.data.find(track => track.songUrl === url);
                    console.log(existingTrack);
                    if (existingTrack) {
                        const newTrackWithID = {
                            ...newTrack,
                            SongID: existingTrack.songID
                        };
                        axios.put(`/song/${existingTrack.songID}`, newTrackWithID)
                            .then(() => {
                                fetchArtistTracks(songUrl);
                            })
                            .catch(error => {
                                console.error(`Error updating track: ${error}`);
                            });
                    } else {
                        axios.post('/song', newTrack)
                            .then(() => {
                                fetchArtistTracks(songUrl);
                            })
                            .catch(error => {
                                console.error(`Error adding track: ${error}`);
                            });
                    }
                })
                .catch(error => {
                    console.error(`Error getting tracks: ${error}`);
                });
            if (newSong.image !== mainTrack.image && newSong.image) {
                const formData = new FormData();
                formData.append('file', newSong.image);
                axios.post(`/file/${"Artists"}`, formData)
                    .catch(error => {
                        console.log(error);
                    });
            }

            if (newSong.Video !== mainTrack.video && newSong.Video) {
                let safeFileName = encodeURIComponent(newSong.Video.name);
                const formData = new FormData();
                formData.append('file', newSong.Video, safeFileName);
                axios.post(`/file/${"Artists"}`, formData)
                    .catch(error => {
                        console.log(error);
                    });
            }
        }
        setResults([]);
        setEditOpen(false);
    }

    const handleAddToFavorite = (track) => {
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
                    setArtistTracks(prevData => prevData.map(item =>
                        item.songUrl === track.songUrl ? { ...item, isFavorite: true } : item
                    ));
                })
                .catch(error => {
                    console.error(`Error adding artist to favorites: ${error}`);
                });
        }
    }

    const handleDeleteFromFavorite = (track) => {
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
                                setArtistTracks(prevData => prevData.map(item =>
                                    item.songUrl === track.songUrl ? { ...item, isFavorite: false } : item
                                ));
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
            {mainTrack && (
                <div>
                    <Dialog open={editOpen} onClose={() => { setEditOpen(false); setResults([]); }}>
                        <DialogTitle style={{ backgroundColor: '#141516', color: 'white' }}>Реадактирование трека</DialogTitle>
                        <DialogContent style={{ height: '500px', backgroundColor: '#141516' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingBottom: '50px', position: 'relative' }}>
                                {newSong.image && (
                                    <img
                                        src={!newSong.image.includes('/') ? `/file/${newSong.image}` : newSong.image}
                                        alt="preview"
                                        style={{ width: '200px', height: '200px', marginTop: '10px', borderRadius: '10px' }}
                                    />
                                )}
                                <label style={{ position: 'absolute', left: '102px', marginTop: '10px', width: '200px', height: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', opacity: '0', transition: 'opacity 0.3s' }} onMouseOver={e => e.currentTarget.style.opacity = '1'} onMouseOut={e => e.currentTarget.style.opacity = '0'}>
                                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', color: 'white', width: '100%', height: '100%', borderRadius: '10px' }}>
                                        <span style={{ fontSize: '50px' }}>+</span>
                                        <span>{newSong.image ? "Изменить изображение" : "Добавить изображение"}</span>
                                    </div>
                                    <input type="file" accept="image/*" onChange={e => setNewSong(prevState => ({ ...prevState, image: e.target.files[0] }))} style={{ display: 'none' }} />
                                </label>
                            </div>
                            <div className="search-bar" style={{ width: '300px', marginTop: '10px', marginLeft: '60px' }}>
                                <input style={{ paddingLeft: '15px', outline: 'none' }} type="text" placeholder="Название трека" value={newSong.title} onChange={e => setNewSong(prevState => ({ ...prevState, title: e.target.value }))} />
                            </div>
                            <div className="search-container">
                                <div className="search-bar" style={{ width: '300px', marginTop: '10px', marginLeft: '60px' }} >
                                    <input
                                        type="search"
                                        placeholder="Исполнитель"
                                        value={newSong.artist}
                                        onChange={handleInputChange("artists")}
                                        style={{ paddingLeft: '15px', outline: 'none' }}
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
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div className="search-bar" style={{ width: '300px', marginTop: '10px', marginLeft: '60px' }}>
                                    <input type="text" style={{ paddingLeft: '15px', outline: 'none' }} value={newSong.url} readOnly />
                                </div>
                                <div class="custom-file-upload">
                                    <input type="file" id="audio" accept="audio/*" onChange={e => setNewSong(prevState => ({ ...prevState, url: e.target.files[0] }))} />
                                    <label for="audio">...</label>
                                </div>
                            </div>
                            <div className="search-bar" style={{ width: '300px', marginTop: '10px', marginLeft: '60px' }}>
                                <input style={{ paddingLeft: '15px', outline: 'none' }} type="text" placeholder="Продолжительность" value={newSong.Duration} onChange={e => setNewSong(prevState => ({ ...prevState, Duration: e.target.value }))} />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div className="search-bar" style={{ width: '300px', marginTop: '10px', marginLeft: '60px' }}>
                                    <input type="text" style={{ paddingLeft: '15px', outline: 'none' }} value={newSong.Video} readOnly />
                                </div>
                                <div class="custom-file-upload">
                                    <input type="file" id="video" accept="video/*" onChange={e => setNewSong(prevState => ({ ...prevState, Video: e.target.files[0] }))} />
                                    <label for="video">...</label>
                                </div>
                            </div>
                            <div className="search-bar" style={{ width: '300px', marginTop: '10px', marginLeft: '60px' }}>
                                <textarea
                                    style={{ paddingLeft: '15px', outline: 'none', overflow: 'auto', width: '300px' }}
                                    placeholder="Текст песни"
                                    onChange={e => setNewSong(prevState => ({ ...prevState, Lyric: e.target.value }))}
                                />
                            </div>
                        </DialogContent>
                        <DialogActions style={{ backgroundColor: '#141516' }}>
                            <Button onClick={handleEditSong} color="primary">
                                Подтвердить
                            </Button>
                            <Button onClick={() => { setEditOpen(false); setResults([]); }} color="primary">
                                Отмена
                            </Button>
                        </DialogActions>
                    </Dialog>
                    {userID == 1 && (
                        <Button variant="outlined" color="primary" onClick={() => {
                            setEditOpen(true);
                            setNewSong(prevState => ({ ...prevState, title: mainTrack.title, artist: mainTrack.artist, url: mainTrack.url, Duration: mainTrack.duration, image: mainTrack.image, Lyric: mainTrack.lyric, Video: mainTrack.video }))
                            setInputArtist({ url: mainTrack.artistUrl, name: mainTrack.artist });
                        }}>
                            Изменить информацию о треке
                        </Button>
                    )}
                    <h2 style={{ color: 'white' }}>{mainTrack.artist} - {mainTrack.title}</h2>
                    <ul className="track-list">
                        <li className="track-item" onClick={() => handleClick(mainTrack.songUrl)}>
                            <button onClick={(event) => {
                                event.stopPropagation();
                                handlePlayTrack(mainTrack);
                            }} style={{ background: 'none', border: 'none' }}>
                                {currentTrack === mainTrack ?
                                    <svg xmlns="http://www.w3.org/2000/svg" width="3.2em" height="3.2em" viewBox="2 0 16 16">
                                        <path fillRule="evenodd" d="M6 5a.5.5 0 0 0-.5.5v5a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-5a.5.5 0 0 0-.5-.5H6zm4 0a.5.5 0 0 0-.5.5v5a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-5a.5.5 0 0 0-.5-.5h-1z" />
                                    </svg>
                                    :
                                    <svg xmlns="http://www.w3.org/2000/svg" width="2.5em" height="2.5em" viewBox="0 0 16 16">
                                        <path fillRule="evenodd" d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z" />
                                    </svg>
                                }
                            </button>
                            <img src={!mainTrack.image.includes('/') ? `/file/${mainTrack.image}` : mainTrack.image} alt={mainTrack.title} onError={(e) => { e.target.src = '/images/unknown_artist.jpg' }} />
                            <div>
                                <p>{mainTrack.title}</p>
                                <Link to={`/artist/${encodeURIComponent(mainTrack.artistUrl)}`} className="track-link"
                                    onClick={(event) => event.stopPropagation()}>
                                    {mainTrack.artist}
                                </Link>
                            </div>
                            {userID && (
                                <p className="track-download" onClick={(event) => {
                                    event.stopPropagation();
                                    if (mainTrack.isFavorite) {
                                        handleDeleteFromFavorite(mainTrack);
                                    } else {
                                        handleAddToFavorite(mainTrack);
                                    }
                                }}>
                                    {mainTrack.isFavorite === false ? <EmptyHeartIcon /> : <FullHeartIcon />}
                                </p>
                            )}
                            <p className="track-duration">{mainTrack.duration}</p>
                            <p className="track-download">
                                {mainTrack.isVideo && (
                                    <svg width="30" height="30" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z" stroke="darkviolet" transform="translate(2.5, 2.5)" />
                                        <rect x="0.5" y="0.5" width="19" height="19" rx="3.5" stroke="darkviolet" />
                                    </svg>
                                )}
                            </p>
                            <p className="track-download">
                                {mainTrack.isLyric && (
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
                            {/*<p className="track-download" onClick={(event) => { window.open(mainTrack.url, '_blank'); event.stopPropagation(); }}>*/}
                            <p
                                className="track-download"
                                onClick={(event) => {
                                    downloadTrack(mainTrack);
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
                                <div className="track-download" ref={node} style={{ position: 'relative', display: 'block' }}>
                                    <div onClick={(event) => {
                                        toggleMainTrackDropdown();
                                        setSelectedTrack(mainTrack);
                                        event.stopPropagation();
                                    }}>
                                        <svg className="download-icon" width="2em" height="2em" viewBox="2 0 16 16">
                                            <circle cx="8" cy="4" r="0.5" />
                                            <circle cx="8" cy="8" r="0.5" />
                                            <circle cx="8" cy="12" r="0.5" />
                                        </svg>
                                    </div>
                                    {mainTrack.dropdownOpen && (
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
                    </ul>
                    {/*https://www.youtube.com/embed/lukT_WB5IB0*/}
                    {mainTrack.video && (
                        <div>
                            <h2 style={{ color: 'white' }}>Видеоклип на трек</h2>
                            <div style={{ marginLeft: '250px', width: '720px', height: '540px', borderRadius: '10px', pointerEvents: 'none' }}>
                                {/*<Player*/}
                                {/*    ref={videoRef}*/}
                                {/*    src={`/file/${encodeURIComponent(mainTrack.video)}`}*/}
                                {/*    playsInline={true}*/}
                                {/*    playing={playing}*/}
                                {/*    controls={false}*/}
                                {/*    fluid={false}*/}
                                {/*    width={'100%'}*/}
                                {/*    height={'100%'}*/}
                                {/*>*/}
                                {/*</Player>*/}
                                <MemoizedReactPlayer
                                    ref={videoRef}
                                    url={`/file/${encodeURIComponent(mainTrack.video)}`}
                                    width='100%'
                                    height='100%'
                                    controls={false}
                                    playing={playing}
                                    playsinline={true}
                                    muted={true}
                                    pip={false}
                                    style={{ borderRadius: '10px', overflow: 'hidden' }}
                                    onReady={() => console.log('Video is ready to play')}
                                />
                                {/*<video ref={videoRef} width="320" height="240" muted preload="auto"*/}
                                {/*    onCanPlayThrough={() => console.log('Video is ready to play')}*/}
                                {/*    onSeeked={() => {*/}
                                {/*        if (videoRef.current.readyState < 4) {*/}
                                {/*            console.log("Video is not ready for currentTime: " + currentTime);*/}
                                {/*        } else {*/}
                                {/*            console.log("Video after seek: " + videoRef.current.currentTime);*/}
                                {/*        }*/}
                                {/*    }} >*/}
                                {/*    <source src={`/file/${encodeURIComponent(mainTrack.video)}`} type="video/mp4" />*/}
                                {/*    Your browser does not support the video tag.*/}
                                {/*</video>*/}
                            </div>
                        </div>
                    )}

                    {lyrics && (
                        <div className="lyricText">
                            <h2 style={{ color: 'white' }}>Текст песни: {mainTrack.title}</h2>
                            <pre>{lyrics}</pre>
                        </div>
                    )}

                </div>
            )}
            <Dialog open={dialogOpen} onClose={toggleDialog}>
                <DialogTitle style={{ backgroundColor: '#141516', color: 'white' }}>Добавить в плейлист</DialogTitle>
                <DialogContent dividers style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#141516', color: 'white' }}>
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
                <DialogActions style={{ backgroundColor: '#141516', color: 'white' }}>
                    <Button onClick={() => handleAddToPlaylist(selectedTrack, selectedPlaylists)} color="primary">
                        Add
                    </Button>
                    <Button onClick={toggleDialog} color="primary">
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
            {artistTracks.length > 0 && (
                <div>
                    <h2 style={{ color: 'white' }}>Другие треки артиста:</h2>
                    <ul className="track-list">
                        {artistTracks.map((track, index) => (
                            <li key={index} className="track-item"
                                style={{ filter: track.isVisible === false && userID == 1 ? 'grayscale(100%)' : 'none' }}
                                onClick={() => handleClick(track.songUrl)}>
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
                                <img src={!track.image.includes('/') ? `/file/${track.image}` : track.image} alt={track.title} onError={(e) => { e.target.src = '/images/unknown_artist.jpg' }} />
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
                                            handleDeleteFromFavorite(track);
                                        } else {
                                            handleAddToFavorite(track);
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
                                    <div className="track-download" ref={node} style={{ position: 'relative', display: 'block' }}>
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
                    </ul>
                </div>
            )}

            {similarTracks.length > 0 && (
                <div>
                    <h2 style={{ color: 'white' }}>Похожие треки:</h2>
                    <ul className="track-list">
                        {similarTracks.map((track, index) => (
                            <li key={index} className="track-item"
                                style={{ filter: track.isVisible === false && userID == 1 ? 'grayscale(100%)' : 'none' }}
                                onClick={() => handleClick(track.songUrl)}>
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
                                <img src={!track.image.includes('/') ? `/file/${track.image}` : track.image} alt={track.title} onError={(e) => { e.target.src = '/images/unknown_artist.jpg' }} />
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
                                            handleDeleteFromFavorite(track);
                                        } else {
                                            handleAddToFavorite(track);
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
                                    <div className="track-download" ref={node} style={{ position: 'relative', display: 'block' }}>
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
                    </ul>
                </div>
            )}
        </div>
    );
}
