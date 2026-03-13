import React, { useEffect, useState, useRef, useContext } from 'react';
import $ from 'jquery';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { MusicContext } from './MusicContext';
import './NavMenu.css';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { ColorExtractor } from 'react-color-extractor'
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogContent';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import axios from 'axios';
export function ArtistPage() {
    const [artistTracks, setArtistTracks] = useState([]);
    const { artistUrl } = useParams();
    const { currentTrack, setCurrentTrack, musicTracks, setMusicTracks } = useContext(MusicContext);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [artistImage, setArtistImage] = useState();
    const [artistName, setArtistName] = useState();
    const [correctUrl, setCorrectUrl] = useState();
    const [textColor, setTextColor] = useState('white');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [open, setOpen] = useState(false);
    const [open2, setOpen2] = useState(false);
    const [open3, setOpen3] = useState(false);
    const [selectedTrack, setSelectedTrack] = useState([]);
    const [playlists, setPlaylists] = useState([]);
    const [selectedPlaylists, setSelectedPlaylists] = useState([]);
    const [inputArtist, setInputArtist] = useState("");
    const [results, setResults] = useState([]);
    const [addTracks, setAddTracks] = useState([]);
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
    const node = useRef();
    const dropdownNode = useRef();
    const userID = localStorage.getItem('userID');
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16)
        ] : null;
    }

    const getColors = (colors) => {
        const color = hexToRgb(colors[0]);

        if (!color) {
            return;
        }

        const brightness = Math.round(((parseInt(color[0]) * 299) +
            (parseInt(color[1]) * 587) +
            (parseInt(color[2]) * 114)) / 1000);
        //console.log('getColors called with', brightness);

        const newTextColor = (brightness >= 100) ? 'black' : 'white';
        setTextColor(newTextColor);
    };

    useEffect(() => {
        CheckUrl(artistUrl);
    }, [artistUrl]);

    useEffect(() => {
        SearchImage(correctUrl);
    }, [correctUrl]);

    useEffect(() => {
        fetchArtistTracks(correctUrl, currentPage);
    }, [correctUrl, currentPage]);

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

    const fetchArtistTracks = async (artistUrl, page) => {
        //const serverPage = Math.ceil(page / 3.33);
        if (artistUrl != undefined && artistUrl.includes("/")) {
            var favoriteTraсks = await fetchFavoriteTracks();
            var xhr = new XMLHttpRequest();
            xhr.open("GET", `/api?Url=${artistUrl}&page=${page}`, true);
            xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    var responseHTML = xhr.responseText;
                    var musicList = $(responseHTML);
                    axios.get('/song')
                        .then(response => {
                            const dbTracks = response.data;
                            let Url = artistUrl;
                            let parts;
                            let artistIdFromUrl;
                            if (Url.includes("/")) {
                                parts = Url.split("/");
                                artistIdFromUrl = parseInt(parts[parts.length - 1], 10);
                            }
                            else {
                                artistIdFromUrl = Url;
                            }
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

                            let lastPage = xhr.getResponseHeader('Last-Page');
                            if (currentPage == lastPage && lastPage != 0) {
                                const dbTracks2 = dbTracks.filter(track => track.artistID === artistIdFromUrl && track.isAdd == true);
                                dbTracks2.forEach(dbTrack2 => {
                                    var isFavorite = false;
                                    if (favoriteTraсks) {
                                        var favoriteTrack = favoriteTraсks.find(track => {
                                            let trackTitle = track.title?.toString().replace(/\(.*?\)/g, '').trim().toLowerCase() || '';
                                            let compareTitle = musicTitle?.toString().replace(/\(.*?\)/g, '').trim().toLowerCase() || '';

                                            return track.songUrl === dbTrack2.songUrl || trackTitle === compareTitle;
                                        });
                                        if (favoriteTrack) {
                                            isFavorite = true;
                                        }
                                    }
                                    if (dbTrack2.isVisible) {
                                        promises.push(Promise.resolve({ id: dbTrack2.songID, title: dbTrack2.title, url: dbTrack2.url, songUrl: dbTrack2.songUrl, image: dbTrack2.image, artist: dbTrack2.artist, artistUrl: dbTrack2.artistUrl, duration: dbTrack2.duration, dropdownOpen: false, isVisible: dbTrack2.isVisible, isAdd: dbTrack2.isAdd, isLyric: dbTrack2.isLyric, isVideo: dbTrack2.isVideo, isFavorite: isFavorite, isNew: dbTrack2.isNew }));
                                    }
                                    else if (!dbTrack2.isVisible && userID == 1) {
                                        promises.push(Promise.resolve({ id: dbTrack2.songID, title: dbTrack2.title, url: dbTrack2.url, songUrl: dbTrack2.songUrl, image: dbTrack2.image, artist: dbTrack2.artist, artistUrl: dbTrack2.artistUrl, duration: dbTrack2.duration, dropdownOpen: false, isVisible: dbTrack2.isVisible, isAdd: dbTrack2.isAdd, isLyric: dbTrack2.isLyric, isVideo: dbTrack2.isVideo, isFavorite: isFavorite, isNew: dbTrack2.isNew }));
                                    }
                                });
                            }

                            return Promise.all(promises);
                        })
                        .then(tracks => {
                            tracks = tracks.filter(track => track !== null);
                            //console.log(tracks);
                            setArtistTracks(tracks);
                        })
                        .catch(error => {
                            console.error(`Error fetching data: ${error}`);
                        });

                    var lastPage = xhr.getResponseHeader('Last-Page');
                    if (lastPage) {
                        setTotalPages(Math.ceil(parseInt(lastPage, 10)));
                    }
                    //var startIndex = ((page - 1) % 3) * 30;
                    //var endIndex = startIndex + 30;
                    //if (tracks.length < endIndex) {
                    //    endIndex = tracks.length;
                    //}
                    //var itemsForApplicationPage = tracks.slice(startIndex, endIndex);
                    //setArtistTracks(itemsForApplicationPage);
                    //setArtistTracks(tracks);
                }
            };
            xhr.send();
        }
    };

    const SearchImage = (Url) => {
        if (Url != undefined && Url.includes("/")) {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", `/api?Url=${Url}`, true);
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    var responseHTML = $.parseHTML(xhr.responseText);
                    axios.get(`/artist`)
                        .then(response => {
                            const filtredArtist = response.data.filter(artist => artist.url == Url)[0];
                            if (filtredArtist) {
                                setArtistImage(filtredArtist.image);
                                setArtistName(filtredArtist.name);
                            }
                            else {
                                var metaTag = $(responseHTML).filter('meta[property="og:image"]');
                                var contentValue = metaTag.attr('content');
                                setArtistImage(contentValue);
                                var artistNameElement = $(responseHTML).find('.current_crumb');
                                var artistName = artistNameElement.text().trim();
                                setArtistName(artistName);
                            }
                        })
                        .catch(error => {
                            console.error(`Error fetching data: ${error}`);
                        })
                }
            };
            xhr.send();
        }
        else if (Url != undefined && !Url.includes("/")) {
            axios.get(`/artist`)
                .then(response => {
                    const filtredArtist = response.data.filter(artist => artist.artistID == Url)[0];
                    if (filtredArtist) {
                        setArtistImage(filtredArtist.image);
                        setArtistName(filtredArtist.name);
                    }
                })
                .catch(error => {
                    console.error(`Error fetching data: ${error}`);
                })
        }
    }

    const CheckUrl = async (Url) => {
        if (Url.includes("https://zvon.top/search")) {
            var str = Url;
            str = str.replace("https://zvon.top/search/", "");
            var xhr = new XMLHttpRequest();
            xhr.open("GET", `/api?Url=${"https://zvon.top/find"}&q=${str}`, true);
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    var responseHTML = xhr.responseText;
                    var artistList = $(responseHTML).find('ul[class="grid gridCovers ajaxSection_content  circles "] .cover_item');
                    var artistUrl;
                    //artistList.each(function () {
                    //    artistUrl = $(this).find("a").attr("href");
                    //});
                    var flag = false;
                    artistList.each(function () {
                        const artistName = $(this).find(".title").text().trim().toLowerCase();
                        const clean = str => str ? str.replace(/\s+/g, ' ').trim().toLowerCase() : '';
                        if (clean(artistName) === clean(str)) {
                            artistUrl = $(this).find("a").attr("href");
                            flag = true;
                            return false;
                        }
                    });
                    if (flag === false) {
                        artistList.each(function () {
                            artistUrl = $(this).find("a").attr("href");
                            return false;
                        });
                    }
                    if (artistUrl) {
                        setCorrectUrl(artistUrl);
                    }
                    else {
                        var trackList = $(responseHTML).find('ul[class="songs mainSongs ajaxSection_content"] .item');
                        trackList.each(function () {
                            artistUrl = $(this).find(".popupMenu_link__personalMusic").attr("href");
                            setCorrectUrl(artistUrl);
                            return false;
                        });
                    }
                }
            };
            xhr.send();
        }
        else if (Url.includes("/")) {
            setCorrectUrl(Url);
        }
        else {
            console.log(Url);
            var favoriteTracks = await fetchFavoriteTracks();
            axios.get(`/song`)
                .then(response => {
                    const filteredTracks = response.data.filter(track => track.artistUrl == Url);
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
                    setCorrectUrl(artistUrl);
                })
                .catch(error => {
                    console.error(`Error fetching data: ${error}`);
                });

        }
    }

    const handlePlayTrack = (track) => {
        setMusicTracks(artistTracks);

        if (currentTrack === track) {
            setCurrentTrack(null);
        } else {
            if (currentTrack) {
                setCurrentTrack(null);
            }
            setCurrentTrack(track);
        }
    }

    const handleClick = (songUrl) => {
        let fullUrl = songUrl.includes("https://zvon.top/") ? songUrl : "https://zvon.top/" + songUrl;
        window.history.pushState({}, '', `/song/${encodeURIComponent(fullUrl)}`);
        window.dispatchEvent(new PopStateEvent('popstate'));
    }

    const handlePageClick = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo(0, 0);
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

    const toggleDropdown = (index) => {
        setArtistTracks(prevTracks => prevTracks.map((track, i) => {
            if (i === index) {
                return { ...track, dropdownOpen: !track.dropdownOpen };
            }
            return track;
        }));
    };

    const toggleDialog = () => {
        setDialogOpen(prevState => !prevState);
    };

    const handleClickOutside = (event) => {
        if ((node.current && !node.current.contains(event.target)) && (dropdownNode.current && !dropdownNode.current.contains(event.target))) {
            setArtistTracks(prevTracks => {
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
                    isVideo: track.isVideo || false,
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
        else {
            setAddTracks(prevTracks => [...prevTracks, result]);
        }
    };

    const handleDeleteSearchTrackClick = (index, event) => {
        setAddTracks(prevTracks => prevTracks.filter((track, i) => i !== index));
    };

    const handleAddSong = () => {
        let isLyric = false
        let isVideo = false;
        let Url = artistUrl;
        let artistId;
        if (Url.includes("/")) {
            let parts = Url.split("/");
            artistId = parts[parts.length - 1];
            artistId = parseInt(artistId, 10);
        }
        if (addTracks.length == 0) {
            if (newSong) {
                if (newSong.Lyric != null && newSong.Lyric != "") {
                    isLyric = true;
                }
                else {
                    isLyric = false;
                }
                if (newSong.Video != null && newSong.Video != "") {
                    isVideo = true;
                }
                else {
                    isVideo = false;
                }
                console.log(newSong);
                var urlname = '';
                var videoname = '';
                if (newSong.url.name) {
                    urlname = newSong.url.name;
                    urlname = urlname.split('\\').pop();
                }
                if (newSong.Video) {
                    videoname = newSong.Video.name;
                }
                const newTrack = {
                    title: newSong.title || "",
                    artist: inputArtist.name || inputArtist || "",
                    Duration: newSong.Duration || "",
                    SongUrl: "0",
                    ArtistUrl: inputArtist.url || artistUrl || "",
                    url: urlname || "",
                    image: newSong.image.name || "",
                    Lyric: newSong.Lyric || "",
                    Video: encodeURIComponent(videoname) || "",
                    ArtistID: artistId,
                    isLyric: isLyric,
                    isVideo: isVideo,
                    isVisible: true,
                    isEdit: false,
                    isAdd: true,
                    isNew: true,
                };
                console.log(newTrack);
                axios.post('/song', newTrack)
                    .then(response => {
                        const songID = response.data.songID;
                        const updatedTrack = { ...newTrack, SongID: songID, SongUrl: String(songID) };
                        axios.put(`/song/${songID}`, updatedTrack)
                            .then(() => {
                                //fetchArtistTracks(artistUrl);
                                CheckUrl(artistUrl);
                            })
                            .catch(error => {
                                console.error(`Error updating SongUrl: ${error}`);
                            });
                    })
                    .catch(error => {
                        console.error(`Error adding playlist: ${error}`);
                    });
                if (newSong.image) {
                    const formData = new FormData();
                    formData.append('file', newSong.image);
                    axios.post(`/file/${"Artists"}`, formData)
                        .catch(error => {
                            console.log(error);
                        });
                }

                if (newSong.url) {
                    let safeFileName = newSong.url.name;
                    const formData = new FormData();
                    formData.append('file', newSong.url, safeFileName);
                    axios.post(`/file/${"Artists"}`, formData)
                        .catch(error => {
                            console.log(error);
                        });
                }


                if (newSong.Video) {
                    let safeFileName = encodeURIComponent(newSong.Video.name);
                    const formData = new FormData();
                    formData.append('file', newSong.Video, safeFileName);
                    axios.post(`/file/${"Artists"}`, formData)
                        .catch(error => {
                            console.log(error);
                        });
                }
            }
        }
        else {
            if (addTracks) {
                const newTracks = addTracks.map(track => ({
                    title: track.name,
                    artist: track.artist,
                    Duration: track.duration,
                    SongUrl: track.songUrl,
                    ArtistUrl: track.artistUrl,
                    url: track.url,
                    image: track.image,
                    Lyric: "",
                    Video: "",
                    ArtistID: artistId,
                    isLyric: false,
                    isVideo: false,
                    isVisible: track.isVisible || true,
                    isEdit: track.isEdit || false,
                    isAdd: track.isAdd || true,
                    isNew: track.isAdd || false,
                }));

                newTracks.forEach(track => {
                    axios.post('/song', track)
                        .then(response => {
                            if (currentPage == endPage) {
                                setArtistTracks(prevSongs => [...prevSongs, response.data]);
                            }
                        })
                        .catch(error => {
                            console.error(`Error adding playlist: ${error}`);
                        });
                });
            }
        }
        setResults([]);
        setAddTracks([]);
        setNewSong([]);
        setOpen(false);
        setOpen2(false);
    }

    const handleShowHide = (track) => {
        if (track.isVisible == true) {
            axios.get('/song')
                .then(response => {
                    const dbTracks = response.data;
                    const similarTracks = dbTracks.filter(dbTrack => dbTrack.url === track.url);

                    if (similarTracks.length > 0) {
                        Promise.all(similarTracks.map(similarTrack => {
                            return axios.put(`/song/${similarTrack.songID}`, { ...similarTrack, isVisible: false });
                        }))
                            .then(() => {
                                setArtistTracks(prevData => prevData.map(item =>
                                    item.url === track.url ? { ...item, isVisible: false } : item
                                ));
                                track.isVisible = false;
                            })
                            .catch(error => {
                                console.error("Ошибка при обновлении треков:", error);
                            });
                    }
                    else {
                        let Url = track.artistUrl;
                        let artistId;
                        if (Url.includes("/")) {
                            let parts = Url.split("/");
                            artistId = parts[parts.length - 1];
                            artistId = parseInt(artistId, 10);
                        }
                        const newTrack = {
                            title: track.title,
                            artist: track.artist,
                            Duration: track.duration,
                            SongUrl: track.songUrl || "0",
                            ArtistUrl: track.artistUrl || "0",
                            url: track.url,
                            image: track.image,
                            ArtistID: artistId,
                            Lyric: "",
                            Video: "",
                            isVisible: false,
                            isLyric: track.isLyric,
                            isVideo: false,
                            IsEdit: false,
                            IsAdd: false,
                            IsNew: false,
                        };
                        axios.post('/song', newTrack)
                            .then(response => {
                                setArtistTracks(prevData => prevData.map(item =>
                                    item.songID === response.data.songID ? { ...item, isVisible: !item.isVisible } : item
                                ));
                                track.isVisible = false;
                            })
                            .catch(error => {
                                console.error(`Error adding playlist: ${error}`);
                            })
                    }
                });
        } else {
            axios.get('/song')
                .then(response => {
                    const dbTracks = response.data;
                    const similarTracks = dbTracks.filter(dbTrack => dbTrack.url === track.url);
                    if (similarTracks.length > 0) {
                        Promise.all(similarTracks.map(similarTrack => {
                            if (similarTrack.isEdit == false && similarTrack.isAdd == false) {
                                return axios.delete(`/song/${similarTrack.songID}`);
                            } else {
                                return axios.put(`/song/${similarTrack.songID}`, { ...similarTrack, isVisible: true });
                            }
                        }))
                            .then(() => {
                                setArtistTracks(prevData => prevData.map(item =>
                                    item.url === track.url ? { ...item, isVisible: true } : item
                                ));
                                track.isVisible = true;
                            })
                            .catch(error => {
                                console.error("Ошибка при обновлении треков:", error);
                            });
                    }

                });
        }
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

    const handleDeleteTrack = () => {
        var id = selectedTrack.id;
        if (!id) {
            id = selectedTrack.songID;
        }
        axios.delete(`/song/${id}`)
            .then(() => {
                //setArtistTracks(prevSongs => prevSongs.filter(song => song.id !== id));
                CheckUrl(artistUrl);
            })
            .catch(error => {
                console.error(`Error deleting artist: ${error}`);
            });
        setOpen3(false);
    };

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

    return (
        <div>
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle style={{ backgroundColor: '#141516', color: 'white' }}>Добавление трека</DialogTitle>
                <DialogContent style={{ height: '500px', backgroundColor: '#141516' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingBottom: '50px', position: 'relative' }}>
                        <img
                            src={newSong.image ? URL.createObjectURL(newSong.image) : "/images/unknown_artist.jpg"}
                            alt="preview"
                            style={{ width: '200px', height: '200px', marginTop: '10px', borderRadius: '10px' }}
                        />
                        <label style={{ position: 'absolute', left: '112px', marginTop: '10px', width: '200px', height: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', opacity: '0', transition: 'opacity 0.3s' }} onMouseOver={e => e.currentTarget.style.opacity = '1'} onMouseOut={e => e.currentTarget.style.opacity = '0'}>
                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', color: 'white', width: '100%', height: '100%', borderRadius: '10px' }}>
                                <span style={{ fontSize: '50px' }}>+</span>
                                <span>{newSong.image ? "Изменить изображение" : "Добавить изображение"}</span>
                            </div>
                            <input type="file" accept="image/*" onChange={e => setNewSong(prevState => ({ ...prevState, image: e.target.files[0] }))} style={{ display: 'none' }} />
                        </label>
                    </div>
                    <div className="search-bar" style={{ width: '300px', marginLeft: '60px' }}>
                        <input style={{ paddingLeft: '15px', outline: 'none' }} type="text" placeholder="Название трека" onChange={e => setNewSong(prevState => ({ ...prevState, title: e.target.value }))} />
                    </div>
                    <div className="search-container">
                        <div className="search-bar" style={{ width: '300px', marginTop: '10px', marginLeft: '60px' }}>
                            <input
                                type="search"
                                placeholder="Исполнитель"
                                onChange={handleInputChange("artists")}
                                value={inputArtist.name}
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
                        <input style={{ paddingLeft: '15px', outline: 'none' }} type="text" placeholder="Продолжительность" onChange={e => setNewSong(prevState => ({ ...prevState, Duration: e.target.value }))} />
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
                    <Button onClick={handleAddSong} color="primary">
                        Добавить
                    </Button>
                    <Button onClick={() => { setOpen(false); setOpen2(true); setResults([]); setAddTracks([]); setNewSong([]); }} color="primary">
                        Добавить существующий трек
                    </Button>
                    <Button onClick={() => { setOpen(false); setResults([]); setAddTracks([]); setNewSong([]); }} color="primary">
                        Отмена
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={open2} onClose={() => setOpen2(false)}>
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
                                value={inputArtist.name}
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
                    <Button onClick={handleAddSong} color="primary">
                        Подтвердить
                    </Button>
                    <Button onClick={() => { setOpen(true); setOpen2(false); setResults([]); setAddTracks([]); }} color="primary">
                        Добавить новый трек
                    </Button>
                    <Button onClick={() => { setOpen2(false); setResults([]); setAddTracks([]); }} color="primary">
                        Отмена
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={open3} onClose={() => setOpen3(false)}>
                <DialogTitle style={{ backgroundColor: '#141516', color: 'white' }}>Удаление трека</DialogTitle>
                <DialogContent style={{ backgroundColor: '#141516' }}>
                    Вы уверены?
                </DialogContent>
                <DialogActions style={{ backgroundColor: '#141516' }}>
                    <Button onClick={handleDeleteTrack} color="primary">
                        Подтвердить
                    </Button>
                    <Button onClick={() => setOpen3(false)} color="primary">
                        Отмена
                    </Button>
                </DialogActions>
            </Dialog>
            {artistImage && (
                <div className="artistImage">
                    <ColorExtractor src={!artistImage.includes('/') ? `/file/${artistImage}` : `/api?Url=${artistImage}`} getColors={getColors} />
                    <div style={{
                        position: 'absolute',
                        width: '100%',
                        height: '200px',
                        backgroundImage: `url(${!artistImage.includes('/') ? `/file/${artistImage}` : `/api?Url=${artistImage}`})`,
                        filter: 'blur(10px)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        borderRadius: '10px',
                    }} />
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        position: 'relative',
                        left: '30px',
                        top: '15px',
                    }}>
                        <LazyLoadImage src={!artistImage.includes('/') ? `/file/${artistImage}` : `/api?Url=${artistImage}`} style={{ width: '150px', height: '150px', borderRadius: '10px' }} />
                        <div style={{ maxWidth: '80%' }}>
                            <p style={{
                                color: `${textColor} !important`,
                                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5) !important',
                                marginLeft: '20px',
                                marginTop: '0px',
                                fontSize: '30px'
                            }}>{artistName}</p>
                            <p style={{
                                color: `${textColor} !important`,
                                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5) !important',
                                marginLeft: '20px',
                                marginTop: '30px',
                                fontSize: '20px'
                            }}>Здесь вы можете слушать и скачивать все мелодии, вдохновенно созданные {artistName}. Это ваш персональный доступ к бесплатной коллекции музыки, которую можно наслаждаться без любых ограничений!</p>
                        </div>
                    </div>
                </div>
            )}
            <div>
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
                            <LazyLoadImage src={track.isAdd && !track.image.includes("/") ? `/file/${track.image}` : track.image} alt={track.title} />
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
                                <div className="track-download" ref={dropdownNode} style={{ position: 'relative', display: 'block' }}>
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
                                            {userID == 1 && (
                                                <div style={{ margin: '10px 0', padding: '0 10px' }} onClick={(event) => {
                                                    handleShowHide(track);
                                                    event.stopPropagation();
                                                }}>{track.isVisible === false ? "Показать" : "Скрыть"}</div>
                                            )}

                                            {(userID == 1 && track.isNew) && (
                                                <div style={{ margin: '10px 0', padding: '0 10px' }} onClick={(event) => {
                                                    setSelectedTrack(track);
                                                    setOpen3(true);
                                                    event.stopPropagation();
                                                }}>{"Удалить трек"}</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </li>
                    ))}
                    {userID == 1 && currentPage == endPage && (
                        <li className="track-item" onClick={() => setOpen2(true)}>
                            <Button color="primary" style={{ width: '100%' }}>
                                + Добавить трек
                            </Button>
                        </li>
                    )}
                    <Dialog open={dialogOpen} onClose={toggleDialog}>
                        <DialogTitle>Add to Playlist</DialogTitle>
                        <DialogContent dividers style={{ display: 'flex', flexDirection: 'column' }}>
                            {playlists.slice(1).length > 0 ? playlists.slice(1).map((playlist, index) => (
                                <FormControlLabel
                                    key={index}
                                    control={
                                        <Checkbox
                                            onChange={(event) => handleCheckboxChange(event, playlist.playlistID)}
                                        />
                                    }
                                    label={playlist.playlistName}
                                />
                            )) : <p>Плейлисты отсутствуют</p>}

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
            </div>
        </div>
    );
}
