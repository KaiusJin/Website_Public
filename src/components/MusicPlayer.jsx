import {useCallback, useEffect, useRef, useState} from 'react';
import etherealTrack from '../../atlasaudio-ethereal-ambient-512265.mp3';
import dreamscapeTrack from '../../morgan-ambient-calm-ambient-dreamscape-529861.mp3';
import './MusicPlayer.css';

const tracks = [etherealTrack, dreamscapeTrack];
const preferenceKey = 'kaius-background-music';
function savedSoundPreference() {
  try { return localStorage.getItem(preferenceKey) === 'true'; }
  catch { return false; }
}

export default function MusicPlayer() {
  const audioRef = useRef(null);
  const requested = useRef(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const [soundOn, setSoundOn] = useState(savedSoundPreference);
  const [needsInteraction, setNeedsInteraction] = useState(false);

  const startPlayback = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !requested.current) return;
    try {
      await audio.play();
      if (!requested.current) { audio.pause(); return; }
      setNeedsInteraction(false);
    } catch {
      if (requested.current) setNeedsInteraction(true);
    }
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    requested.current = soundOn;
    audio.volume = 0.32;
    try { localStorage.setItem(preferenceKey, String(soundOn)); }
    catch { /* Playback does not depend on browser storage. */ }
    if (soundOn) startPlayback();
    else audio.pause();
    return () => { requested.current = false; audio.pause(); };
  }, [soundOn, trackIndex, startPlayback]);

  useEffect(() => {
    if (!soundOn || !needsInteraction) return;
    const unlock = event => {
      if (event.target instanceof Element && event.target.closest('.music-toggle')) return;
      startPlayback();
    };
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, [soundOn, needsInteraction, startPlayback]);

  const toggleSound = () => {
    if (soundOn && needsInteraction) { startPlayback(); return; }
    requested.current = !soundOn;
    if (soundOn) audioRef.current.pause();
    setNeedsInteraction(false);
    setSoundOn(value => !value);
  };
  const audible = soundOn && !needsInteraction;
  const label = audible ? '关闭背景音乐 / Mute background music' : '开启背景音乐 / Play background music';

  return (
    <div className="music-control">
      <audio ref={audioRef} src={soundOn ? tracks[trackIndex] : undefined} preload="none"
        onEnded={() => setTrackIndex(current => (current + 1) % tracks.length)} />
      <button type="button" className={`music-toggle ${audible ? 'is-playing' : 'is-muted'}`}
        onClick={toggleSound} aria-label={label} aria-pressed={audible} title={label}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9 18V5l11-2v13M9 8l11-2M9 18c0 4-7 4-7 0s7-4 7 0Zm11-2c0 4-7 4-7 0s7-4 7 0Z" />
          {!audible && <path className="music-muted-line" d="M4 4 21 21" />}
        </svg>
      </button>
    </div>
  );
}
