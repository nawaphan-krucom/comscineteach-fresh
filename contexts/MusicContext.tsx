/* eslint-disable react-refresh/only-export-components */

import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';

export const MUSIC_PLAYLIST = [
  { 
    title: "Paris in the Rain", 
    artist: "Lauv", 
    cover: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=2070&auto=format&fit=crop",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" 
  },
  { 
    title: "I Like Me Better", 
    artist: "Lauv", 
    cover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=2070&auto=format&fit=crop",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
  },
  { 
    title: "The Simple Things", 
    artist: "Michael Carreon", 
    cover: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=2070&auto=format&fit=crop",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3"
  },
  { 
    title: "Perfect", 
    artist: "Ed Sheeran", 
    cover: "https://images.unsplash.com/photo-1516280440614-6697288d5d38?q=80&w=2070&auto=format&fit=crop",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3"
  },
  { 
    title: "Thinking Out Loud", 
    artist: "Ed Sheeran", 
    cover: "https://images.unsplash.com/photo-1485217988980-11786ced9454?q=80&w=2070&auto=format&fit=crop",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
  },
  { 
    title: "Gravity", 
    artist: "John Mayer", 
    cover: "https://images.unsplash.com/photo-1459749411177-287ce3276911?q=80&w=2070&auto=format&fit=crop",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3"
  },
  { 
    title: "I'm Yours", 
    artist: "Jason Mraz", 
    cover: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
  },
  { 
    title: "Lucky", 
    artist: "Jason Mraz ft. Colbie Caillat", 
    cover: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=2070&auto=format&fit=crop",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3"
  },
  { 
    title: "Summertime Sadness", 
    artist: "Lana Del Rey", 
    cover: "https://images.unsplash.com/photo-1504198266287-1659872e6590?q=80&w=2070&auto=format&fit=crop",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3"
  },
  { 
    title: "Apocalypse", 
    artist: "Cigarettes After Sex", 
    cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3"
  },
  { 
    title: "Ocean Eyes", 
    artist: "Billie Eilish", 
    cover: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070&auto=format&fit=crop",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3"
  }
];

interface MusicContextType {
  isPlaying: boolean;
  togglePlay: () => void;
  playNext: () => void;
  currentSong: typeof MUSIC_PLAYLIST[0];
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentSong = MUSIC_PLAYLIST[currentSongIndex];

  const togglePlay = () => setIsPlaying(prev => !prev);

  const playNext = () => {
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * MUSIC_PLAYLIST.length);
    } while (MUSIC_PLAYLIST.length > 1 && nextIndex === currentSongIndex);
    
    setCurrentSongIndex(nextIndex);
    setIsPlaying(true);
  };

  useEffect(() => {
    if (audioRef.current) {
        if (isPlaying) {
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    // Ignore AbortError which happens when pausing while loading or switching sources rapidly
                    if (error.name === 'AbortError') {
                        return; 
                    }
                    
                    console.error("Audio playback error:", error);
                    
                    // Only stop playing if it's a permission/interaction issue
                    if (error.name === 'NotAllowedError') {
                        setIsPlaying(false);
                    }
                });
            }
        } else {
            audioRef.current.pause();
        }
    }
  }, [isPlaying, currentSongIndex]);

  return (
    <MusicContext.Provider value={{ isPlaying, togglePlay, playNext, currentSong }}>
      {children}
      <audio 
        ref={audioRef} 
        src={currentSong.src} 
        onEnded={playNext}
        loop={false}
      />
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};
