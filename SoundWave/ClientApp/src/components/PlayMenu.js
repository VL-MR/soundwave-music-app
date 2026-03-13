import React, { useContext } from 'react';
import { MusicContext } from './MusicContext';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import './NavMenu.css';

export function PlayMenu() {
    const { currentTrack, setCurrentTrack, musicTracks, videoRef, playing, setPlaying, currentTime, setCurrentTime } = useContext(MusicContext);
    const trackIndex = musicTracks.indexOf(currentTrack);
    const playNextTrack = () => {
        const nextTrackIndex = trackIndex < musicTracks.length - 1 ? trackIndex + 1 : 0;
        setCurrentTrack(musicTracks[nextTrackIndex]);
    };

    const playPrevTrack = () => {
        const prevTrackIndex = trackIndex > 0 ? trackIndex - 1 : musicTracks.length - 1;
        setCurrentTrack(musicTracks[prevTrackIndex]);
    };

    const getTrackSrc = (url) => {
        if (!url) return '';

        if (!url.includes('/')) {
            return `/file/${encodeURIComponent(url)}`;
        }

        if (url.includes('zvon.top')) {
            const tail = url.replace(/^https?:\/\/[^/]+\//i, '');
            return `/fileproxy/${encodeURIComponent(tail)}`;
        }

        return url;
    };


    const src = getTrackSrc(currentTrack?.url);
    return (
        <div className="content-container" style={{ backgroundColor: 'rgb(10, 10, 10)', position: 'fixed', bottom: 0, left: 0, right: 0, padding: '10px', display: 'flex', boxShadow: '0 0 3px 0 rgba(0, 0, 0, 0.2)' }}>
            {currentTrack && (
                <div style={{ marginRight: '10px' }}>
                    {currentTrack.image && <img src={currentTrack.isAdd && !currentTrack.image.includes("/") ? `/file/${currentTrack.image}` : currentTrack.image} style={{ width: '125px', height: '125px', borderRadius: '20px' }} />}
                </div>
            )}
            <div style={{ color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flex: '1' }}>
                {currentTrack && (
                    <div>
                        <p style={{ margin: '0', marginLeft: '15px', fontWeight: 'normal' }}>{currentTrack.title || currentTrack.name}</p>
                        <p style={{ margin: '0', marginLeft: '15px', fontWeight: 'normal' }}>{currentTrack.artist}</p>
                    </div>
                )}

                <AudioPlayer
                    autoPlay
                    /*{src={currentTrack && currentTrack.url ? (currentTrack.url.includes("/") ? `/fileproxy/${currentTrack.url}` : `/file/${currentTrack.url}`) : ''}}*/
                    src={src}
                    onEnded={playNextTrack}
                    onClickNext={playNextTrack}
                    onClickPrevious={playPrevTrack}
                    showSkipControls={true}
                    showJumpControls={false}
                    customAdditionalControls={[]}
                    style={{ backgroundColor: 'rgb(10, 10, 10)', boxShadow: 'none' }}
                    /*onPlay={() => setPlaying(true)}
                    onPause={() => setPlaying(false)}
                    onSeeked={event => {
                        //console.log(event.target.currentTime);
                        //videoRef.current && videoRef.current.seek(event.target.currentTime);
                        //if (videoRef.current) {
                        //    console.log("Video current time before seek: " + videoRef.current.getCurrentTime());
                        //}
                        setCurrentTime(event.target.currentTime);
                        //try {
                        //    videoRef.current && videoRef.current.seekTo(event.target.currentTime, 'seconds');
                        //} catch (e) {
                        //}
                        //if (videoRef.current) {
                        //    console.log("Video current time after seek: " + videoRef.current.getCurrentTime());
                        //}
                    }}*/
                />
            </div>
        </div>
    );
}