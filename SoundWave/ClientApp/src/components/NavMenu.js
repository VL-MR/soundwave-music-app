import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Navbar, NavbarToggler, NavbarBrand } from 'reactstrap';
import { Dialog, DialogTitle, DialogContent, TextField, Button, DialogActions, Typography } from '@material-ui/core';
import './NavMenu.css';
import $ from 'jquery';
import axios from 'axios';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
export class NavMenu extends Component {
    static displayName = NavMenu.name;
    constructor(props) {
        super(props);

        this.toggleNavbar = this.toggleNavbar.bind(this);
        this.toggleDropdown = this.toggleDropdown.bind(this);
        this.state = {
            collapsed: true,
            dropdownOpen: false,
            query: '',
            results: [],
            authorLink: ``,
            isMobile: false,
            showDialog: false,
            userID: '',
            username: '',
            password: '',
            email: '',
            forgotPassword: false,
            showRegisterDialog: false,
            showForgotPasswordDialog: false,
            isLoggedIn: false,
            typeNames: {
                genres: 'Жанры',
                artists: 'Исполнители',
                tracks: 'Треки',
                albums: 'Альбомы',
                compilations: 'Сборники'
            }
        };
    }

    toggleNavbar() {
        this.setState({
            collapsed: !this.state.collapsed
        });
    }

    toggleDropdown() {
        this.setState(prevState => ({
            dropdownOpen: !prevState.dropdownOpen
        }));
    }

