import React, { Component } from 'react';
import { Route, Routes } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import { Layout } from './components/Layout';
import './custom.css';
import { ArtistPage } from './components/ArtistPage';
import { SongPage } from './components/SongPage';
import { MusicProvider } from './components/MusicContext';
import { PlayMenu } from './components/PlayMenu';
import { SearchPage } from './components/SearchPage';
import { SideBarPages } from './components/SideBarPages';
import { UserPlaylists } from './components/UserPlaylists';
import { UserPlaylistSongs } from './components/UserPlaylistSongs';
import { UserFavoriteArtists } from './components/UserFavoriteArtists';
import { Users } from './components/Users';
import { Profile } from './components/Profile';
export default class App extends Component {
    static displayName = App.name;

    render() {
        return (
            <Layout>
                <MusicProvider>
                    <Routes>
                        {AppRoutes.map((route, index) => {
                            const { element, ...rest } = route;
                            return <Route key={index} {...rest} element={element} />;
                        })}
                        <Route path="/artist/:artistUrl" element={<ArtistPage />} />
                        <Route path="/song/:songUrl" element={<SongPage />} />
                        <Route path="/search/:searchUrl" element={<SearchPage />} />
                        <Route path="/sidebarpages/:Url" element={<SideBarPages />} />
                        <Route path="/userplaylists" element={<UserPlaylists />} />
                        <Route path="/userplaylistsongs/:playlistId" element={<UserPlaylistSongs />} />
                        <Route path="/userfavoriteartists/:type" element={<UserFavoriteArtists />} />
                        <Route path="/users" element={<Users />} />
                        <Route path="/profile" element={<Profile />} />
                    </Routes>
                    <PlayMenu />
                </MusicProvider>
            </Layout>
        );
    }
}
