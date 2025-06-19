import { useState, useEffect, useRef } from 'react'
import './App.css'
import SpotifyAPI, { type SpotifyTrack } from './utils/spotify'

function App() {
  const [hasEntered, setHasEntered] = useState(false)
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [typewriterText, setTypewriterText] = useState('')
  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack>({
    name: 'No track playing',
    artist: 'Spotify',
    image: '',
    isPlaying: false,
    progress: 0,
    duration: 0
  })
  const [customerCount, setCustomerCount] = useState(12)
  

  
  // Video ref for manual control (now video element)
  const videoRef = useRef<HTMLVideoElement>(null)
  // Audio ref for background music
  const audioRef = useRef<HTMLAudioElement>(null)
  // Ref for user profile combined for 3D effect
  const profileRef = useRef<HTMLDivElement>(null)
  
  // Initialize Spotify API instance
  const spotifyAPI = new SpotifyAPI()

  // Typewriter effect texts
  const texts = ['DEVELOPER', 'make a world', 'graphic designer']

  // Typewriter effect
  useEffect(() => {
    if (!hasEntered) return

    let timeoutId: number

    const typewriterInterval = setInterval(() => {
      const currentFullText = texts[currentTextIndex]
      
      if (!isDeleting) {
        // Typing
        if (typewriterText.length < currentFullText.length) {
          setTypewriterText(currentFullText.slice(0, typewriterText.length + 1))
        } else {
          // Wait then start deleting
          clearInterval(typewriterInterval)
          timeoutId = setTimeout(() => {
            setIsDeleting(true)
          }, 2500)
          return
        }
      } else {
        // Deleting
        if (typewriterText.length > 0) {
          setTypewriterText(typewriterText.slice(0, -1))
        } else {
          // Move to next text
          setIsDeleting(false)
          setCurrentTextIndex((prev) => (prev + 1) % texts.length)
        }
      }
    }, isDeleting ? 75 : 120)

    return () => {
      clearInterval(typewriterInterval)
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [typewriterText, currentTextIndex, isDeleting, hasEntered])

  // Initialize typewriter when user enters
  useEffect(() => {
    if (hasEntered && typewriterText === '' && !isDeleting) {
      // Start with first text after a small delay
      const timer = setTimeout(() => {
        setTypewriterText('')
        setCurrentTextIndex(0)
        setIsDeleting(false)
      }, 500)
      return () => clearTimeout(timer)
    }  }, [hasEntered])

  // Customer count animation
  useEffect(() => {
    if (!hasEntered) return

    const targetCount = 120
    const duration = 3000 // 3 seconds
    const increment = (targetCount - 12) / (duration / 50) // Update every 50ms

    let current = 12
    const timer = setInterval(() => {
      current += increment
      if (current >= targetCount) {
        setCustomerCount(targetCount)
        clearInterval(timer)
      } else {
        setCustomerCount(Math.floor(current))
      }
    }, 50)

    return () => clearInterval(timer)
  }, [hasEntered])

  // 3D Effect handler for user profile
  const handle3DEffect = (event: React.MouseEvent<HTMLDivElement>) => {
    const element = profileRef.current
    if (!element) return

    const rect = element.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Calculate relative position (0-1 for each dimension)
    const relativeX = x / rect.width
    const relativeY = y / rect.height

    // Remove all previous classes
    element.classList.remove(
      'corner-top-left', 'corner-top-right', 
      'corner-bottom-left', 'corner-bottom-right',
      'edge-top', 'edge-bottom', 'edge-left', 'edge-right'
    )

    // Define corner and edge zones
    const cornerThreshold = 0.3
    const edgeThreshold = 0.15

    // Determine which area the mouse is in
    if (relativeX < cornerThreshold && relativeY < cornerThreshold) {
      element.classList.add('corner-top-left')
    } else if (relativeX > (1 - cornerThreshold) && relativeY < cornerThreshold) {
      element.classList.add('corner-top-right')
    } else if (relativeX < cornerThreshold && relativeY > (1 - cornerThreshold)) {
      element.classList.add('corner-bottom-left')
    } else if (relativeX > (1 - cornerThreshold) && relativeY > (1 - cornerThreshold)) {
      element.classList.add('corner-bottom-right')
    } else if (relativeY < edgeThreshold) {
      element.classList.add('edge-top')
    } else if (relativeY > (1 - edgeThreshold)) {
      element.classList.add('edge-bottom')
    } else if (relativeX < edgeThreshold) {
      element.classList.add('edge-left')
    } else if (relativeX > (1 - edgeThreshold)) {
      element.classList.add('edge-right')
    }
  }

  // Reset 3D effect when mouse leaves
  const reset3DEffect = () => {
    const element = profileRef.current
    if (!element) return

    element.classList.remove(
      'corner-top-left', 'corner-top-right', 
      'corner-bottom-left', 'corner-bottom-right',
      'edge-top', 'edge-bottom', 'edge-left', 'edge-right'
    )
  }

  // Handle enter button click - directly enter main app
  const handleEnter = async () => {
    setHasEntered(true)
    
    // Small delay to ensure refs are ready
    setTimeout(async () => {
      // Start video
      if (videoRef.current) {
        try {
          videoRef.current.volume = 0; // Video sessiz olsun
          videoRef.current.loop = true;
          videoRef.current.muted = true;
          await videoRef.current.play();
          console.log('Video başlatıldı')
        } catch (error) {
          console.error('Video başlatma hatası:', error)
        }
      }
      
      // Start background music
      if (audioRef.current) {
        try {
          audioRef.current.volume = 0.4 // Set volume to 40%
          audioRef.current.loop = true
          audioRef.current.preload = 'auto'
          await audioRef.current.play()
          setIsMusicPlaying(true)
          console.log('Müzik başlatıldı')
        } catch (error) {
          console.error('Müzik başlatma hatası:', error)
          // Retry after user interaction
          const retryPlay = async () => {
            try {
              await audioRef.current?.play()
              setIsMusicPlaying(true)
              console.log('Müzik tekrar deneme başarılı')
            } catch (e) {
              console.error('Müzik tekrar deneme hatası:', e)
            }
          }
          // Try again on next click
          document.addEventListener('click', retryPlay, { once: true })
        }
      }
    }, 100)
  }

  // Toggle music mute/unmute
  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = 0.4
        setIsMuted(false)
      } else {
        audioRef.current.volume = 0
        setIsMuted(true)
      }
    }
  }

  useEffect(() => {
    // Video element - automatically loads when component mounts
    if (!hasEntered) return
    
    const handleVideoLoad = () => {
      if (videoRef.current) {
        console.log('Video element başarıyla yüklendi')
        // Try to play video if not already playing
        if (videoRef.current.paused) {
          videoRef.current.play().catch(e => {
            console.log('Video autoplay blocked:', e)
          })
        }
      }
    }
    
    // Initialize when component mounts and user has entered
    if (videoRef.current) {
      handleVideoLoad()
    } else {
      // Wait for ref to be available
      const timer = setTimeout(handleVideoLoad, 100)
      return () => clearTimeout(timer)
    }
    
    // No cleanup needed for video
  }, [hasEntered])
  // Spotify API integration
  useEffect(() => {    const isAuth = spotifyAPI.isAuthenticated();
    console.log('Spotify authentication status:', isAuth);

    const fetchCurrentTrack = async () => {
      if (spotifyAPI.isAuthenticated()) {
        console.log('Fetching current track...');
        const track = await spotifyAPI.getCurrentlyPlaying();
        if (track) {
          console.log('Track received:', track);
          setCurrentTrack(track);
        } else {
          console.log('No track received or nothing playing');
          // Reset to default state when nothing is playing
          setCurrentTrack({
            name: 'No track playing',
            artist: 'Spotify',
            image: '',
            isPlaying: false,
            progress: 0,
            duration: 0
          });
        }
      } else {
        console.log('Not authenticated with Spotify');
      }
    };
    
    // Handle callback from Spotify authorization
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code && !isAuth) {
      console.log('Authorization code found, exchanging for token...');
      spotifyAPI.exchangeCodeForToken(code).then((success) => {
        if (success) {
          console.log('Token exchange successful');
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
          // Fetch track immediately after authentication
          fetchCurrentTrack();
        } else {
          console.log('Token exchange failed');
        }
      });
    } else {
      // Fetch immediately if already authenticated
      fetchCurrentTrack();
    }
    // Then fetch every 5 seconds
    const interval = setInterval(fetchCurrentTrack, 5000);
    return () => clearInterval(interval);
  }, []); // Remove spotifyAPI from dependencies

  return (
    <>
      {/* Enter Screen */}
      {!hasEntered && (
        <div className="enter-screen" onClick={handleEnter}>
          <div className="enter-overlay">
            <div className="enter-text">click to login</div>
          </div>
        </div>
      )}



      {/* Main Desktop - Only show after entering */}
      <div className={`desktop ${!hasEntered ? 'blurred' : ''}`}>
          {/* Hidden audio element for background music */}
          <audio 
            ref={audioRef} 
            preload="auto"
            controls={false}
            onLoadStart={() => console.log('Müzik yükleniyor...')}
            onLoadedData={() => console.log('Müzik data yüklendi')}
            onCanPlay={() => console.log('Müzik oynatılabilir durumda')}
            onPlay={() => {
              console.log('Müzik oynatılıyor')
              setIsMusicPlaying(true)
            }}
            onPause={() => {
              console.log('Müzik duraklatıldı')
              setIsMusicPlaying(false)
            }}
            onError={(e) => {
              console.error('Müzik yükleme hatası:', e)
              console.error('Audio current src:', audioRef.current?.currentSrc)
            }}
          >
            <source src="/song.mp3" type="audio/mpeg" />
            <source src="/song.mp3" type="audio/mp3" />
            Your browser does not support the audio element.
          </audio>
          
          <div className="background">
        {/* Rain Effect */}
        <div className="rain-container">
          {Array.from({ length: 150 }, (_, i) => (
            <div 
              key={i} 
              className="raindrop" 
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${0.5 + Math.random() * 1}s`
              }}
            />
          ))}
        </div>
        
        <video
          ref={videoRef}
          src="https://r2.guns.lol/c28d6b4a-9935-4ea1-afe0-dfaa9a13d544.mp4"
          autoPlay
          loop
          muted
          playsInline
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: -1,
            border: 'none'
          }}
          onLoadStart={() => console.log('Video yükleniyor...')}
          onLoadedData={() => console.log('Video data yüklendi')}
          onCanPlay={() => console.log('Video oynatılabilir durumda')}
          onPlay={() => console.log('Video oynatılıyor')}
          onError={(e) => {
            console.error('Video yükleme hatası:', e)
          }}
        />
      </div>
      
      {/* Volume/Music Control Icon */}
      <div className="volume-icon" onClick={toggleMute} title={isMuted ? "Unmute Music" : "Mute Music"}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
          {isMuted ? (
            <path d="M3 9v6h4l5 5V4L7 9H3zm7-.17v6.34L7.83 13H5v-2h2.83L10 8.83zM16.5 12l2.5-2.5 1.41 1.41L17.91 13.5l2.5 2.5-1.41 1.41L16.5 15l-2.5 2.5-1.41-1.41L15.09 14l-2.5-2.5L14 10.09 16.5 12z"/>
          ) : (
            <path d="M3 9v6h4l5 5V4L7 9H3zm7-.17v6.34L7.83 13H5v-2h2.83L10 8.83zM16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          )}
        </svg>
        <div className="music-indicator">
          {isMusicPlaying && !isMuted && (
            <div className="sound-waves">
              <div className="wave"></div>
              <div className="wave"></div>
              <div className="wave"></div>
            </div>
          )}
        </div>
      </div>

      {/* Spotify Music Player - Top Right */}      <div className="spotify-player">
        <div className="spotify-info">
          {currentTrack.image && (
            <div className="album-cover">
              <img src={currentTrack.image} alt={`${currentTrack.name} album cover`} />
            </div>
          )}
          <div className="track-details">
            <div className="track-name">{currentTrack.name}</div>
            <div className="artist-name">{currentTrack.artist}</div>
          </div>
        </div>
      </div>{/* Combined User Profile with Social Icons */}
      <div 
        ref={profileRef}
        className="user-profile-combined"
        onMouseMove={handle3DEffect}
        onMouseLeave={reset3DEffect}
      >
        <div className="profile-section">
          <div className="avatar">
            <img src="https://media.discordapp.net/attachments/1216400509892689961/1382054816783794518/relax2.0.png?ex=68544e59&is=6852fcd9&hm=481c8028a38ab8453c1a3e454e2c4199934c60b42805419050ec946374ef3d15&=&format=webp&quality=lossless&width=968&height=968" alt="Profile" />
            <div className="status-indicator online"></div>
          </div>
          <div className="user-info">
            <div className="username">RelaxTeror 💜🔥</div>
            <div className="user-subtitle typewriter">
              {hasEntered ? (
                <>
                  {typewriterText}
                  <span className="typewriter-cursor">|</span>
                </>
              ) : (
                'DEVELOPER'
              )}
            </div>
            <div className="user-status">joined 9 months ago</div>
          </div>
        </div>
        
        {/* About Me Section */}
        <div className="about-section">
          <div className="about-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
            Hakkımda
          </div>
          <div className="about-text">
            Merhaba! Ben bir full-stack developer'ım. Web teknolojileri, 
            mobil uygulama geliştirme ve kullanıcı deneyimi tasarımı konularında 
            tutkulu bir yazılımcıyım. Yeni teknolojileri öğrenmeyi ve projeler 
            geliştirmeyi seviyorum.
          </div>
          <div className="about-stats">
            <div className="stat-item">
              <span className="stat-number">15+</span>
              <span className="stat-label">Projeler</span>
            </div>            <div className="stat-item">
              <span className="stat-number">8</span>
              <span className="stat-label">Yıl Deneyim</span>
            </div>            <div className="stat-item">
              <span className="stat-number">{customerCount}+</span>
              <span className="stat-label">Müşteri</span>
            </div>
          </div>
        </div>
          <div className="social-section">
          <div className="social-icons">
            <a href="#" className="social-icon discord" title="Discord">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.195.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
            </a>
            <a href="https://x.com/theRelax1337" className="social-icon twitter" title="Twitter" target="_blank" rel="noopener noreferrer">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a href="https://www.youtube.com/@relaxterror" className="social-icon youtube" title="YouTube" target="_blank" rel="noopener noreferrer">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Dots */}
      <div className="bottom-dots">
        <div className="dot"></div>
        <div className="dot"></div>
        <div className="dot"></div>
        <div className="dot"></div>
      </div>
        </div>
    </>
  )
}

export default App
