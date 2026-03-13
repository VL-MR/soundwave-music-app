import React, { useEffect, useState } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import { Link } from 'react-router-dom';
import './NavMenu.css';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import axios from 'axios';
export function UserPlaylists() {
    const [open, setOpen] = useState(false);
    const [open2, setOpen2] = useState(false);
    const [playlists, setPlaylists] = useState([]);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [newPlaylistImage, setNewPlaylistImage] = useState('');
    const [playlistToDelete, setPlaylistToDelete] = useState('');
    const userID = localStorage.getItem('userID');
    const username = localStorage.getItem('username');
    const dirName = `${userID}${username}`;

    useEffect(() => {
        axios.get(`/playlist?userID=${userID}`)
            .then(response => {
                //const filteredPlaylists = response.data.filter(playlist => playlist.playlistName !== "Избранная музыка");
                const filteredPlaylists = response.data.slice(1);
                setPlaylists(filteredPlaylists);
            })
            .catch(error => {
                console.error(`Error fetching data: ${error}`);
            })
    }, [userID]);

    const addPlaylist = (playlist) => {
        const playlistWithUser = { ...playlist, UserID: userID };
        axios.post('/playlist', playlistWithUser)
            .then(response => {
                setPlaylists([...playlists, response.data]);
            })
            .catch(error => {
                console.error(`Error adding playlist: ${error}`);
            })
    };

    const handleSave = () => {
        const playlist = {
            PlaylistName: newPlaylistName,
            PlaylistImage: newPlaylistImage.name,
        };
        addPlaylist(playlist);
        const formData = new FormData();
        formData.append('file', newPlaylistImage);
        if (newPlaylistImage) {
            axios.post(`/file/${dirName}`, formData)
                .catch(error => {
                    console.log(error);
                });
        }
        setOpen(false);
    };

    const handleDelete = () => {
        axios.delete(`/playlist/${playlistToDelete.playlistID}`)
            .then(() => {
                setPlaylists(playlists.filter(playlist => playlist.playlistID !== playlistToDelete.playlistID));
            })
            .catch(error => {
                console.error(`Error deleting playlist: ${error}`);
            })
        axios.delete(`/file/${dirName}/${playlistToDelete.playlistImage}`)
            .catch(error => {
                console.log(error);
            });
        setOpen2(false);
    };

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
            <Dialog open={open2} onClose={() => setOpen2(false)}>
                <DialogTitle style={{ backgroundColor: '#141516', color: 'white' }}>Вы уверены?</DialogTitle>
                <DialogActions style={{ backgroundColor: '#141516', color: 'white' }}>
                    <Button onClick={() => handleDelete()} color="primary">
                        Подтвердить
                    </Button>
                    <Button onClick={() => setOpen2(false)} color="primary">
                        Отмена
                    </Button>
                </DialogActions>
            </Dialog>
            <Button variant="outlined" color="primary" onClick={() => setOpen(true)}>
                Добавить плейлист
            </Button>
            <Dialog open={open}
                onClose={() => {
                    setOpen(false);
                    setNewPlaylistName('');
                    setNewPlaylistImage(null);
                }}>
                <DialogTitle style={{ backgroundColor: '#141516', color: 'white' }}>Добавить новый плейлист</DialogTitle>
                <DialogContent style={{ backgroundColor: '#141516', color: 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingBottom: '50px', position: 'relative' }}>
                        <img
                            src={newPlaylistImage ? URL.createObjectURL(newPlaylistImage) : "/images/unknown_artist.jpg"}
                            alt="preview"
                            style={{ width: '200px', height: '200px', marginTop: '10px', borderRadius: '10px' }}
                        />
                        <label style={{ position: 'absolute', top: '0', left: '50px', marginTop: '10px', width: '200px', height: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', opacity: '0', transition: 'opacity 0.3s' }} onMouseOver={e => e.currentTarget.style.opacity = '1'} onMouseOut={e => e.currentTarget.style.opacity = '0'}>
                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', color: 'white', width: '100%', height: '100%', borderRadius: '10px' }}>
                                <span style={{ fontSize: '50px' }}>+</span>
                                <span>{newPlaylistImage ? "Изменить изображение" : "Добавить изображение"}</span>
                            </div>
                            <input type="file" accept="image/*" onChange={e => setNewPlaylistImage(e.target.files[0])} style={{ display: 'none' }} />
                        </label>
                    </div>
                    <div className="search-bar" style={{ width: '300px' }}>
                        <input style={{ paddingLeft: '15px', outline: 'none' }} type="text" placeholder="Имя плейлиста" onChange={e => setNewPlaylistName(e.target.value)} />
                    </div>
                </DialogContent>
                <DialogActions style={{ backgroundColor: '#141516', color: 'white' }}>
                    <Button onClick={handleSave} color="primary">
                        Сохранить
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
            {playlists && (
                <div className="artist-grid">
                    {playlists.map((playlist, index) => (
                        <div key={index} className="artist-tile">
                            <Link to={`/userplaylistsongs/${playlist.playlistID}`} style={{ textDecoration: 'none', color: 'white' }}>
                                <LazyLoadImage src={`/file/${dirName}/${playlist.playlistImage}`} alt={playlist.playlistName} effect="blur" />
                                <p>{playlist.playlistName}</p>
                            </Link>
                            <div className="delete-icon-wrapper" onClick={(event) => {
                                event.stopPropagation();
                                setPlaylistToDelete(playlist);
                                setOpen2(true);
                            }}>
                                <TrashIcon />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}