    componentDidMount() {
        document.addEventListener('click', this.handleClickOutside, true);
        this.setState({ isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) });
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const username = localStorage.getItem('username') || '';
        const userID = localStorage.getItem('userID') || '';
        this.setState({ isLoggedIn, username, userID });
    }

    componentDidUpdate(prevProps, prevState) {
        const username = localStorage.getItem('username');
        if (username !== prevState.username && username !== null) {
            this.setState({ username });
        }
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.handleClickOutside, true);
    }

    handleClickOutside = (event) => {
        const suggestNode = this.suggestNode;
        const dropdownNode = this.dropdownNode;

        if ((!suggestNode || !suggestNode.contains(event.target)) && (!dropdownNode || !dropdownNode.contains(event.target))) {
            this.setState({
                results: [],
                dropdownOpen: false
            });
        }
    }

    getInfo = async () => {
        try {
            const query = this.state.query.toLowerCase().replace(/\s+/g, '-');
            const response = await fetch(`/api/https://zvon.top/suggest/${query}`);

            const responseJSON = await response.json();
            const [dbArtists, dbSongs] = await Promise.all([
                axios.get('/artist').then(res => res.data),
                axios.get('/song').then(res => res.data)
            ]);

           
            const results = [];
            const hiddenArtists = [];
            const hiddenTracks = [];

            for (const phrase of responseJSON.phrases) {
                const extraParams = phrase.extra.split(';');
                const collectionParam = extraParams.find(param => param.startsWith('collection:'));
                const imageUrl = collectionParam ? collectionParam.split(':')[1].replace('%s', 'small') : "/images/unknown_artist.jpg";
                const imageId = imageUrl.includes("unknown_artist") && collectionParam ? collectionParam.split(':')[1] : imageUrl;
                const artistId = extraParams.find(param => param.startsWith('artists:'))?.split(':')[1];
                const genrId = extraParams.find(param => param.startsWith('genre:'))?.split(':')[1];
                const trackId = extraParams.find(param => param.startsWith('track:'))?.split(':')[1];
                const albumId = extraParams.find(param => param.startsWith('albums:'))?.split(':')[1];
                const collectionId = extraParams.find(param => param.startsWith('collections:'))?.split(':')[1];
                const foundArtist = dbArtists.find(dbArtist => dbArtist.name === phrase.phrase && dbArtist.type === phrase.source);
                let isVisible = true;
                if (foundArtist) {
                    isVisible = foundArtist.isVisible;
                    if (!isVisible) {
                        hiddenArtists.push(phrase.phrase);
                    }
                }
                const trackName = phrase.phrase.split(' — ')[1];
                const foundSong = dbSongs.find(dbSong => dbSong.title.includes(trackName));
                if (foundSong) {
                    isVisible = foundSong.isVisible;
                    if (!isVisible) {
                        hiddenTracks.push(trackName);
                    }
                }

                if (this.state.userID !== '1') {
                    const artistName = phrase.phrase.split(' — ')[0];
                    if (!isVisible || hiddenArtists.includes(artistName) || hiddenTracks.includes(trackName)) {
                        continue;
                    }
                }

                results.push({
                    name: phrase.phrase,
                    type: phrase.source,
                    image: imageUrl.startsWith('/img/collections/') ? imageUrl : `/img/collections/${imageUrl}`,
                    imageId,
                    artistId,
                    genrId,
                    trackId,
                    albumId,
                    collectionId,
                    isVisible,
                    //url: phrase.source === 'track' ? songId : artistId 
                });
            }
            const albumNames = new Set();
            results.forEach(item => {
                if (item.type === 'albums') {
                    const normalizedName = item.name.replace(/[-—]/g, ' - ');
                    albumNames.add(normalizedName);
                }
            });

            const filteredResults = results.filter(item => {
                if (item.type === 'compilations') {
                    const normalizedName = item.name.replace(/[-—]/g, ' - ');
                    return !albumNames.has(normalizedName);
                }
                return true;
            });
            this.setState({ results: filteredResults }); 
        } catch (error) {
            console.error('There was an error!', error);
        }
    };

    handleInputChange = (e) => {
        const { value } = e.target;
        this.setState(prevState => {
            const results = value.length > 0 ? prevState.results : [];
            return { query: value, results };
        }, () => {
            if (value.length > 0) {
                this.getInfo();
            }
        });
    };

    handleClick = (result, e) => {
        e.preventDefault();
        let extra;
        console.log(result);
        if (result.type == 'artists') {
            extra = `${result.type}:${result.artistId};collection:${result.imageId.split('/').pop().split('_')[0]}_%25s.jpg`;
            extra = extra.replace("%2525", "%25");
        }
        else if (result.type == 'tracks') {
            extra = `track:${result.trackId};collection:${result.imageId.split('/').pop().split('_')[0]}_%25s.jpg`;
            extra = extra.replace("%2525", "%25");
        }
        else if (result.type == 'albums') {
            extra = `albums:${result.albumId};collection:${result.imageId.split('/').pop().split('_')[0]}_%25s.jpg`;
            extra = extra.replace("%2525", "%25");
        }
        else if (result.type == 'compilations') {
            extra = `collections:${result.compilationId};collection:${result.imageId.split('/').pop().split('_')[0]}_%25s.jpg`;
            extra = extra.replace("%2525", "%25");
        }
        else if (result.type == 'genres') {
            extra = `genre:${result.genreId};collection:${result.imageId.split('/').pop().split('_')[0]}_%25s.jpg`;
            extra = extra.replace("%2525", "%25");
        }


        fetch(`/api?Url=${encodeURIComponent("https://zvon.top/find")}&q=${encodeURIComponent(result.name)}&extra=${extra}&source=${encodeURIComponent(result.type)}&userInput=${encodeURIComponent(this.state.query)}`, {
            method: 'GET',
            redirect: 'manual'
        })
            .then(response => {
                if (response.type === 'basic') {
                    if (result.type == 'artists' || result.type == 'albums' || result.type == 'compilations' || result.type == 'genres') {
                        var xhr = new XMLHttpRequest();
                        xhr.open("GET", `${response.url}`, true);
                        xhr.onreadystatechange = () => {
                            if (xhr.readyState === 4 && xhr.status === 200) {
                                var responseHTML = $.parseHTML(xhr.responseText);
                                var metaTag = $(responseHTML).filter('meta[property="og:url"]');
                                var contentValue = metaTag.attr('content');
                                window.history.pushState({}, '', `/artist/${"https:" + encodeURIComponent(contentValue)}`);
                                window.dispatchEvent(new PopStateEvent('popstate'));
                                this.setState({
                                    results: []
                                });
                            }
                        };
                        xhr.send();
                    }
                    else if (result.type == 'tracks') {
                        var xhr = new XMLHttpRequest();
                        xhr.open("GET", `${response.url}`, true);
                        xhr.onreadystatechange = () => {
                            if (xhr.readyState === 4 && xhr.status === 200) {
                                var responseHTML = $.parseHTML(xhr.responseText);
                                var metaTag = $(responseHTML).filter('meta[property="og:url"]');
                                var contentValue = metaTag.attr('content');
                                window.history.pushState({}, '', `/song/${"https:" + encodeURIComponent(contentValue)}`);
                                window.dispatchEvent(new PopStateEvent('popstate'));
                                this.setState({
                                    results: []
                                });
                            }
                        };
                        xhr.send();
                    }

                } else {
                    return response.text();
                }
            })
            .catch(error => {
                console.error('Fetch error:', error);
            });
    }

    handleOpenDialog = () => {
        this.setState({ showDialog: true });
    };

    handleLogin = () => {
        const { username, password } = this.state;
        const user = {
            Name: username,
            Password: password,
        };
        axios.post('/user/login', user)
            .then(response => {
                this.setState({ showDialog: false, isLoggedIn: true, userID: response.data.userID });
                localStorage.setItem('isLoggedIn', true);
                localStorage.setItem('username', username);
                localStorage.setItem('userID', response.data.userID);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        window.location.href = '/';
    };

    handleCloseDialog = () => {
        this.setState({ showDialog: false });
    };

    handleOpenRegisterDialog = () => {
        this.setState({ showDialog: false, showRegisterDialog: true });
    };

    handleRegister = () => {
        const { username, password, email } = this.state;
        const newUser = {
            Name: username,
            Password: password,
            Email: email,
        };
        axios.post('/user', newUser)
            .then(response => {
                this.setState({ showRegisterDialog: false, isLoggedIn: true, userID: response.data.userID });
                localStorage.setItem('isLoggedIn', true);
                localStorage.setItem('username', username);
                localStorage.setItem('userID', response.data.userID);
                const playlist = {
                    PlaylistName: 'Избранная музыка',
                    PlaylistImage: 'unknown_artist.jpg',
                };
                const playlistWithUser = { ...playlist, UserID: response.data.userID };
                axios.post('/playlist', playlistWithUser)
                    .catch(error => {
                        console.error(`Error adding playlist: ${error}`);
                    })
                const dirName = `${response.data.userID}${username}`;
                axios.post(`/directory/${dirName}`)
                    .catch(error => {
                        console.error(`Error creating directory: ${error}`);
                    });
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        window.location.href = '/';
    };

    handleCloseRegisterDialog = () => {
        this.setState({ showRegisterDialog: false });
    };

    handleOpenForgotPasswordDialog = () => {
        this.setState({ showDialog: false, showForgotPasswordDialog: true });
    };

    handleForgotPassword = () => {
        this.setState({ showDialog: false, showForgotPasswordDialog: true });
    };

    handleCloseForgotPasswordDialog = () => {
        this.setState({ showForgotPasswordDialog: false });
    };

    handleInputChange2 = (event) => {
        this.setState({ [event.target.name]: event.target.value });
    };

    handleLogout = () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userID');
        localStorage.removeItem('username');
        localStorage.clear();
        window.history.pushState(null, null, '/');
        window.location.href = '/';
        this.setState({ isLoggedIn: false, username: '', userID: '' });
    };

    handleProfile = () => {
        window.history.pushState({}, '', `/profile`);
        window.dispatchEvent(new PopStateEvent('popstate'));
    };

    render() {
        const { isMobile, showDialog, showRegisterDialog, showForgotPasswordDialog, username, userID, password, email, forgotPassword, isLoggedIn, dropdownOpen } = this.state;
        return (
            <header>
                {isMobile && (
                    <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                        <NavbarBrand tag={Link} to="/" style={{ fontSize: '30px' }}>SoundWave</NavbarBrand>
                    </div>
                )}
                <Navbar className="navbar-expand-sm navbar-toggleable-sm ng-white border-bottom box-shadow mb-5" container light>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <NavbarToggler onClick={this.toggleNavbar} className="mr-2" />
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const searchUrl = this.state.query;
                            window.history.pushState({}, '', `/search/${encodeURIComponent(searchUrl)}`);
                            window.dispatchEvent(new PopStateEvent('popstate'));
                        }}
                            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}
                        >
                            <div className="search-container">
                                <div className="search-bar">
                                    <input
                                        type="search"
                                        placeholder="Поиск"
                                        onChange={this.handleInputChange}
                                        style={{ paddingLeft: '15px', outline: 'none' }}
                                    />
                                </div>
                                <button type="submit" style={{ position: 'absolute', right: '10px', top: '5px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
                                        <path d="M0 0h24v24H0z" fill="none" />
                                        <path fill="#857ac5" d="M10 2a8 8 0 0 1 6.32 13.32l5.387 5.387-1.414 1.414-5.387-5.387A8 8 0 1 1 10 2zm0 2a6 6 0 1 0 0 12A6 6 0 0 0 10 4z" />
                                    </svg>
                                </button>
                                <div
                                    className="suggestContainer"
                                    ref={node => this.suggestNode = node}
                                >
                                    {this.state.results.length > 0 && (
                                        <div>
                                            {['genres', 'artists', 'tracks', 'albums', 'compilations'].map(type => {
                                                const resultsForType = this.state.results.filter(result => result.type === type);
                                                return resultsForType.length > 0 && (
                                                    <div className="category">
                                                        <div className="type">{this.state.typeNames[type]}</div>
                                                        {resultsForType.slice(0, 3).map((result, index) => (
                                                            <div key={index} className="suggest" onClick={(e) => this.handleClick(result, e)}>
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
                        </form>
                        <div style={{ right: 0, padding: '10px' }}>
                            {isLoggedIn ? (
                                <div ref={node => { this.dropdownNode = node; }} style={{ position: 'relative', display: 'block' }}>
                                    <div style={{ color: 'white' }} onClick={this.toggleDropdown}>
                                        {username}
                                    </div>
                                    {dropdownOpen && (
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
                                            <div onClick={this.handleProfile} style={{ margin: '10px 0', padding: '0 10px' }}>Профиль</div>
                                            <div onClick={this.handleLogout} style={{ margin: '10px 0', padding: '0 10px' }}>Выход</div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Button variant="contained" color="primary" onClick={this.handleOpenDialog}>
                                    Login
                                </Button>
                            )}
                        </div>
                        {/*Login Dialog*/}
                        <Dialog open={showDialog} onClose={this.handleCloseDialog}>
                            <DialogTitle style={{ textAlign: 'center', backgroundColor: '#141516', color: 'white' }}>Login</DialogTitle>
                            <DialogContent style={{ backgroundColor: '#141516', color: 'white' }}>
                                <TextField
                                    margin="dense"
                                    name="username"
                                    label="Username"
                                    type="text"
                                    fullWidth
                                    value={username}
                                    onChange={this.handleInputChange2}
                                    style={{ backgroundColor: '#141516', color: 'white' }}
                                />
                                <TextField
                                    margin="dense"
                                    name="password"
                                    label="Password"
                                    type="password"
                                    fullWidth
                                    value={password}
                                    onChange={this.handleInputChange2}
                                />
                            </DialogContent>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#141516', color: 'white' }}>
                                <Button onClick={this.handleLogin} color="primary" style={{ margin: '5px', width: '90%', borderRadius: '10px' }}>
                                    Login
                                </Button>
                                <Button onClick={this.handleOpenRegisterDialog} color="secondary" style={{ margin: '5px', width: '90%', borderRadius: '10px' }}>
                                    Register
                                </Button>
                                <Typography
                                    onClick={this.handleOpenForgotPasswordDialog}
                                    style={{ cursor: 'pointer', color: 'blue', margin: '15px' }}
                                >
                                    Forgot password?
                                </Typography>
                            </div>
                        </Dialog>
                        {/*Register Dialog*/}
                        <Dialog open={showRegisterDialog} onClose={this.handleCloseRegisterDialog}>
                            <DialogTitle style={{ textAlign: 'center', backgroundColor: '#141516', color: 'white' }}>Register</DialogTitle>
                            <DialogContent style={{ backgroundColor: '#141516', color: 'white' }}>
                                <TextField
                                    margin="dense"
                                    name="username"
                                    label="Username"
                                    type="text"
                                    fullWidth
                                    value={username}
                                    onChange={this.handleInputChange2}
                                />
                                <TextField
                                    margin="dense"
                                    name="password"
                                    label="Password"
                                    type="password"
                                    fullWidth
                                    value={password}
                                    onChange={this.handleInputChange2}
                                />
                                <TextField
                                    margin="dense"
                                    name="email"
                                    label="Email"
                                    type="email"
                                    fullWidth
                                    value={email}
                                    onChange={this.handleInputChange2}
                                />
                            </DialogContent>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#141516', color: 'white' }}>
                                <Button onClick={this.handleRegister} color="primary" style={{ margin: '15px', width: '95%', borderRadius: '10px' }}>
                                    Register
                                </Button>
                            </div>
                        </Dialog>
                        {/*Forgot Dialog*/}
                        <Dialog open={showForgotPasswordDialog} onClose={this.handleCloseForgotPasswordDialog}>
                            <DialogTitle style={{ textAlign: 'center', backgroundColor: '#141516', color: 'white' }}>Forgot Password</DialogTitle>
                            <DialogContent style={{ backgroundColor: '#141516', color: 'white' }}>
                                <TextField
                                    margin="dense"
                                    name="email"
                                    label="Email"
                                    type="email"
                                    fullWidth
                                    value={email}
                                    onChange={this.handleInputChange2}
                                />
                            </DialogContent>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#141516', color: 'white' }}>
                                <Button onClick={this.handleForgotPassword} color="primary" style={{ margin: '15px', width: '85%', borderRadius: '10px' }}>
                                    Reset Password
                                </Button>
                            </div>
                        </Dialog>
                    </div>
                </Navbar>
            </header>
        );
    }
}
 //getInfo = () => {
    //    var xhr = new XMLHttpRequest();
    //    xhr.open("GET", `/api/${"https://zvon.top/suggest/" + this.state.query.toLowerCase().replace(/\s+/g, '-')}`, true);
    //    xhr.responseType = 'json';
    //    xhr.onreadystatechange = () => {
    //        if (xhr.readyState === 4 && xhr.status === 200) {
    //            var responseJSON = xhr.response;

    //            var results = responseJSON.phrases.map(phrase => {
    //                var extraParams = phrase.extra.split(';');
    //                var imageInfo = extraParams.find(param => param.startsWith('collection:'));
    //                var genrInfo = extraParams.find(param => param.startsWith('genre:'));
    //                var artistInfo = extraParams.find(param => param.startsWith('artists:'));
    //                var trackInfo = extraParams.find(param => param.startsWith('track:'));
    //                var albumInfo = extraParams.find(param => param.startsWith('albums:'));
    //                var collectionInfo = extraParams.find(param => param.startsWith('collections:'));
    //                var imageUrl = null;
    //                var imageId = null;
    //                var genrId = null;
    //                var artistId = null;
    //                var trackId = null;
    //                var albumId = null;
    //                var collectionId = null;
    //                if (imageInfo) {
    //                    imageUrl = imageInfo.split(':')[1].replace('%s', 'small');
    //                    imageId = imageUrl;
    //                    imageUrl = `/img/collections/${imageUrl}`;
    //                }
    //                else {
    //                    imageUrl = "/images/unknown_artist.jpg";
    //                    imageInfo = extraParams.find(param => param.startsWith('album:'));
    //                    if (imageInfo) {
    //                        imageId = imageInfo.split(':')[1].replace('%s', 'small');
    //                    }
    //                }
    //                if (artistInfo) {
    //                    artistId = artistInfo.split(':')[1];
    //                }
    //                if (genrInfo) {
    //                    genrId = genrInfo.split(':')[1];
    //                }
    //                else if (trackInfo) {
    //                    trackId = trackInfo.split(':')[1];
    //                }
    //                else if (albumInfo) {
    //                    albumId = albumInfo.split(':')[1];
    //                }
    //                else if (collectionInfo) {
    //                    collectionId = collectionInfo.split(':')[1];
    //                }
    //                return axios.get('/artist')
    //                    .then(response => {
    //                        const dbArtists = response.data;
    //                        const foundArtist = dbArtists.find(dbArtist => dbArtist.name === phrase.phrase && dbArtist.type === phrase.source);
    //                        let isVisible = true;
    //                        if (foundArtist) {
    //                            isVisible = this.state.userID === 1 ? true : foundArtist.isVisible;
    //                        }

    //                        return {
    //                            name: phrase.phrase,
    //                            type: phrase.source,
    //                            image: imageUrl,
    //                            imageId: imageId,
    //                            artistId: artistId,
    //                            genrId: genrId,
    //                            trackId: trackId,
    //                            albumId: albumId,
    //                            collectionId: collectionId,
    //                            isVisible: isVisible
    //                        };
    //                    });
    //            });
    //            Promise.all(results)
    //                .then(results => {
    //                    if (this.state.userID === '1') {
    //                        this.setState({ results: results });
    //                    } else {
    //                        const hiddenArtists = results.filter(result => result.type === 'artists' && result.isVisible === false).map(artist => artist.name);

    //                        const filteredResults = results.filter(result => {
    //                            if (['tracks', 'albums'].includes(result.type) && hiddenArtists.includes(result.name.split(' — ')[0])) {
    //                                return false;
    //                            }
    //                            return true;
    //                        });

    //                        this.setState({ results: filteredResults });
    //                    }
    //                });



    //        }
    //    };

    //    xhr.send();
    //} 
