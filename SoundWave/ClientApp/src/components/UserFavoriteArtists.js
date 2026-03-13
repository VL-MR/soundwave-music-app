import React, { useEffect, useState, useContext } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { MusicContext } from './MusicContext';
import './NavMenu.css';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import axios from 'axios';
export function UserFavoriteArtists() {
    const { currentTrack, setCurrentTrack, musicTracks, setMusicTracks } = useContext(MusicContext);
    const [open, setOpen] = useState(false);
    const [artists, setArtists] = useState([]);
    const [artistToDelete, setArtistToDelete] = useState(null);
    const { type } = useParams();
    const userID = localStorage.getItem('userID');
    useEffect(() => {
        axios.get(`/favoriteartist?userID=${userID}`)
            .then(response => {
                const filteredArtists = response.data.filter(artist => artist.favoriteArtistType === type);
                setArtists(filteredArtists);
            })
            .catch(error => {
                console.error(`Error fetching data: ${error}`);
            })
    }, [type, userID]);


    const handlePlayTrack = (track) => {
        const transformedArtists = artists.map(artist => ({
            id: artist.favoriteArtistID,
            title: artist.favoriteArtistName,
            url: artist.favoriteArtistUrl,
            image: artist.favoriteArtistImage,
        }));
        const transformedTrack = {
            id: track.favoriteArtistID,
            title: track.favoriteArtistName,
            url: track.favoriteArtistUrl,
            image: track.favoriteArtistImage,
        };
        setMusicTracks(transformedArtists);
        if (currentTrack && currentTrack.id === transformedTrack.id) {
            setCurrentTrack(null);
        } else {
            if (currentTrack) {
                setCurrentTrack(null);
            }
            setCurrentTrack(transformedTrack);
        }
    }

    const handleDelete = () => {
        axios.delete(`/favoriteartist?userID=${userID}&id=${artistToDelete.favoriteArtistID}`)
            .then(() => {
                setArtists(artists.filter(artist => artist.favoriteArtistID !== artistToDelete.favoriteArtistID));
                setOpen(false);
            })
            .catch(error => {
                console.error(`Error deleting artist: ${error}`);
            });
    }

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
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle style={{ backgroundColor: '#141516', color: 'white' }}>Вы уверены?</DialogTitle>
                <DialogActions style={{ backgroundColor: '#141516', color: 'white' }}>
                    <Button onClick={() => handleDelete()} color="primary">
                        Подтвердить
                    </Button>
                    <Button onClick={() => setOpen(false)} color="primary">
                        Отмена
                    </Button>
                </DialogActions>
            </Dialog>
            {artists && (
                <div className="artist-grid">
                    {artists.map((artist, index) => (
                        <div
                            key={index}
                            className="artist-tile"
                            onClick={() => {
                                if (type === 'radio') {
                                    handlePlayTrack(artist);
                                }
                            }}
                        >
                            {type === 'radio' ? (
                                <>
                                    <LazyLoadImage src={!artist.favoriteArtistImage.includes("/") ? `/file/${artist.favoriteArtistImage}` : artist.favoriteArtistImage} alt={artist.favoriteArtistName} effect="blur" />
                                    <p>{artist.favoriteArtistName}</p>
                                </>
                            ) : (
                                <Link to={`/artist/${artist.favoriteArtistUrl}`} style={{ textDecoration: 'none', color: 'white' }}>
                                        <LazyLoadImage src={!artist.favoriteArtistImage.includes("/") ? `/file/${artist.favoriteArtistImage}` : artist.favoriteArtistImage} alt={artist.favoriteArtistName} effect="blur" />
                                    <p>{artist.favoriteArtistName}</p>
                                </Link>
                            )}
                            <div className="delete-icon-wrapper" onClick={(event) => {
                                event.stopPropagation();
                                setArtistToDelete(artist);
                                setOpen(true);
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
