import {useCallback, useEffect, useRef, useState} from 'react';
import etherealTrack from '../../atlasaudio-ethereal-ambient-512265.mp3';
import dreamscapeTrack from '../../morgan-ambient-calm-ambient-dreamscape-529861.mp3';
import './MusicPlayer.css';

const tracks = [etherealTrack, dreamscapeTrack];
const preferenceKey = 'kaius-background-music';

function savedSoundPreference() {
  try {
    const saved = localStorage.getItem(preferenceKey);
    return saved === null ? false : JSON.parse(saved);
  } catch {
    return false;
  }
}

export default function MusicPlayer() {
  const audioRef = useRef(null);
  const [trackIndex, setTrackIndex] = useState(0);
  const [soundOn, setSoundOn] = useState(savedSoundPreference);
  const [needsInteraction, setNeedsInteraction] = useState(false);

  const startPlayback = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return false;

    try {
      await audio.play();
      setNeedsInteraction(false);
      return true;
    } catch {
      setNeedsInteraction(true);
      return false;
    }
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.32;
    audio.muted = !soundOn;
    try {
      localStorage.setItem(preferenceKey, JSON.stringify(soundOn));
    } catch {
      // Music still works when browser storage is unavailable.
    }
  }, [soundOn]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.load();
    startPlayback();
  }, [trackIndex, startPlayback]);

  useEffect(() => {
    if (!needsInteraction) return;

    const unlockPlayback = (event) => {
      if (event.target instanceof Element && event.target.closest('.music-toggle')) return;
      startPlayback();
    };

    window.addEventListener('pointerdown', unlockPlayback, {once: true});
    window.addEventListener('keydown', unlockPlayback, {once: true});
    return () => {
      window.removeEventListener('pointerdown', unlockPlayback);
      window.removeEventListener('keydown', unlockPlayback);
    };
  }, [needsInteraction, startPlayback]);

  const toggleSound = async () => {
    const audio = audioRef.current;

    if (!soundOn) {
      if (audio) audio.muted = false;
      setSoundOn(true);
      await startPlayback();
      return;
    }

    if (audio) audio.muted = true;
    setSoundOn(false);
    if (audio?.paused) startPlayback();
  };

  const audible = soundOn && !needsInteraction;
  const label = audible
    ? '关闭背景音乐 / Mute background music'
    : '开启背景音乐 / Play background music';

  return (
    <div className="music-control">
      <audio
        ref={audioRef}
        src={tracks[trackIndex]}
        preload="auto"
        muted={!soundOn}
        onEnded={() => setTrackIndex((current) => (current + 1) % tracks.length)}
      />
      <button
        type="button"
        className={`music-toggle ${audible ? 'is-playing' : 'is-muted'}`}
        onClick={toggleSound}
        aria-label={label}
        aria-pressed={audible}
        title={label}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9 18V5l11-2v13M9 8l11-2M9 18c0 4-7 4-7 0s7-4 7 0Zm11-2c0 4-7 4-7 0s7-4 7 0Z" />
          {!audible && <path className="music-muted-line" d="M4 4 21 21" />}
        </svg>
      </button>
    </div>
  );
}
