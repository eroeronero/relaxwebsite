import { useState, useEffect, useRef } from 'react'
import './App.css'
import SpotifyAPI, { type SpotifyTrack } from './utils/spotify'

function App() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isPlaying, setIsPlaying] = useState(false)
  const [isSpotifyConnected, setIsSpotifyConnected] = useState(false)
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
  
  // Terminal states
  const [showTerminal, setShowTerminal] = useState(false)
  const [terminalLines, setTerminalLines] = useState<string[]>([])
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  
  // Video ref for manual control
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
    }
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

  // Handle enter button click - show terminal first
  const handleEnter = async () => {
    setShowTerminal(true)
    setIsLoggingIn(true)
    
    // Simulate login process with terminal messages
    const messages = [
      'Terminal başlatılıyor...',
      'Bağlantı kuruluyor...',
      'Hoşgeldiniz kullanıcı!',
      'Giriş yapılıyor, lütfen bekleyiniz...',
      'Kullanıcı bilgileri doğrulanıyor...',
      'Sistem ayarları yükleniyor...',
      'Profil verileri alınıyor...',
      'Giriş başarılı! Yönlendiriliyor...'
    ]
    
    // Add messages with delay
    for (let i = 0; i < messages.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400))
      setTerminalLines(prev => [...prev, `> ${messages[i]}`])
    }
    
    // Wait a bit more then close terminal and enter main app
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsLoggingIn(false)
    setShowTerminal(false)
    setHasEntered(true)
    
    // Small delay to ensure refs are ready
    setTimeout(async () => {
      // Start video
      if (videoRef.current) {
        try {
          videoRef.current.muted = true
          videoRef.current.loop = true
          await videoRef.current.play()
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
    // Video play logic - only start after user enters
    if (!hasEntered) return
    
    const handleVideoLoad = () => {
      if (videoRef.current) {
        const video = videoRef.current
        
        // Set initial properties
        video.muted = true
        video.loop = true
        video.playsInline = true
        video.autoplay = true
        
        const playVideo = async () => {
          try {
            await video.play()
            console.log('Video başarıyla oynatıldı')
          } catch (error) {
            console.log('Video autoplay engellendi:', error)
          }
        }
        
        // Multiple trigger points for video play
        if (video.readyState >= 3) {
          playVideo()
        } else {
          video.addEventListener('canplay', playVideo, { once: true })
          video.addEventListener('loadeddata', playVideo, { once: true })
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
    
    return () => {
      // Cleanup
      if (videoRef.current) {
        videoRef.current.pause()
      }
    }
  }, [hasEntered])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Spotify API integration
  useEffect(() => {
    // Check if user is already authenticated
    setIsSpotifyConnected(spotifyAPI.isAuthenticated())

    const fetchCurrentTrack = async () => {
      if (spotifyAPI.isAuthenticated()) {
        const track = await spotifyAPI.getCurrentlyPlaying()
        if (track) {
          setCurrentTrack(track)
          setIsPlaying(track.isPlaying)
        }
      }
    }
    
    // Fetch immediately
    fetchCurrentTrack()
    
    // Then fetch every 5 seconds
    const interval = setInterval(fetchCurrentTrack, 5000)
    return () => clearInterval(interval)
  }, []) // Remove spotifyAPI from dependencies

  const handleSpotifyConnect = () => {
    if (!isSpotifyConnected) {
      window.location.href = spotifyAPI.getAuthUrl()
    } else {
      spotifyAPI.logout()
      setIsSpotifyConnected(false)
    }
  }

  const handlePlayPause = async () => {
    if (isSpotifyConnected) {
      const success = await spotifyAPI.togglePlayback()
      if (success) {
        setIsPlaying(!isPlaying)
      }
    } else {
      // Local state toggle for demo
      setIsPlaying(!isPlaying)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
  }

  return (
    <>
      {/* Enter Screen */}
      {!hasEntered && !showTerminal && (
        <div className="enter-screen" onClick={handleEnter}>
          <div className="enter-overlay">
            <div className="enter-text">click to login</div>
          </div>
        </div>
      )}

      {/* Terminal Screen */}
      {showTerminal && (
        <div className="terminal-screen">
          <div className="terminal-window">
            <div className="terminal-header">
              <div className="terminal-buttons">
                <span className="terminal-button close"></span>
                <span className="terminal-button minimize"></span>
                <span className="terminal-button maximize"></span>
              </div>
              <div className="terminal-title">System Terminal</div>
            </div>
            <div className="terminal-body">
              <div className="terminal-content">
                {terminalLines.map((line, index) => (
                  <div key={index} className="terminal-line">
                    {line}
                  </div>
                ))}
                {isLoggingIn && (
                  <div className="terminal-line">
                    <span className="terminal-cursor">_</span>
                  </div>
                )}
              </div>
            </div>
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
          autoPlay
          muted 
          loop 
          playsInline
          preload="auto"
          controls={false}
          onLoadStart={() => console.log('Video yükleniyor...')}
          onLoadedData={() => console.log('Video data yüklendi')}
          onCanPlay={() => console.log('Video oynatılabilir durumda')}
          onPlay={() => console.log('Video oynatılıyor')}
          onError={(e) => {
            console.error('Video yükleme hatası:', e)
            console.error('Video current src:', videoRef.current?.currentSrc)
          }}
        >
          <source src="/video.mp4" type="video/mp4" />
          Video dosyası yüklenemedi.
        </video>
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

      {/* Spotify Music Player - Top Right */}
      <div className="spotify-player">
        <div className="spotify-info">
          <div className="spotify-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#1db954">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.84-.179-.959-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.361 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
          </div>
          <div className="track-details">
            <div className="track-name">{currentTrack.name}</div>
            <div className="artist-name">{currentTrack.artist}</div>
          </div>
        </div>
        <div className="spotify-controls">
          <button 
            className="spotify-btn" 
            onClick={handlePlayPause}
            title={isSpotifyConnected ? "Control Spotify" : "Demo mode"}
          >
            {currentTrack?.isPlaying ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>
          <button 
            className="spotify-btn spotify-connect-btn" 
            onClick={handleSpotifyConnect}
            title={isSpotifyConnected ? "Disconnect Spotify" : "Connect Spotify"}
          >
            {isSpotifyConnected ? "🔗" : "🔌"}
          </button>
        </div>
      </div>

      {/* Combined User Profile with Social Icons */}
      <div 
        ref={profileRef}
        className="user-profile-combined"
        onMouseMove={handle3DEffect}
        onMouseLeave={reset3DEffect}
      >
        <div className="profile-section">
          <div className="avatar">
            <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face" alt="Profile" />
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
        
        <div className="social-section">
          <div className="social-icons">
            <a href="#" className="social-icon discord" title="Discord">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.195.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
            </a>
            <a href="#" className="social-icon spotify" title="Spotify">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.84-.179-.959-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.361 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
            </a>
            <a href="#" className="social-icon instagram" title="Instagram">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a href="#" className="social-icon github" title="GitHub">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
            <a href="#" className="social-icon twitter" title="Twitter">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a href="#" className="social-icon youtube" title="YouTube">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Enhanced Time and Location */}
      <div className="time-location-enhanced">
        <div className="time-display">
          <div className="clock-widget">
            <div className="current-time">{formatTime(currentTime)}</div>
            <div className="date-info">
              {currentTime.toLocaleDateString('tr-TR', { 
                day: 'numeric', 
                month: 'long',
                weekday: 'short'
              })}
            </div>
          </div>
        </div>
        <div className="location-display">
          <div className="location-section">
            <div className="location-icon">📍</div>
            <div className="location-info">
              <div className="city">İstanbul</div>
              <div className="country">Turkey</div>
            </div>
          </div>
          <div className="weather-info">
            <div className="temperature">24°</div>
            <div className="weather-icon">☀️</div>
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
