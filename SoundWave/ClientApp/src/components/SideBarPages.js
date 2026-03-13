import React, { useEffect, useState, useContext, useRef } from 'react';
import $ from 'jquery';
import { useParams } from 'react-router-dom';
import { Link, useLocation } from 'react-router-dom';
import { MusicContext } from './MusicContext';
import './NavMenu.css';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import axios from 'axios';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogContent';
import { ColorExtractor } from 'react-color-extractor'

export function SideBarPages() {
    const [searchData, setSearchData] = useState({ artists: [], albums: [], collections: [], genres: [], radio: [] });
    const { Url } = useParams();
    const { currentTrack, setCurrentTrack, musicTracks, setMusicTracks } = useContext(MusicContext);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const location = useLocation();
    const path = decodeURIComponent(location.pathname);
    const userID = localStorage.getItem('userID');
    const [open, setOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [addType, setAddType] = useState("");
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [newPlaylistImage, setNewPlaylistImage] = useState('');
    const [newPlaylistUrl, setNewPlaylistUrl] = useState('');
    const [selectedArtist, setSelectedArtist] = useState('');
    const [colors, setColors] = useState({});
    useEffect(() => {
        fetchSearchData(Url, currentPage);
    }, [Url, currentPage]);

    const fetchSearchData = (Url, page) => {
        //const serverPage = Math.ceil(page * 60 / 96);
        //const serverPage = Math.ceil(page / 1.67);
        //const serverPage = Math.ceil(page / 3.33);

        var xhr = new XMLHttpRequest();
        xhr.open("GET", `/api?Url=${Url}&page=${page}`, true);
        xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var responseHTML = xhr.responseText;
                var genres = [];
                var artistList = $(responseHTML);
                var albumsList = $(responseHTML);
                var collectionsList = $(responseHTML);
                var genresList = $(responseHTML).find('ul[class=" gridGenres "] .widget_itemLink');
                var radioList = $(responseHTML);
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
                            var artistImage = $(this).find(".cover_img").attr("src");
                            var artistUrl = $(this).find("a").attr("href");

                            if (artistName && artistImage && artistUrl) {
                                var isFavorite = false;
                                if (favoriteArtists) {
                                    var favoriteArtist = favoriteArtists.find(artist => decodeURIComponent(artist.favoriteArtistUrl) === artistUrl && artist.favoriteArtistType === 'artists');
                                    if (favoriteArtist) {
                                        isFavorite = true;
                                    }
                                }
                                const dbArtist = dbArtists.find(artist => artist.realName === artistName && artist.type === 'artists');
                                if (dbArtist && dbArtist.isEdit == true) {
                                    return Promise.resolve({ id: dbArtist.artistID, name: dbArtist.name, realName: dbArtist.realName, image: dbArtist.image, url: dbArtist.url, type: dbArtist.type, isVisible: dbArtist.isVisible, isAdd: dbArtist.isAdd, isFavorite: isFavorite });
                                } else if (!dbArtist || (dbArtist.isVisible && !dbArtist.isAdd)) {
                                    return Promise.resolve({ name: artistName, realName: artistName, image: artistImage, url: artistUrl, type: 'artists', isVisible: true, isAdd: false, isFavorite: isFavorite });
                                } else if (!dbArtist.isVisible && userID == 1 && !dbArtist.isAdd) {
                                    return Promise.resolve({ name: artistName, realName: artistName, image: artistImage, url: artistUrl, type: 'artists', isVisible: false, isAdd: false, isFavorite: isFavorite });
                                }
                            }

                            return Promise.resolve(null);
                        });

                        if (currentPage === totalPages && totalPages != 0) {
                            const dbArtists2 = dbArtists.filter(artist => artist.type === 'artists' && artist.isAdd == true);
                            dbArtists2.forEach(dbArtist2 => {
                                var isFavorite = false;
                                if (favoriteArtists) {
                                    var favoriteArtist = favoriteArtists.find(artist => decodeURIComponent(artist.favoriteArtistUrl) === dbArtist2.url && artist.favoriteArtistType === 'artists');
                                    if (favoriteArtist) {
                                        isFavorite = true;
                                    }
                                }
                                if (dbArtist2 != null) {
                                    if (dbArtist2.isVisible) {
                                        promises.push(Promise.resolve({ id: dbArtist2.artistID, name: dbArtist2.name, image: dbArtist2.image, url: dbArtist2.artistID, type: dbArtist2.type, isVisible: dbArtist2.isVisible, isAdd: dbArtist2.isAdd, isFavorite: isFavorite }));
                                    }
                                    else if (!dbArtist2.isVisible && userID == 1) {
                                        promises.push(Promise.resolve({ id: dbArtist2.artistID, name: dbArtist2.name, image: dbArtist2.image, url: dbArtist2.artistID, type: dbArtist2.type, isVisible: dbArtist2.isVisible, isAdd: dbArtist2.isAdd, isFavorite: isFavorite }));
                                    }
                                }
                            });
                        }

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
                            var albumImage = $(this).find(".cover_img").attr("src");
                            var albumUrl = $(this).find("a").attr("href");

                            if (albumName && albumImage && albumUrl) {
                                var isFavorite = false;
                                if (favoriteArtists) {
                                    var favoriteArtist = favoriteArtists.find(artist => decodeURIComponent(artist.favoriteArtistUrl) === albumUrl && artist.favoriteArtistType === 'albums');
                                    if (favoriteArtist) {
                                        isFavorite = true;
                                    }
                                }
                                const dbAlbum = dbAlbums.find(album => album.name === albumName && album.type === 'albums');
                                var realname = albumName;
                                if (!dbAlbum || (dbAlbum.isVisible && !dbAlbum.isAdd)) {
                                    if (dbAlbum && dbAlbum.isEdit == true) {
                                        realname = dbAlbum.realName;
                                    }
                                    return Promise.resolve({ name: albumName, realname: realname, image: albumImage, url: albumUrl, type: 'albums', isVisible: true, isFavorite: isFavorite });
                                }
                                else if (!dbAlbum.isVisible && userID == 1 && !dbAlbum.isAdd) {
                                    if (dbAlbum.isEdit == true) {
                                        realname = dbAlbum.realName;
                                    }
                                    return Promise.resolve({ name: albumName, realname: realname, image: albumImage, url: albumUrl, type: 'albums', isVisible: false, isFavorite: isFavorite });
                                }
                            }

                            return Promise.resolve(null);
                        });
                        if (currentPage === totalPages && totalPages != 0) {
                            const dbAlbums2 = dbAlbums.filter(album => album.type === 'albums' && album.isAdd == true);
                            dbAlbums2.forEach(dbAlbum2 => {
                                var isFavorite = false;
                                if (favoriteArtists) {
                                    var favoriteArtist = favoriteArtists.find(artist => decodeURIComponent(artist.favoriteArtistUrl) === dbAlbum2.url && artist.favoriteArtistType === 'albums');
                                    if (favoriteArtist) {
                                        isFavorite = true;
                                    }
                                }
                                if (dbAlbum2.isVisible) {
                                    promises.push(Promise.resolve({ id: dbAlbum2.artistID, name: dbAlbum2.name, image: dbAlbum2.image, url: dbAlbum2.artistID, type: dbAlbum2.type, isVisible: dbAlbum2.isVisible, isAdd: dbAlbum2.isAdd, isFavorite: isFavorite }));
                                }
                                else if (!dbAlbum2.isVisible && userID == 1) {
                                    promises.push(Promise.resolve({ id: dbAlbum2.artistID, name: dbAlbum2.name, image: dbAlbum2.image, url: dbAlbum2.artistID, type: dbAlbum2.type, isVisible: dbAlbum2.isVisible, isAdd: dbAlbum2.isAdd, isFavorite: isFavorite }));
                                }
                            });
                        }
                        return Promise.all(promises);
                    })
                    .then(albums => {
                        albums = albums.filter(album => album !== null);

                        setSearchData(prevData => ({ ...prevData, albums: albums }));
                    })
                    .catch(error => {
                        console.error(`Error fetching data: ${error}`);
                    });

                axios.get('/artist')
                    .then(response => {
                        const dbCollections = response.data;

                        const promises = collectionsList.map(function () {
                            var collectionName = $(this).find(".title").text().trim();
                            var collectionImage = $(this).find(".cover_img").attr("src");
                            var collectionUrl = $(this).find("a").attr("href");

                            if (collectionName && collectionImage && collectionUrl) {
                                var isFavorite = false;
                                if (favoriteArtists) {
                                    var favoriteArtist = favoriteArtists.find(artist => decodeURIComponent(artist.favoriteArtistUrl) === collectionUrl && artist.favoriteArtistType === 'collections');
                                    if (favoriteArtist) {
                                        isFavorite = true;
                                    }
                                }
                                const dbCollection = dbCollections.find(collection => collection.name === collectionName && collection.type === 'collections');
                                var realname = collectionName;
                                if (!dbCollection || (dbCollection.isVisible && !dbCollection.isAdd)) {
                                    if (dbCollection && dbCollection.isEdit == true) {
                                        realname = dbCollection.realName;
                                    }
                                    return Promise.resolve({ name: collectionName, realName: realname, image: collectionImage, url: collectionUrl, type: 'collections', isVisible: true, isFavorite: isFavorite });
                                }
                                else if (!dbCollection.isVisible && userID == 1 && !dbCollection.isAdd) {
                                    if (dbCollection.isEdit == true) {
                                        realname = dbCollection.realName;
                                    }
                                    return Promise.resolve({ name: collectionName, realName: realname, image: collectionImage, url: collectionUrl, type: 'collections', isVisible: false, isFavorite: isFavorite });
                                }
                            }

                            return Promise.resolve(null);
                        });
                        if (currentPage === totalPages && totalPages != 0) {
                            const dbCollections2 = dbCollections.filter(collection => collection.type === 'collections' && collection.isAdd == true);
                            dbCollections2.forEach(dbCollection2 => {
                                var isFavorite = false;
                                if (favoriteArtists) {
                                    var favoriteArtist = favoriteArtists.find(artist => decodeURIComponent(artist.favoriteArtistUrl) === dbCollection2.url && artist.favoriteArtistType === 'collections');
                                    if (favoriteArtist) {
                                        isFavorite = true;
                                    }
                                }
                                if (dbCollection2.isVisible) {
                                    promises.push(Promise.resolve({ id: dbCollection2.artistID, name: dbCollection2.name, image: dbCollection2.image, url: dbCollection2.artistID, type: dbCollection2.type, isVisible: dbCollection2.isVisible, isAdd: dbCollection2.isAdd, isFavorite: isFavorite }));
                                }
                                else if (!dbCollection2.isVisible && userID == 1) {
                                    promises.push(Promise.resolve({ id: dbCollection2.artistID, name: dbCollection2.name, image: dbCollection2.image, url: dbCollection2.artistID, type: dbCollection2.type, isVisible: dbCollection2.isVisible, isAdd: dbCollection2.isAdd, isFavorite: isFavorite }));
                                }
                            });
                        }
                        return Promise.all(promises);
                    })
                    .then(collections => {
                        collections = collections.filter(collection => collection !== null);

                        setSearchData(prevData => ({ ...prevData, collections: collections }));
                    })
                    .catch(error => {
                        console.error(`Error fetching data: ${error}`);
                    });

                genresList.each(function () {
                    var genrName = $(this).find("a").text().trim();
                    var genrUrl = $(this).find("a").attr("href");
                    if (genrName && genrUrl) {
                        genres.push({ name: genrName, url: genrUrl });
                    }
                });
                setSearchData(prevData => ({ ...prevData, genres: genres }));

                axios.get('/artist')
                    .then(response => {
                        const dbRadios = response.data;

                        const promises = radioList.map(function () {
                            var radioName = $(this).find(".title").text().trim();
                            var radioImage = $(this).find(".cover_img img").attr("src");
                            var radioUrl = $(this).attr("data-href");
                            if (radioName && radioImage && radioUrl) {
                                var isFavorite = false;
                                if (favoriteArtists) {
                                    var favoriteArtist = favoriteArtists.find(artist => decodeURIComponent(artist.favoriteArtistUrl) === radioUrl && artist.favoriteArtistType === 'radio');
                                    if (favoriteArtist) {
                                        isFavorite = true;
                                    }
                                }
                                const dbRadio = dbRadios.find(radio => radio.name === radioName && radio.type === 'radio');
                                var realname = radioName;
                                if (!dbRadio || (dbRadio.isVisible && !dbRadio.isAdd)) {
                                    if (dbRadio && dbRadio.isEdit == true) {
                                        realname = dbRadio.realName;
                                    }
                                    return Promise.resolve({ name: radioName, realName: realname, image: radioImage, url: radioUrl, type: 'radio', isVisible: true, isAdd: false, isFavorite: isFavorite });
                                }
                                else if (!dbRadio.isVisible && userID == 1 && !dbRadio.isAdd) {
                                    if (dbRadio.isEdit == true) {
                                        realname = dbRadio.realName;
                                    }
                                    return Promise.resolve({ name: radioName, realName: realname, image: radioImage, url: radioUrl, type: 'radio', isVisible: false, isAdd: false, isFavorite: isFavorite });
                                }
                            }

                            return Promise.resolve(null);
                        });
                        if (currentPage === totalPages && totalPages != 0) {
                            const dbRadios2 = dbRadios.filter(radio => radio.type === 'radio' && radio.isAdd == true);
                            dbRadios2.forEach(dbRadio2 => {
                                var isFavorite = false;
                                if (favoriteArtists) {
                                    var favoriteArtist = favoriteArtists.find(artist => decodeURIComponent(artist.favoriteArtistUrl) === dbRadio2.url && artist.favoriteArtistType === 'radio');
                                    if (favoriteArtist) {
                                        isFavorite = true;
                                    }
                                }
                                if (dbRadio2.isVisible) {
                                    promises.push(Promise.resolve({ id: dbRadio2.artistID, name: dbRadio2.name, image: dbRadio2.image, url: dbRadio2.artistID, type: dbRadio2.type, isVisible: dbRadio2.isVisible, isAdd: dbRadio2.isAdd, isFavorite: isFavorite }));
                                }
                                else if (!dbRadio2.isVisible && userID == 1) {
                                    promises.push(Promise.resolve({ id: dbRadio2.artistID, name: dbRadio2.name, image: dbRadio2.image, url: dbRadio2.artistID, type: dbRadio2.type, isVisible: dbRadio2.isVisible, isAdd: dbRadio2.isAdd, isFavorite: isFavorite }));
                                }
                            });
                        }

                        return Promise.all(promises);
                    })
                    .then(radio => {
                        radio = radio.filter(radio => radio !== null);
                        setSearchData(prevData => ({ ...prevData, radio: radio }));
                    })
                    .catch(error => {
                        console.error(`Error fetching data: ${error}`);
                    });

                var lastPage = xhr.getResponseHeader('Last-Page');
                if (lastPage) {
                    setTotalPages(Math.ceil(parseInt(lastPage, 10)));// * 96 / 60));
                }
                //var startIndex = (page - 1) * 60;
                //var endIndex = startIndex + 60;
                //if (temp.length < endIndex) {
                //    endIndex = temp.length;
                //}
                //var itemsForApplicationPage = temp.slice(startIndex, endIndex);
            }
        };

        xhr.send();
    };

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
        if (artist.isVisible == true) {
            axios.get('/artist')
                .then(response => {
                    const dbArtists = response.data;
                    const foundArtist = dbArtists.find(dbArtist => dbArtist.type === artist.type && dbArtist.url === artist.url);
                    if (foundArtist) {
                        axios.put(`/artist/${foundArtist.artistID}`, { ...foundArtist, isVisible: false })
                            .then(() => {
                                setSearchData(prevData => ({
                                    ...prevData,
                                    [artist.type]: prevData[artist.type].map(item =>
                                        item.artistID === foundArtist.artistID ? { ...item, isVisible: !item.isVisible } : item
                                    )
                                }));
                                artist.isVisible = false;
                            })
                    } else {
                        const newArtist = {
                            name: artist.name,
                            realName: artist.name,
                            type: artist.type,
                            url: artist.url,
                            image: artist.image,
                            isVisible: false,
                            IsEdit: false,
                            IsAdd: false,
                        };
                        axios.post('/artist', newArtist)
                            .then(response => {
                                console.log(newArtist);
                                setSearchData(prevData => ({
                                    ...prevData,
                                    [artist.type]: prevData[artist.type].map(item =>
                                        item.artistID === response.data.artistID ? { ...item, isVisible: !item.isVisible } : item
                                    )
                                }));
                                artist.isVisible = false;
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
                    const foundArtist = dbArtists.find(dbArtist => dbArtist.type === artist.type && dbArtist.url === artist.url);

                    if (foundArtist) {
                        if (foundArtist.isEdit == false && foundArtist.isAdd == false && foundArtist.isNew == false) {
                            console.log(foundArtist);
                            axios.delete(`/artist/${foundArtist.artistID}`)
                                .then(() => {
                                    setSearchData(prevData => ({
                                        ...prevData,
                                        [artist.type]: prevData[artist.type].map(item =>
                                            item.artistID === foundArtist.artistID ? { ...item, isVisible: !item.isVisible } : item
                                        )
                                    }));
                                    artist.isVisible = true;
                                })
                        }
                        else {
                            axios.put(`/artist/${foundArtist.artistID}`, { ...foundArtist, isVisible: true })
                                .then(() => {
                                    setSearchData(prevData => ({
                                        ...prevData,
                                        [artist.type]: prevData[artist.type].map(item =>
                                            item.artistID === foundArtist.artistID ? { ...item, isVisible: !item.isVisible } : item
                                        )
                                    }));
                                    artist.isVisible = true;
                                })
                        }
                    }
                });
        }
    }

    const handlePageClick = async (pageNumber) => {
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

    const handleAddArtist = () => {
        let url = newPlaylistName;
        if (addType == "radio") {
            url = newPlaylistUrl;
        }
        const playlist = {
            name: newPlaylistName,
            realName: newPlaylistName,
            type: addType,
            url: url,
            image: newPlaylistImage.name,
            IsVisible: true,
            IsEdit: false,
            IsAdd: true,
        };
        console.log(playlist);
        axios.post('/artist', playlist)
            .then(response => {
                if (currentPage == endPage) {
                    //setSearchData(prevData => ({
                    //    ...prevData,
                    //    artists: [...prevData.artists, response.data]
                    //}));
                    fetchSearchData(Url, currentPage);
                }
            })
            .catch(error => {
                console.error(`Error adding playlist: ${error}`);
            })
        const formData = new FormData();
        formData.append('file', newPlaylistImage);
        if (newPlaylistImage) {
            axios.post(`/file/${"Artists"}`, formData)
                .catch(error => {
                    console.log(error);
                });
        }
        setOpen(false);
        setNewPlaylistName('');
        setNewPlaylistImage(null);
    }

    const handleEditArtist = () => {
        if (selectedArtist.id) {
            axios.get(`/artist/${selectedArtist.id}`)
                .then(response => {
                    let artist = response.data;
                    if (newPlaylistName) {
                        artist.name = newPlaylistName;
                    }
                    if (newPlaylistImage && newPlaylistImage.name) {
                        artist.image = newPlaylistImage.name;
                    } else if (newPlaylistImage) {
                        artist.image = selectedArtist.image;
                    }

                    axios.put(`/artist/${selectedArtist.id}`, artist)
                        .then(() => {
                            const updatedArtist = { ...artist, id: selectedArtist.id };
                            //setSearchData(prevData => ({
                            //    ...prevData,
                            //    artists: prevData.artists.map(a => a.url === selectedArtist.url ? updatedArtist : a)
                            //}));
                            fetchSearchData(Url, currentPage);
                        })
                        .catch(error => {
                            console.error(`Error updating artist: ${error}`);
                        });

                    if (newPlaylistImage) {
                        const formData = new FormData();
                        formData.append('file', newPlaylistImage);
                        axios.post(`/file/${"Artists"}`, formData)
                            .catch(error => {
                                console.log(error);
                            });
                    }
                })
                .catch(error => {
                    console.error(`Error getting artist: ${error}`);
                });
        } else {
            const playlist = {
                name: newPlaylistName ? newPlaylistName : selectedArtist.name,
                realName: selectedArtist.name,
                type: selectedArtist.type,
                url: selectedArtist.url,
                image: newPlaylistImage && newPlaylistImage.name ? newPlaylistImage.name : selectedArtist.image,
                IsVisible: selectedArtist.isVisible || true,
                IsEdit: true,
                IsAdd: false,
            };
            axios.post('/artist', playlist)
                .then(response => {
                    const newArtist = { ...response.data, id: response.data.artistID };
                    //setSearchData(prevData => ({
                    //    ...prevData,
                    //    artists: prevData.artists.map(a => a.url === selectedArtist.url ? newArtist : a)
                    //}));
                    fetchSearchData(Url, currentPage);
                })
                .catch(error => {
                    console.error(`Error adding artist: ${error}`);
                })
            const formData = new FormData();
            formData.append('file', newPlaylistImage);
            if (newPlaylistImage) {
                axios.post(`/file/${"Artists"}`, formData)
                    .catch(error => {
                        console.log(error);
                    });
            }
        }

        setEditOpen(false);
    }

    const handleDeleteArtist = () => {
        axios.get(`/song`)
            .then(response => {
                const songsToDelete = response.data
                    .filter(song => song.artistId === selectedArtist.id && !song.IsNew);

                const deletePromises = songsToDelete.map(song => {
                    return axios.delete(`/song/${song.songID}`);
                });

                Promise.all(deletePromises)
                    .then(() => {
                        axios.delete(`/artist/${selectedArtist.id}`)
                            .then(() => {
                                setSearchData(prevData => ({
                                    ...prevData,
                                    artists: prevData.artists.filter(artist => artist.id !== selectedArtist.id)
                                }));
                            })
                            .catch(error => {
                                console.error(`Error deleting artist: ${error}`);
                            });
                    })
                    .catch(error => {
                        console.error(`Error deleting songs: ${error}`);
                    });
            })
            .catch(error => {
                console.error(`Error retrieving songs: ${error}`);
            });
        setDeleteOpen(false);
    };

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

    const handleClick = (genrUrl) => {
        window.history.pushState({}, '', `/artist/${encodeURIComponent("https://zvon.top/" + genrUrl)}`);
        window.dispatchEvent(new PopStateEvent('popstate'));
    }

    const handleMouseEnter = (index) => {
        const img = document.querySelectorAll('.artist-tile')[index]?.querySelector('img');
        if (!img) return;

        if (!colors[index]) {
            const color = getDominantColor(img);
            setColors(prev => ({ ...prev, [index]: color }));
            img.style.boxShadow = `0 0 30px ${color}`;
        } else {
            img.style.boxShadow = `0 0 30px ${colors[index]}`;
        }
    };

    const handleMouseLeave = (index) => {
        const artistTiles = document.querySelectorAll('.artist-tile');
        const img = artistTiles[index]?.querySelector('img');
        if (img) {
            img.style.boxShadow = 'none';
        }
    };

    const getDominantColor = (imgElement) => {
        const canvas = document.createElement('canvas');
        canvas.width = imgElement.naturalWidth;
        canvas.height = imgElement.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(imgElement, 0, 0);
        if (canvas.width === 0) {
            return;
        }
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

        let r = 0, g = 0, b = 0, count = 0;
        for (let i = 0; i < data.length; i += 4) {
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
            count++;
        }
        r = Math.round(r / count);
        g = Math.round(g / count);
        b = Math.round(b / count);
        return `rgb(${r},${g},${b})`;
    };

    const EyeOpenIcon = () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z" stroke="grey" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 12C2 12 5 4 12 4C19 4 22 12 22 12C22 12 19 20 12 20C5 20 2 12 2 12Z" stroke="grey" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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

    const EditIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="grey" viewBox="0 0 24 24" width="24" height="24">
            <path d="M20.9519 3.0481C19.5543 1.65058 17.2885 1.65064 15.8911 3.04825L3.94103 14.9997C3.5347 15.4061
3.2491 15.9172 3.116 16.4762L2.02041 21.0777C1.96009 21.3311 2.03552 21.5976 2.21968 21.7817C2.40385 21.9659 2.67037
22.0413 2.92373 21.981L7.52498 20.8855C8.08418 20.7523 8.59546 20.4666 9.00191 20.0601L20.952 8.10861C22.3493 6.71112
22.3493 4.4455 20.9519 3.0481ZM16.9518 4.10884C17.7634 3.29709 19.0795 3.29705 19.8912 4.10876C20.7028 4.9204 20.7029
6.23632 19.8913 7.04801L19 7.93946L16.0606 5.00012L16.9518 4.10884ZM15 6.06084L17.9394 9.00018L7.94119 18.9995C7.73104
19.2097 7.46668 19.3574 7.17755 19.4263L3.76191 20.2395L4.57521 16.8237C4.64402 16.5346 4.79168 16.2704 5.00175 16.0603L15,6.06084 Z"></path>
        </svg>
    );

    const TrashIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="grey" viewBox="0 0 24 24" width="24" height="24">
            <path d="M10 5H14C14 3.89543 13.1046 3 12 3C10.8954 3 10 3.89543 10 5ZM8.5 5C8.5 3.067 10.067
1.5 12 1.5C13.933 1.5 15.5 3.067 15.5 5H21.25C21.6642 5 22 5.33579 22 5.75C22 6.16421 21.6642 6.5 21.25 6.5H19.9309L18.7589
18.6112C18.5729 20.5334 16.9575 22 15.0263 22H8.97369C7.04254 22 5.42715 20.5334 5.24113 18.6112L4.06908 6.5H2.75C2.33579
6.5 2 6.16421 2 5.75C2 5.33579 2.33579 5 2.75 5H8.5ZM10.5 9.75C10.5 9.33579 10.1642 9 9.75 9C9.33579 9 9 9.33579 9 9.75V17.25C9
17.6642 9.33579 18 9.75 18C10.1642 18 10.5 17.6642 10.5 17.25V9.75ZM14.25 9C14.6642 9 15 9.33579 15 9.75V17.25C15 17.6642 14.6642
18 14.25 18C13.8358 18 13.5 17.6642 13.5 17.25V9.75C13.5 9.33579 13.8358 9 14.25 9ZM6.73416 18.4667C6.84577 19.62 7.815 20.5 8.97369
20.5H15.0263C16.185 20.5 17.1542 19.62 17.2658 18.4667L18.4239 6.5H5.57608L6.73416 18.4667Z"></path>
        </svg>
    );

    return (
        <div>
            <Dialog open={open} onClose={() => {
                setOpen(false);
                setNewPlaylistName('');
                setNewPlaylistImage(null);
            }}>
                <DialogTitle style={{ backgroundColor: '#141516', color: 'white' }}>Добавление исполнителя</DialogTitle>
                <DialogContent style={{ backgroundColor: '#141516' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingBottom: '50px', position: 'relative' }}>
                        <img
                            src={newPlaylistImage ? URL.createObjectURL(newPlaylistImage) : "/images/unknown_artist.jpg"}
                            alt="preview"
                            style={{ width: '200px', height: '200px', marginTop: '10px', borderRadius: '10px' }}
                        />
                        <label style={{ position: 'absolute', top: '0', marginTop: '10px', width: '200px', height: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', opacity: '0', transition: 'opacity 0.3s' }} onMouseOver={e => e.currentTarget.style.opacity = '1'} onMouseOut={e => e.currentTarget.style.opacity = '0'}>
                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', color: 'white', width: '100%', height: '100%', borderRadius: '10px' }}>
                                <span style={{ fontSize: '50px' }}>+</span>
                                <span>{newPlaylistImage ? "Изменить изображение" : "Добавить изображение"}</span>
                            </div>
                            <input type="file" accept="image/*" onChange={e => setNewPlaylistImage(e.target.files[0])} style={{ display: 'none' }} />
                        </label>
                    </div>
                    <div className="search-bar" style={{ width: '300px' }}>
                        <input type="text" placeholder="Имя плейлиста" onChange={e => setNewPlaylistName(e.target.value)} />
                    </div>
                    <div className="search-bar" style={{ width: '300px', marginTop: '20px' }}>
                        {addType === "radio" && <input type="text" placeholder="URL" onChange={e => setNewPlaylistUrl(e.target.value)} />}
                    </div>
                </DialogContent>
                <DialogActions style={{ backgroundColor: '#141516' }}>
                    <Button onClick={handleAddArtist} color="primary">
                        Подтвердить
                    </Button>
                    <Button onClick={() => {
                        setOpen(false);
                        setNewPlaylistName('');
                        setNewPlaylistImage(null);
                    }} color="primary">
                        Отмена
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
                <DialogTitle style={{ backgroundColor: '#141516', color: 'white' }}>Редактирование исполнителя</DialogTitle>
                <DialogContent style={{ backgroundColor: '#141516' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingBottom: '50px', position: 'relative' }}>
                        <img
                            src={newPlaylistImage ? URL.createObjectURL(newPlaylistImage) : selectedArtist.image}
                            alt="preview"
                            style={{ width: '200px', height: '200px', marginTop: '10px', borderRadius: '10px' }}
                        />
                        <label style={{ position: 'absolute', top: '0', left: '50px', marginTop: '10px', width: '200px', height: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', opacity: '0', transition: 'opacity 0.3s' }} onMouseOver={e => e.currentTarget.style.opacity = '1'} onMouseOut={e => e.currentTarget.style.opacity = '0'}>
                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', color: 'white', width: '100%', height: '100%', borderRadius: '10px' }}>
                                <span style={{ fontSize: '50px' }}>+</span>
                                <span>{"Изменить изображение"}</span>
                            </div>
                            <input type="file" accept="image/*" onChange={e => setNewPlaylistImage(e.target.files[0])} style={{ display: 'none' }} />
                        </label>
                    </div>
                    <div className="search-bar" style={{ width: '300px' }}>
                        <input style={{ paddingLeft: '15px', outline: 'none' }} type="text" placeholder="Имя плейлиста" value={newPlaylistName} onChange={e => setNewPlaylistName(e.target.value)} />
                    </div>
                    {addType === "radio" && <input type="text" placeholder="URL" onChange={e => setNewPlaylistUrl(e.target.value)} />}
                </DialogContent>

                <DialogActions style={{ backgroundColor: '#141516' }}>
                    <Button onClick={handleEditArtist} color="primary">
                        Подтвердить
                    </Button>
                    <Button onClick={() => setEditOpen(false)} color="primary">
                        Отмена
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
                <DialogTitle style={{ backgroundColor: '#141516', color: 'white' }}>Удаление исполнителя</DialogTitle>
                <DialogContent style={{ backgroundColor: '#141516' }}>
                    Вы уверены?
                </DialogContent>
                <DialogActions style={{ backgroundColor: '#141516' }}>
                    <Button onClick={handleDeleteArtist} color="primary">
                        Подтвердить
                    </Button>
                    <Button onClick={() => setDeleteOpen(false)} color="primary">
                        Отмена
                    </Button>
                </DialogActions>
            </Dialog>
            {(path.endsWith('https://zvon.top/artists')) && (
                <div>
                    <h2 style={{ color: 'white' }}>Исполнители</h2>
                    <div className="artist-grid">
                        {searchData.artists.map((artist, index) => (
                            <div>
                                <div key={index} className="artist-tile" style={{ marginBottom: "50px" }} onMouseEnter={() => handleMouseEnter(index)}
                                    onMouseLeave={() => handleMouseLeave(index)}>
                                    <Link to={`/artist/${encodeURIComponent(artist.url)}`} style={{ textDecoration: 'none', color: 'white' }}>
                                        <LazyLoadImage src={!artist.image.includes('/') ? `/file/${artist.image}` : artist.image} alt={artist.name} effect="blur"
                                            style={{ filter: artist.isVisible === false && userID == 1 ? 'grayscale(100%)' : 'none' }} />
                                    </Link>

                                    {(userID == 1) && (
                                        <div className="eye-icon-wrapper" onClick={(event) => {
                                            event.stopPropagation();
                                            handleShowHide(artist);
                                        }}>
                                            {artist.isVisible === false ? <EyeClosedIcon /> : <EyeOpenIcon />}
                                        </div>
                                    )}

                                    {(userID == 1) && (
                                        <div className="edit-icon-wrapper" onClick={(event) => {
                                            event.stopPropagation();
                                            setSelectedArtist(artist);
                                            setNewPlaylistName(artist.name);
                                            setEditOpen(true);
                                        }}>
                                            <EditIcon />
                                        </div>
                                    )}

                                    {((userID == 1) && artist.isAdd == true) && (
                                        <div className="delete-icon-wrapper" onClick={(event) => {
                                            event.stopPropagation();
                                            setSelectedArtist(artist);
                                            setDeleteOpen(true);
                                        }}>
                                            <TrashIcon />
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
                                    <p style={{ color: 'white' }}>{artist.name}</p>
                                </div>
                            </div>
                        ))}
                        {userID == 1 && currentPage == endPage && (
                            <li className="artist-tile" onClick={() => { setOpen(true); setAddType("artists"); }}>
                                <Button variant="outlined" color="primary" style={{ width: '100%', height: '100%' }}>
                                    + Добавить исполнителя
                                </Button>
                            </li>
                        )}
                    </div>
                    <Pagination currentPage={currentPage} totalPages={totalPages} handlePageClick={handlePageClick} pageNumbers={pageNumbers} />
                </div>
            )}

            {(path.endsWith('https://zvon.top/albums')) && (
                <div>
                    <h2 style={{ color: 'white' }}>Альбомы</h2>
                    <div className="artist-grid">
                        {searchData.albums.map((album, index) => (
                            <div>
                                <div key={index} className="artist-tile" style={{ marginBottom: "50px" }} onMouseEnter={() => handleMouseEnter(index)}
                                    onMouseLeave={() => handleMouseLeave(index)}>
                                    <Link to={`/artist/${encodeURIComponent(album.id ? album.id : album.url)}`} style={{ textDecoration: 'none', color: 'white' }}>
                                        <LazyLoadImage src={album.isAdd ? `/file/${album.image}` : album.image} alt={album.name} effect="blur"
                                            style={{ filter: album.isVisible === false && userID == 1 ? 'grayscale(100%)' : 'none' }} />
                                    </Link>
                                    {(userID == 1) && (
                                        <div className="eye-icon-wrapper" onClick={(event) => {
                                            event.stopPropagation();
                                            handleShowHide(album);
                                        }}>
                                            {album.isVisible === false && userID == 1 ? <EyeClosedIcon /> : <EyeOpenIcon />}
                                        </div>
                                    )}
                                    {(userID == 1) && (
                                        <div className="edit-icon-wrapper" onClick={(event) => {
                                            event.stopPropagation();
                                            setSelectedArtist(album);
                                            setNewPlaylistName(album.name);
                                            setEditOpen(true);
                                        }}>
                                            <EditIcon />
                                        </div>
                                    )}

                                    {((userID == 1) && album.isAdd == true) && (
                                        <div className="delete-icon-wrapper" onClick={(event) => {
                                            event.stopPropagation();
                                            setSelectedArtist(album);
                                            setDeleteOpen(true);
                                        }}>
                                            <TrashIcon />
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
                                    <p style={{ color: 'white' }}>{album.name}</p>
                                </div>
                            </div>
                        ))}
                        {userID == 1 && currentPage == endPage && (
                            <li className="artist-tile" onClick={() => { setOpen(true); setAddType("albums"); }}>
                                <Button variant="outlined" color="primary" style={{ width: '100%', height: '100%' }}>
                                    + Добавить альбом
                                </Button>
                            </li>
                        )}
                    </div>
                    <Pagination currentPage={currentPage} totalPages={totalPages} handlePageClick={handlePageClick} pageNumbers={pageNumbers} />
                </div>
            )}

            {(path.endsWith('https://zvon.top/collections')) && (
                <div>
                    <h2 style={{ color: 'white' }}>Сборники</h2>
                    <div className="artist-grid">
                        {searchData.collections.map((collection, index) => (
                            <div>
                                <div key={index} className="artist-tile" style={{ marginBottom: "50px" }} onMouseEnter={() => handleMouseEnter(index)}
                                    onMouseLeave={() => handleMouseLeave(index)}>
                                    <Link to={`/artist/${encodeURIComponent(collection.url)}`} style={{ textDecoration: 'none', color: 'white' }}>
                                        <LazyLoadImage src={collection.isAdd ? `/file/${collection.image}` : collection.image} alt={collection.name} effect="blur"
                                            style={{ filter: collection.isVisible === false && userID == 1 ? 'grayscale(100%)' : 'none' }} />
                                    </Link>

                                    {(userID == 1) && (
                                        <div className="eye-icon-wrapper" onClick={(event) => {
                                            event.stopPropagation();
                                            handleShowHide(collection);
                                        }}>
                                            {collection.isVisible === false && userID == 1 ? <EyeClosedIcon /> : <EyeOpenIcon />}
                                        </div>
                                    )}
                                    {(userID == 1) && (
                                        <div className="edit-icon-wrapper" onClick={(event) => {
                                            event.stopPropagation();
                                            setSelectedArtist(collection);
                                            setNewPlaylistName(collection.name);
                                            setEditOpen(true);
                                        }}>
                                            <EditIcon />
                                        </div>
                                    )}

                                    {((userID == 1) && collection.isAdd == true) && (
                                        <div className="delete-icon-wrapper" onClick={(event) => {
                                            event.stopPropagation();
                                            setSelectedArtist(collection);
                                            setDeleteOpen(true);
                                        }}>
                                            <TrashIcon />
                                        </div>
                                    )}
                                    {userID && (
                                        <div className="heart-icon-wrapper" onClick={(event) => {
                                            event.stopPropagation();
                                            if (collection.isFavorite) {
                                                handleDeleteFromFavorite(collection);
                                            } else {
                                                handleAddToFavorite(collection);
                                            }
                                        }}>
                                            {collection.isFavorite === false ? <EmptyHeartIcon /> : <FullHeartIcon />}
                                        </div>
                                    )}
                                    <p style={{ color: 'white' }} >{collection.name}</p>
                                </div>
                            </div>
                        ))}
                        {userID == 1 && currentPage == endPage && (
                            <li className="artist-tile" onClick={() => { setOpen(true); setAddType("collections"); }}>
                                <Button variant="outlined" color="primary" style={{ width: '100%', height: '100%' }}>
                                    + Добавить сборник
                                </Button>
                            </li>
                        )}
                    </div>
                    <Pagination currentPage={currentPage} totalPages={totalPages} handlePageClick={handlePageClick} pageNumbers={pageNumbers} />
                </div>
            )}

            {(path.endsWith('https://zvon.top/genres')) && (
                <div>
                    <ul className="track-list">
                        {searchData.genres.map((genr, index) => (
                            <li key={index} className="track-item" onClick={() => handleClick(genr.url)}>
                                <div style={{ color: 'white' }}>
                                    {genr.name}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {(path.endsWith('https://zvon.top/radio-online')) && (
                <div>
                    <h2 style={{ color: 'white' }}>Радио</h2>
                    <div className="artist-grid">
                        {searchData.radio.map((radio, index) => (
                            <div>
                                <div key={index} className="artist-tile" style={{ marginBottom: "50px" }} onClick={() => handlePlayTrack(radio, searchData.radio)} onMouseEnter={() => handleMouseEnter(index)}
                                    onMouseLeave={() => handleMouseLeave(index)}>
                                    <LazyLoadImage
                                        src={radio.isAdd ? `/file/${radio.image}` : radio.image}
                                        alt={radio.name}
                                        effect="blur"
                                        style={{ filter: radio.isVisible === false && userID == 1 ? 'grayscale(100%)' : 'none' }}
                                    />

                                    {(userID == 1) && (
                                        <div className="eye-icon-wrapper" onClick={(event) => {
                                            event.stopPropagation();
                                            handleShowHide(radio);
                                        }}>
                                            {radio.isVisible === false && userID == 1 ? <EyeClosedIcon /> : <EyeOpenIcon />}
                                        </div>
                                    )}
                                    {(userID == 1) && (
                                        <div className="edit-icon-wrapper" onClick={(event) => {
                                            event.stopPropagation();
                                            setSelectedArtist(radio);
                                            setNewPlaylistName(radio.name);
                                            setEditOpen(true);
                                        }}>
                                            <EditIcon />
                                        </div>
                                    )}

                                    {((userID == 1) && radio.isAdd == true) && (
                                        <div className="delete-icon-wrapper" onClick={(event) => {
                                            event.stopPropagation();
                                            setSelectedArtist(radio);
                                            setDeleteOpen(true);
                                        }}>
                                            <TrashIcon />
                                        </div>
                                    )}
                                    {userID && (
                                        <div className="heart-icon-wrapper" onClick={(event) => {
                                            event.stopPropagation();
                                            if (radio.isFavorite) {
                                                handleDeleteFromFavorite(radio);
                                            } else {
                                                handleAddToFavorite(radio);
                                            }
                                        }}>
                                            {radio.isFavorite === false ? <EmptyHeartIcon /> : <FullHeartIcon />}
                                        </div>
                                    )}
                                    <p style={{ color: 'white' }}>{radio.name}</p>
                                </div>
                            </div>
                        ))}
                        {userID == 1 && currentPage == endPage && (
                            <li className="artist-tile" onClick={() => { setOpen(true); setAddType("radio"); }}>
                                <Button variant="outlined" color="primary" style={{ width: '100%', height: '100%' }}>
                                    + Добавить радио
                                </Button>
                            </li>
                        )}
                    </div>
                    <Pagination currentPage={currentPage} totalPages={totalPages} handlePageClick={handlePageClick} pageNumbers={pageNumbers} />
                </div>
            )}
        </div>
    );
}
