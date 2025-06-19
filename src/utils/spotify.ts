// Spotify Web API integration utilities
// Bu dosya Spotify API entegrasyonu için hazırlanmıştır

interface SpotifyTrack {
  name: string;
  artist: string;
  image: string;
  isPlaying: boolean;
  progress: number;
  duration: number;
}

// Spotify API configuration
const SPOTIFY_CONFIG = {
  CLIENT_ID: import.meta.env.VITE_SPOTIFY_CLIENT_ID || '',
  CLIENT_SECRET: import.meta.env.VITE_SPOTIFY_CLIENT_SECRET || '',
  REDIRECT_URI: import.meta.env.VITE_SPOTIFY_REDIRECT_URI || 'http://localhost:5173/callback',
  SCOPES: [
    'user-read-currently-playing',
    'user-read-playback-state',
    'user-modify-playback-state'
  ].join(' ')
};

class SpotifyAPI {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    // Load tokens from localStorage
    this.accessToken = localStorage.getItem('spotify_access_token');
    this.refreshToken = localStorage.getItem('spotify_refresh_token');
  }

  // Generate Spotify authorization URL
  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: SPOTIFY_CONFIG.CLIENT_ID,
      response_type: 'code',
      redirect_uri: SPOTIFY_CONFIG.REDIRECT_URI,
      scope: SPOTIFY_CONFIG.SCOPES,
      state: this.generateRandomString(16)
    });

    return `https://accounts.spotify.com/authorize?${params.toString()}`;
  }

  // Exchange authorization code for access token
  async exchangeCodeForToken(code: string): Promise<boolean> {
    try {      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${SPOTIFY_CONFIG.CLIENT_ID}:${SPOTIFY_CONFIG.CLIENT_SECRET}`)}`
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: SPOTIFY_CONFIG.REDIRECT_URI
        })
      });

      if (response.ok) {
        const data = await response.json();
        this.accessToken = data.access_token;
        this.refreshToken = data.refresh_token;
        
        // Store tokens in localStorage
        localStorage.setItem('spotify_access_token', this.accessToken!);
        localStorage.setItem('spotify_refresh_token', this.refreshToken!);
        
        return true;
      }
    } catch (error) {
      console.error('Error exchanging code for token:', error);
    }
    return false;
  }
  // Get currently playing track
  async getCurrentlyPlaying(): Promise<SpotifyTrack | null> {
    if (!this.accessToken) {
      console.log('No access token available');
      return null;
    }

    try {
      console.log('Fetching currently playing track...');
      const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      console.log('Response status:', response.status);

      if (response.status === 401) {
        console.log('Token expired, refreshing...');
        // Token expired, try to refresh
        const refreshSuccess = await this.refreshAccessToken();
        if (refreshSuccess) {
          return this.getCurrentlyPlaying();
        }
        return null;
      }

      if (response.status === 204) {
        console.log('No content - nothing is currently playing');
        return null;
      }

      if (response.ok) {
        const data = await response.json();
        console.log('Spotify API Response:', data);
        
        if (data.item) {
          const track = {
            name: data.item.name,
            artist: data.item.artists[0]?.name || 'Unknown Artist',
            image: data.item.album.images[0]?.url || '',
            isPlaying: data.is_playing,
            progress: data.progress_ms,
            duration: data.item.duration_ms
          };
          console.log('Parsed track:', track);
          return track;
        } else {
          console.log('No item in response');
        }
      } else {
        console.log('Request failed with status:', response.status);
        const errorText = await response.text();
        console.log('Error response:', errorText);
      }
    } catch (error) {
      console.error('Error fetching currently playing track:', error);
    }

    return null;
  }

  // Refresh access token
  async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) {
      return false;
    }

    try {      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${SPOTIFY_CONFIG.CLIENT_ID}:${SPOTIFY_CONFIG.CLIENT_SECRET}`)}`
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: this.refreshToken
        })
      });

      if (response.ok) {
        const data = await response.json();
        this.accessToken = data.access_token;
        localStorage.setItem('spotify_access_token', this.accessToken!);
        return true;
      }
    } catch (error) {
      console.error('Error refreshing access token:', error);
    }

    return false;
  }

  // Control playback
  async togglePlayback(): Promise<boolean> {
    if (!this.accessToken) {
      return false;
    }

    try {
      const currentTrack = await this.getCurrentlyPlaying();
      const endpoint = currentTrack?.isPlaying ? 'pause' : 'play';
      
      const response = await fetch(`https://api.spotify.com/v1/me/player/${endpoint}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Error toggling playback:', error);
      return false;
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  // Logout
  logout(): void {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_refresh_token');
  }

  private generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

export default SpotifyAPI;
export type { SpotifyTrack };
