import React, { Component } from 'react';
import { NavbarBrand } from 'reactstrap';
import { Link, NavLink } from 'react-router-dom';
import './NavMenu.css';

export class SideBarMenu extends Component {
    state = {
        isMobile: false,
        isMenuOpen: false,
        userID: null,
        //scrolled: false,
    };

    componentDidMount() {
        this.setState({ isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) });
        const userID1 = localStorage.getItem('userID');
        this.setState({ userID: userID1 });
        this.updateBodyPadding();
        //window.addEventListener('scroll', this.handleScroll);
    }

    //componentWillUnmount() {
    //    window.removeEventListener('scroll', this.handleScroll);
    //}

    //handleScroll = () => {
    //    const offset = window.scrollY;
    //    if (offset > 1) {
    //        this.setState({ scrolled: true });
    //    } else {
    //        this.setState({ scrolled: false });
    //    }
    //}

    componentDidUpdate(prevProps, prevState) {
        if (prevState.isMobile !== this.state.isMobile) {
            this.updateBodyPadding();
        }
    }

    toggleMenu = (event) => {
        event.preventDefault();
        this.setState(prevState => ({ isMenuOpen: !prevState.isMenuOpen }));
    }

    updateBodyPadding = () => {
        document.body.style.paddingLeft = !this.state.isMobile ? '300px' : '0px';
        var playMenu = document.querySelector('.content-container');
        playMenu.style.marginLeft = !this.state.isMobile ? '300px' : '0px';
    }

    render() {
        const { isMobile, userID, isMenuOpen } = this.state;
        if (!isMobile) {
            return (
                <div style={{ display: 'flex' }}>
                    <div className="sidebar-menu">
                        <div style={{ height: '20px' }}></div>
                        <NavbarBrand tag={Link} to="/">
                            <svg style={{ marginLeft: '-50px' }} width="100" height="60">
                                <defs>
                                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="50%" style={{ stopColor: 'mediumpurple', stopOpacity: 1 }} />
                                        <stop offset="100%" style={{ stopColor: 'darkviolet', stopOpacity: 1 }} />
                                    </linearGradient>
                                </defs>
                                <rect x="50" y="30" width="6" height="20" fill="url(#gradient)" rx="5" />
                                <rect x="60" y="25" width="6" height="30" fill="url(#gradient)" rx="5" />
                                <rect x="70" y="20" width="6" height="40" fill="url(#gradient)" rx="5" />
                                <rect x="80" y="25" width="6" height="30" fill="url(#gradient)" rx="5" />
                                <rect x="90" y="30" width="6" height="20" fill="url(#gradient)" rx="5" />
                            </svg>
                            <svg width="200" height="60">
                                <defs>
                                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="50%" style={{ stopColor: 'mediumpurple', stopOpacity: 1 }} />
                                        <stop offset="100%" style={{ stopColor: 'darkviolet', stopOpacity: 1 }} />
                                    </linearGradient>
                                </defs>
                                <text x="0" y="50" fill="url(#gradient)" style={{ fontSize: '35px' }}>SoundWave</text>
                            </svg>
                        </NavbarBrand>
                        <div style={{ height: '20px' }}></div>
                        <ul className="listStyle">
                            <li style={{ position: 'relative' }}>
                                <NavLink to={`/artist/${encodeURIComponent("https://zvon.top/collections/13252")}`} activeClassName="active">
                                    <svg style={{ position: 'absolute', left: '-30px', top: '50%', transform: 'translateY(-50%)' }} width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <defs>
                                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="50%" style={{ stopColor: 'mediumpurple', stopOpacity: 1 }} />
                                                <stop offset="100%" style={{ stopColor: 'darkviolet', stopOpacity: 1 }} />
                                            </linearGradient>
                                        </defs>
                                        <rect x="2" y="10" width="2" height="10" fill="url(#gradient)" />
                                        <rect x="7" y="5" width="2" height="15" fill="url(#gradient)" />
                                        <rect x="12" y="0" width="2" height="20" fill="url(#gradient)" />
                                        <rect x="17" y="5" width="2" height="15" fill="url(#gradient)" />
                                    </svg>
                                    Популярные треки
                                </NavLink>
                            </li>
                            <li style={{ position: 'relative' }}>
                                <NavLink to={`/artist/${encodeURIComponent("https://zvon.top/collections/11480")}`} activeClassName="active">
                                    <svg style={{ position: 'absolute', left: '-30px', top: '50%', transform: 'translateY(-50%)' }} width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <defs>
                                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="50%" style={{ stopColor: 'mediumpurple', stopOpacity: 1 }} />
                                                <stop offset="100%" style={{ stopColor: 'darkviolet', stopOpacity: 1 }} />
                                            </linearGradient>
                                        </defs>
                                        <rect x="2" y="5" width="2" height="15" fill="url(#gradient)" />
                                        <rect x="7" y="10" width="2" height="10" fill="url(#gradient)" />
                                        <rect x="12" y="0" width="2" height="20" fill="url(#gradient)" />
                                        <rect x="17" y="10" width="2" height="10" fill="url(#gradient)" />
                                    </svg>
                                    Новые треки
                                </NavLink>
                            </li>
                            <li style={{ position: 'relative' }}>
                                <NavLink to={`/sidebarpages/${encodeURIComponent("https://zvon.top/artists")}`} activeClassName="active">
                                    <svg style={{ position: 'absolute', left: '-30px', top: '50%', transform: 'translateY(-50%)' }} width="20" height="20" viewBox="0 0 19 18" xmlns="http://www.w3.org/2000/svg">
                                        <defs>
                                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="50%" style={{ stopColor: 'mediumpurple', stopOpacity: 1 }} />
                                                <stop offset="100%" style={{ stopColor: 'darkviolet', stopOpacity: 1 }} />
                                            </linearGradient>
                                        </defs>
                                        <path d="M8.5 7.125C10.0533 7.125 11.3125 5.8658 11.3125 4.3125C11.3125 2.7592 10.0533 1.5 8.5 1.5C6.9467 1.5 5.6875 2.7592 5.6875 4.3125C5.6875 5.8658 6.9467 7.125 8.5 7.125Z" stroke="url(#gradient)" stroke-width="2"></path>
                                        <path d="M14.125 16.5C15.1605 16.5 16 15.6605 16 14.625C16 13.5895 15.1605 12.75 14.125 12.75C13.0895 12.75 12.25 13.5895 12.25 14.625C12.25 15.6605 13.0895 16.5 14.125 16.5Z" stroke="url(#gradient)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                                        <path d="M8.81969 16.5H2.875C2.37772 16.5 1.90081 16.3025 1.54917 15.9508C1.19754 15.5992 1 15.1223 1 14.625C1 13.6304 1.39509 12.6766 2.09835 11.9733C2.80161 11.2701 3.75544 10.875 4.75 10.875H9.9325M16 14.625V8.0625L17.875 9.9375" stroke="url(#gradient)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                                    </svg>
                                    Исполнители
                                </NavLink>
                            </li>
                            <li style={{ position: 'relative' }}>
                                <NavLink to={`/sidebarpages/${encodeURIComponent("https://zvon.top/albums")}`} activeClassName="active">
                                    <svg style={{ position: 'absolute', left: '-30px', top: '50%', transform: 'translateY(-50%)' }} width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <defs>
                                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="50%" style={{ stopColor: 'mediumpurple', stopOpacity: 1 }} />
                                                <stop offset="100%" style={{ stopColor: 'darkviolet', stopOpacity: 1 }} />
                                            </linearGradient>
                                        </defs>
                                        <path d="M18 0H6C4.9 0 4 0.9 4 2V14C4 15.1 4.9 16 6 16H18C19.1 16 20 15.1 20 14V2C20 0.9 19.1 0 18 0ZM18 14H6V2H18V14ZM10.5 13C11.163 13 11.7989 12.7366 12.2678 12.2678C12.7366 11.7989 13 11.163 13 10.5V5H15C15.5523 5 16 4.55228 16 4V4C16 3.44772 15.5523 3 15 3H12V8.51C11.58 8.19
11.07 8 10.5 8C9.83696 8 9.20107 8.26339 8.73223 8.73223C8.26339 9.20107 8 9.83696 8 10.5C8 11.163 8.26339 11.7989 8.73223 12.2678C9.20107 12.7366 9.83696 13 10.5 13ZM2 5C2 4.44772 1.55228 4 1 4V4C0.447715 4 0 4.44772 0 5V18C0 19.1 0.9 20 2 20H15C15.5523 20 16 19.5523 16 19V19C16 18.4477 15.5523 18 15 18H2V5Z" fill="url(#gradient)"></path>
                                    </svg>
                                    Альбомы
                                </NavLink>
                            </li>
                            <li style={{ position: 'relative' }}>
                                <NavLink to={`/sidebarpages/${encodeURIComponent("https://zvon.top/collections")}`} activeClassName="active">
                                    <svg style={{ position: 'absolute', left: '-30px', top: '50%', transform: 'translateY(-50%)' }} width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <defs>
                                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="50%" style={{ stopColor: 'mediumpurple', stopOpacity: 1 }} />
                                                <stop offset="100%" style={{ stopColor: 'darkviolet', stopOpacity: 1 }} />
                                            </linearGradient>
                                        </defs>
                                        <path d="M9.57143 6.32143H18.1429M9.57143 1.5H18.1429M1 16.5H18.1429M1 11.1429H18.1429" stroke="url(#gradient)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                                        <path d="M1 1.5L5.28571 4.17857L1 6.85714V1.5Z" stroke="url(#gradient)" stroke-width="2" stroke-linejoin="round"></path>
                                    </svg>
                                    Сборники
                                </NavLink>
                            </li>
                            <li style={{ position: 'relative' }}>
                                <NavLink to={`/sidebarpages/${encodeURIComponent("https://zvon.top/genres")}`} activeClassName="active">
                                    <svg style={{ position: 'absolute', left: '-30px', top: '50%', transform: 'translateY(-50%)' }} width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                        <defs>
                                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="50%" style={{ stopColor: 'mediumpurple', stopOpacity: 1 }} />
                                                <stop offset="100%" style={{ stopColor: 'darkviolet', stopOpacity: 1 }} />
                                            </linearGradient>
                                        </defs>
                                        <circle cx="10" cy="10" r="8" stroke="url(#gradient)" strokeWidth="2" fill="none" />
                                        <circle cx="10" cy="10" r="2" fill="url(#gradient)" />
                                    </svg>
                                    Жанры
                                </NavLink>
                            </li>
                            <li style={{ position: 'relative' }}>
                                <NavLink to={`/sidebarpages/${encodeURIComponent("https://zvon.top/radio-online")}`} activeClassName="active">
                                    <svg style={{ position: 'absolute', left: '-32px', top: '48%', transform: 'translateY(-50%)' }} width="23" height="23" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="url(#gradient)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <defs>
                                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="50%" style={{ stopColor: 'mediumpurple', stopOpacity: 1 }} />
                                                <stop offset="100%" style={{ stopColor: 'darkviolet', stopOpacity: 1 }} />
                                            </linearGradient>
                                        </defs>
                                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                                        <circle cx="10" cy="13" r="3"></circle>
                                        <line x1="2" y1="7" x2="19" y2="2"></line>
                                    </svg>
                                    Радио
                                </NavLink>
                            </li>
                            {/*<li><NavLink to={`/sidebarpages/${encodeURIComponent("https://zvon.top/charts")}`} activeClassName="active">Топ чарты</NavLink></li>*/}
                            {userID && (
                                <div>
                                    <div>
                                        <Link style={{ position: 'relative' }} onClick={event => this.toggleMenu(event)}>
                                            <svg style={{ position: 'absolute', left: '-30px', top: '50%', transform: 'translateY(-50%)' }} width="20" height="20" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                                                <defs>
                                                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                        <stop offset="50%" style={{ stopColor: 'mediumpurple', stopOpacity: 1 }} />
                                                        <stop offset="100%" style={{ stopColor: 'darkviolet', stopOpacity: 1 }} />
                                                    </linearGradient>
                                                </defs>
                                                <path fill="none" stroke="url(#gradient)" strokeWidth="3" d="M16.043 28.627C12.139 25.028 2 15.543 2 9.344 2 5.082 5.582 2 10.186 2 13.07 2 15.327 3.72 16 4.347 16.673 3.72 18.931 2 21.814 2 26.418 2 30 5.082 30
9.344c0 6.199-10.14 15.684-13.957 19.283l-.485.408-.515-.408z" strokeLinejoin="round"></path>
                                            </svg>
                                            Избранные
                                        </Link>
                                        {isMenuOpen && (
                                            <div>
                                                <NavLink to="/userplaylistsongs/favorites" style={{ marginLeft: '20px', position: 'relative' }} activeClassName="active">
                                                    <svg style={{ position: 'absolute', left: '-30px', top: '50%', transform: 'translateY(-50%)' }} width="20" height="20" viewBox="0 0 15 18" xmlns="http://www.w3.org/2000/svg">
                                                        <defs>
                                                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                                <stop offset="50%" style={{ stopColor: 'mediumpurple', stopOpacity: 1 }} />
                                                                <stop offset="100%" style={{ stopColor: 'darkviolet', stopOpacity: 1 }} />
                                                            </linearGradient>
                                                        </defs>
                                                        <path d="M7.14689 1.0221C7.0721 0.999093 6.99295 0.993962 6.91582 1.00712C6.83869 1.02027 6.76572 1.05135 6.70279 1.09785C6.63985 1.14434 6.58871 1.20496 6.55347
1.27482C6.51823 1.34468 6.49988 1.42184 6.4999 1.50009V11.4049C5.95383 10.881 5.24206 10.5641 4.48734 10.5088C3.73262 10.4535 2.98227 10.6634 2.3657 11.1021C1.74913 11.5408 1.30499 12.181 1.10988 12.9121C0.914771 13.6433 0.980927 14.4196 1.29694 15.1072C1.61295 15.7948 2.159 16.3506 2.84092
16.6787C3.52284 17.0068 4.29787 17.0866 5.03236 16.9044C5.76684 
16.7222 6.41472 16.2894 6.86427 15.6807C7.31381 15.072 7.53684 14.3254 7.49488 13.5699C7.49816 13.5467 7.49983 13.5233 7.49988 13.4999V6.177L13.3528 7.97696C13.4275 7.99994 13.5065 8.00509 13.5836 7.99198C13.6606 7.97888 13.7336 7.94789 13.7965 7.90151C13.8594 7.85513 13.9105 7.79464 
13.9458 7.72491C13.9811 7.65518 13.9996 7.57813 13.9998 7.49997V4.97702C13.9999
4.44227 13.8285 3.92158 13.5108 3.49141C13.1931 3.06125 12.7459 2.74428 12.2348 2.58707L7.14689 1.0221ZM12.9998 6.82299L7.49988 5.13102V2.17707L11.9408 3.54305C12.2475 3.63738 12.5158 3.82756 12.7064 4.08566C12.897 4.34376 12.9998 4.65617 12.9998 4.97702V6.82299ZM1.99998 13.7499C1.99998
13.1531 2.23703 12.5808 2.65898 12.1589C3.08093 11.7369 3.65321 11.4999 4.24994
11.4999C4.84667 11.4999 5.41895 11.7369 5.8409
12.1589C6.26285 12.5808 6.4999 13.1531 6.4999 13.7499C6.4999 14.3466 6.26285 14.9189 5.8409 15.3408C5.41895 15.7628 4.84667 15.9998 4.24994 15.9998C3.65321 15.9998 3.08093 15.7628 2.65898 15.3408C2.23703 14.9189 1.99998 14.3466 1.99998 13.7499Z" stroke-width="0.8" fill="url(#gradient)"></path>
                                                    </svg>
                                                    Музыка
                                                </NavLink>
                                                <NavLink to="/userfavoriteartists/artists" style={{ marginLeft: '20px', position: 'relative' }} activeClassName="active">
                                                    <svg style={{ position: 'absolute', left: '-30px', top: '50%', transform: 'translateY(-50%)' }} width="20" height="20" viewBox="0 0 19 18" xmlns="http://www.w3.org/2000/svg">
                                                        <defs>
                                                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                                <stop offset="50%" style={{ stopColor: 'mediumpurple', stopOpacity: 1 }} />
                                                                <stop offset="100%" style={{ stopColor: 'darkviolet', stopOpacity: 1 }} />
                                                            </linearGradient>
                                                        </defs>
                                                        <path d="M8.5 7.125C10.0533 7.125 11.3125 5.8658 11.3125 4.3125C11.3125 2.7592 10.0533 1.5 8.5 1.5C6.9467 1.5 5.6875 2.7592 5.6875 4.3125C5.6875 5.8658 6.9467 7.125 8.5 7.125Z" stroke="url(#gradient)" stroke-width="2"></path>
                                                        <path d="M14.125 16.5C15.1605 16.5 16 15.6605 16 14.625C16 13.5895 15.1605 12.75 14.125 12.75C13.0895 12.75 12.25 13.5895 12.25 14.625C12.25 15.6605 13.0895 16.5 14.125 16.5Z" stroke="url(#gradient)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                                                        <path d="M8.81969 16.5H2.875C2.37772 16.5 1.90081 16.3025 1.54917 15.9508C1.19754 15.5992 1 15.1223 1 14.625C1 13.6304 1.39509 12.6766 2.09835 11.9733C2.80161 11.2701 3.75544 10.875 4.75 10.875H9.9325M16 14.625V8.0625L17.875 9.9375" stroke="url(#gradient)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                                                    </svg>
                                                    Исполнители
                                                </NavLink>
                                                <NavLink to="/userfavoriteartists/albums" style={{ marginLeft: '20px', position: 'relative' }} activeClassName="active">
                                                    <svg style={{ position: 'absolute', left: '-30px', top: '50%', transform: 'translateY(-50%)' }} width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                        <defs>
                                                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                                <stop offset="50%" style={{ stopColor: 'mediumpurple', stopOpacity: 1 }} />
                                                                <stop offset="100%" style={{ stopColor: 'darkviolet', stopOpacity: 1 }} />
                                                            </linearGradient>
                                                        </defs>
                                                        <path d="M18 0H6C4.9 0 4 0.9 4 2V14C4 15.1 4.9 16 6 16H18C19.1 16 20 15.1 20 14V2C20 0.9 19.1 0 18 0ZM18 14H6V2H18V14ZM10.5 13C11.163 13 11.7989 12.7366 12.2678 12.2678C12.7366 11.7989 13 11.163 13 10.5V5H15C15.5523 5 16 4.55228 16 4V4C16 3.44772 15.5523 3 15 3H12V8.51C11.58 8.19
11.07 8 10.5 8C9.83696 8 9.20107 8.26339 8.73223 8.73223C8.26339 9.20107 8 9.83696 8 10.5C8 11.163 8.26339 11.7989 8.73223 12.2678C9.20107 12.7366 9.83696 13 10.5 13ZM2 5C2 4.44772 1.55228 4 1 4V4C0.447715 4 0 4.44772 0 5V18C0 19.1 0.9 20 2 20H15C15.5523 20 16 19.5523 16 19V19C16 18.4477 15.5523 18 15 18H2V5Z" fill="url(#gradient)"></path>
                                                    </svg>
                                                    Альбомы
                                                </NavLink>
                                                <NavLink to="/userfavoriteartists/collections" style={{ marginLeft: '20px', position: 'relative' }} activeClassName="active">
                                                    <svg style={{ position: 'absolute', left: '-30px', top: '50%', transform: 'translateY(-50%)' }} width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                        <defs>
                                                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                                <stop offset="50%" style={{ stopColor: 'mediumpurple', stopOpacity: 1 }} />
                                                                <stop offset="100%" style={{ stopColor: 'darkviolet', stopOpacity: 1 }} />
                                                            </linearGradient>
                                                        </defs>
                                                        <path d="M9.57143 6.32143H18.1429M9.57143 1.5H18.1429M1 16.5H18.1429M1 11.1429H18.1429" stroke="url(#gradient)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                                                        <path d="M1 1.5L5.28571 4.17857L1 6.85714V1.5Z" stroke="url(#gradient)" stroke-width="2" stroke-linejoin="round"></path>
                                                    </svg>
                                                    Сборники
                                                </NavLink>
                                                <NavLink to="/userfavoriteartists/radio" style={{ marginLeft: '20px', position: 'relative' }} activeClassName="active">
                                                    <svg style={{ position: 'absolute', left: '-32px', top: '48%', transform: 'translateY(-50%)' }} width="23" height="23" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="url(#gradient)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                        <defs>
                                                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                                <stop offset="50%" style={{ stopColor: 'mediumpurple', stopOpacity: 1 }} />
                                                                <stop offset="100%" style={{ stopColor: 'darkviolet', stopOpacity: 1 }} />
                                                            </linearGradient>
                                                        </defs>
                                                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                                                        <circle cx="10" cy="13" r="3"></circle>
                                                        <line x1="2" y1="7" x2="19" y2="2"></line>
                                                    </svg>
                                                    Радио
                                                </NavLink>
                                            </div>
                                        )}
                                    </div>
                                    <li style={{ position: 'relative' }}>
                                        <NavLink to={`/userplaylists`} activeClassName="active">
                                            <svg style={{ position: 'absolute', left: '-30px', top: '50%', transform: 'translateY(-50%)' }} width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                <defs>
                                                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                        <stop offset="50%" style={{ stopColor: 'mediumpurple', stopOpacity: 1 }} />
                                                        <stop offset="100%" style={{ stopColor: 'darkviolet', stopOpacity: 1 }} />
                                                    </linearGradient>
                                                    <mask id="myMask">
                                                        <rect x="0" y="0" width="20" height="20" fill="white" />
                                                        <rect x="0" y="1" width="12" height="17" fill="black" />
                                                    </mask>
                                                </defs>
                                                <circle cx="12" cy="10" r="8" fill="url(#gradient)" mask="url(#myMask)" />
                                                <circle cx="12" cy="10" r="3" fill="black" mask="url(#myMask)" />
                                                <rect x="0" y="1" width="12" height="17" fill="none" stroke="url(#gradient)" strokeWidth="2" rx="2" ry="2" />
                                            </svg>
                                        Мои плейлисты
                                        </NavLink>
                                    </li>
                                </div>
                            )}
                            {(userID == 1) && (
                                <li style={{ position: 'relative' }}>
                                    <NavLink to={`/users`} activeClassName="active">
                                        <svg style={{ position: 'absolute', left: '-30px', top: '50%', transform: 'translateY(-50%)' }} width="15.8" height="15.8" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                                            <defs>
                                                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                    <stop offset="50%" style={{ stopColor: 'mediumpurple', stopOpacity: 1 }} />
                                                    <stop offset="100%" style={{ stopColor: 'darkviolet', stopOpacity: 1 }} />
                                                </linearGradient>
                                            </defs>
                                            <path d="M8 8C10.21 8 12 6.21 12 4C12 1.79 10.21 0 8 0C5.79 0 4 1.79 4 4C4 6.21 5.79 8 8 8ZM8 10C5.33 10 0 11.34 0 14V16H16V14C16 11.34 10.67 10 8 10Z" fill="url(#gradient)" />
                                        </svg>
                                        Пользователи
                                    </NavLink>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            );
        }
        else {
        }
    }
}