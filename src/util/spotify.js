
const CLIENT_ID = '5ae439d04bd5467484c057d464a3bc8b';

//uncomment for surge deployment
const REDIRECT_URI = 'https://totaljamms.surge.sh';

//uncomment for local testing
//const REDIRECT_URI = 'http://127.0.0.1:3000/public/index.html';

const SCOPES = 'user-read-private user-read-email playlist-read-private playlist-read-collaborative playlist-modify-public playlist-modify-private';

let accessToken = null;
let tokenRefreshTimer = null;

// PKCE helper functions
function generateCodeVerifier() {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const randomBytes = crypto.getRandomValues(new Uint8Array(96));
  return Array.from(randomBytes, byte => possible[byte % possible.length]).join('');
}

async function generateCodeChallenge(codeVerifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode.apply(null, new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function getTokenFromStorage() {
  const token = localStorage.getItem('spotify_access_token');
  const expiry = localStorage.getItem('spotify_token_expiry');
  
  if (token && expiry && Date.now() < parseInt(expiry)) {
    return token;
  }
  
  return null;
}

function saveTokenToStorage(token, expiresIn) {
  const expiryTime = Date.now() + (expiresIn * 1000);
  localStorage.setItem('spotify_access_token', token);
  localStorage.setItem('spotify_token_expiry', expiryTime.toString());
  
  // Set up automatic token refresh 5 minutes before expiry
  setupTokenRefresh(expiresIn);
}

function setupTokenRefresh(expiresIn) {
  // Clear any existing timer
  if (tokenRefreshTimer) {
    clearTimeout(tokenRefreshTimer);
  }
  
  // Set timer to refresh token 5 minutes before it expires (or 1 minute if less than 6 minutes remaining)
  const refreshTime = Math.max((expiresIn - 300) * 1000, 60000); // 5 minutes before or 1 minute minimum
  
  tokenRefreshTimer = setTimeout(() => {
    console.log('Auto-refreshing token...');
    refreshAccessToken();
  }, refreshTime);
  
  console.log(`Token refresh scheduled in ${Math.round(refreshTime / 1000 / 60)} minutes`);
}

async function refreshAccessToken() {
  try {
    // For PKCE flow, we need to get a new token by redirecting (Spotify doesn't support refresh tokens with PKCE)
    // However, to avoid losing user data, we'll just clear the token and let the next API call handle re-auth
    console.log('Token expired, will re-authenticate on next API call');
    
    // Don't clear the token immediately - let it expire naturally
    // The next API call will detect the 401 and trigger re-auth
    accessToken = null;
    
    // Clear the timer
    if (tokenRefreshTimer) {
      clearTimeout(tokenRefreshTimer);
      tokenRefreshTimer = null;
    }
    
    return null;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return null;
  }
}

function clearTokenFromStorage() {
  localStorage.removeItem('spotify_access_token');
  localStorage.removeItem('spotify_token_expiry');
  localStorage.removeItem('spotify_code_verifier');
}

function getAccessToken() {
  if (accessToken) {
    return accessToken;
  }

  const storedToken = getTokenFromStorage();
  if (storedToken) {
    accessToken = storedToken;
    
    // Set up auto-refresh for existing token
    const expiry = localStorage.getItem('spotify_token_expiry');
    if (expiry) {
      const timeUntilExpiry = Math.max(parseInt(expiry) - Date.now(), 0) / 1000;
      if (timeUntilExpiry > 0) {
        setupTokenRefresh(timeUntilExpiry);
      }
    }
    
    return accessToken;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const authCode = urlParams.get('code');

  if (authCode) {
    return exchangeCodeForToken(authCode);
  }

  return redirectToAuth();
}

async function redirectToAuth() {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  localStorage.setItem('spotify_code_verifier', codeVerifier);

  const authUrl = `https://accounts.spotify.com/authorize?` +
    `response_type=code&` +
    `client_id=${CLIENT_ID}&` +
    `scope=${encodeURIComponent(SCOPES)}&` +
    `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
    `code_challenge_method=S256&` +
    `code_challenge=${codeChallenge}`;

  window.location = authUrl;
}

async function exchangeCodeForToken(code) {
  const codeVerifier = localStorage.getItem('spotify_code_verifier');

  if (!codeVerifier) {
    console.error('Code verifier not found');
    return redirectToAuth();
  }

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID,
        code_verifier: codeVerifier
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Token exchange failed:', errorText);
      throw new Error(`Token exchange failed: ${response.status}`);
    }

    const data = await response.json();
    accessToken = data.access_token;
    
    saveTokenToStorage(data.access_token, data.expires_in);
    localStorage.removeItem('spotify_code_verifier');

    // Clear the code from URL
    window.history.replaceState({}, document.title, window.location.pathname);

    // Trigger profile loaded event with delay to ensure components are ready
    setTimeout(() => {
      console.log('Dispatching profileLoaded event');
      window.dispatchEvent(new CustomEvent('profileLoaded'));
    }, 500); // Increased delay
    
    return accessToken;
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    clearTokenFromStorage();
    throw 'Unable to get access token';
  }
}

function logout() {
  accessToken = null;
  clearTokenFromStorage();
  
  // Clear the refresh timer
  if (tokenRefreshTimer) {
    clearTimeout(tokenRefreshTimer);
    tokenRefreshTimer = null;
  }
  
  window.dispatchEvent(new CustomEvent('profileLogout'));
}

// Search function that returns a Promise
async function search(term) {
  const token = await getAccessToken();
  
  if (!token) {
    throw new Error('Unable to get access token');
  }

  try {
    const response = await fetch(`https://api.spotify.com/v1/search?type=track&q=${encodeURIComponent(term)}&limit=20`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.status === 401) {
      // Token expired, clear storage and redirect for new auth
      console.log('Token expired during search, re-authenticating...');
      clearTokenFromStorage();
      accessToken = null;
      if (tokenRefreshTimer) {
        clearTimeout(tokenRefreshTimer);
        tokenRefreshTimer = null;
      }
      // Redirect to auth instead of throwing error to maintain user experience
      redirectToAuth();
      return [];
    }

    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.tracks && data.tracks.items) {
      return data.tracks.items.map(track => ({
        id: track.id,
        name: track.name,
        artist: track.artists[0].name,
        album: track.album.name,
        uri: track.uri,
        preview_url: track.preview_url
      }));
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error searching tracks:', error);
    return [];
  }
}



// Save playlist method - can create new or update existing
async function savePlaylist(playlistName, trackUris, playlistId = null) {
  // Check if there are values saved to the method's two arguments. If not, return.
  if (!playlistName || !trackUris || !Array.isArray(trackUris)) {
    console.log('No playlist name or track URIs provided');
    return;
  }

  // Get token from storage
  const token = getTokenFromStorage();
  if (!token) {
    console.error('No access token available');
    return;
  }

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  try {
    let finalPlaylistId = playlistId;

    // If no playlist ID provided, create a new playlist
    if (!finalPlaylistId) {
      // Step 1: Get user ID
      const userResponse = await fetch('https://api.spotify.com/v1/me', { headers });
      if (!userResponse.ok) {
        throw new Error('Failed to fetch user ID');
      }
      const userData = await userResponse.json();
      const userID = userData.id;
      console.log('User ID:', userID);

      // Step 2: Create new playlist
      const createPlaylistResponse = await fetch(`https://api.spotify.com/v1/users/${userID}/playlists`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          "name": playlistName,
          "description": "Created with Jamming App",
          "public": false
        })
      });

      if (!createPlaylistResponse.ok) {
        throw new Error('Failed to create playlist');
      }
      const playlistData = await createPlaylistResponse.json();
      finalPlaylistId = playlistData.id;
      console.log('New playlist created:', playlistData);
    } else {
      // Update existing playlist name if it changed
      const updatePlaylistResponse = await fetch(`https://api.spotify.com/v1/playlists/${finalPlaylistId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          "name": playlistName,
          "description": "Updated with Total Jamms App"
        })
      });

      if (!updatePlaylistResponse.ok) {
        console.warn('Failed to update playlist details, but continuing...');
      }

      // Clear existing tracks from playlist
      const clearResponse = await fetch(`https://api.spotify.com/v1/playlists/${finalPlaylistId}/tracks`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          uris: []
        })
      });

      if (!clearResponse.ok) {
        console.warn('Failed to clear playlist tracks, but continuing...');
      }
      console.log('Existing playlist cleared');
    }

    // Step 3: Add tracks to playlist (works for both new and existing)
    if (trackUris.length > 0) {
      const addTracksResponse = await fetch(`https://api.spotify.com/v1/playlists/${finalPlaylistId}/tracks`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          uris: trackUris
        })
      });

      if (!addTracksResponse.ok) {
        throw new Error('Failed to add tracks to playlist');
      }

      const trackData = await addTracksResponse.json();
      console.log('Tracks added successfully:', trackData);
    }

    console.log(`Playlist ${playlistId ? 'updated' : 'saved'} successfully:`, playlistName, 'with tracks:', trackUris);
    return true; // Return success

  } catch (error) {
    console.error('Error saving playlist:', error);
    throw error; // Re-throw so App can catch it
  }
}

// Helper function to make API calls with automatic token refresh handling
async function makeSpotifyAPICall(url, options = {}) {
  const token = getTokenFromStorage();
  if (!token) {
    console.log('No valid token available');
    return null;
  }

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    ...options.headers
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    if (response.status === 401) {
      // Token expired, clear and redirect for new auth
      console.log('Token expired, re-authenticating...');
      clearTokenFromStorage();
      accessToken = null;
      if (tokenRefreshTimer) {
        clearTimeout(tokenRefreshTimer);
        tokenRefreshTimer = null;
      }
      // Don't redirect immediately, let the calling function handle it
      throw new Error('TOKEN_EXPIRED');
    }

    return response;
  } catch (error) {
    throw error;
  }
}

// Get user's playlists
async function getUserPlaylists() {
  console.log('Spotify: getUserPlaylists called');
  try {
    const response = await makeSpotifyAPICall('https://api.spotify.com/v1/me/playlists?limit=50');
    
    if (!response) {
      console.error('Spotify: No response from API');
      return [];
    }

    if (!response.ok) {
      console.error('Spotify: API response not OK:', response.status);
      throw new Error(`Failed to fetch playlists: ${response.status}`);
    }

    const data = await response.json();
    console.log('Spotify: Raw playlists data:', data);
    
    if (data.items) {
      const playlists = data.items.map(playlist => ({
        id: playlist.id,
        name: playlist.name,
        description: playlist.description,
        public: playlist.public,
        tracks: playlist.tracks.total,
        owner: playlist.owner.display_name,
        images: playlist.images,
        external_urls: playlist.external_urls
      }));
      console.log('Spotify: Mapped playlists:', playlists);
      return playlists;
    } else {
      return [];
    }
  } catch (error) {
    if (error.message === 'TOKEN_EXPIRED') {
      console.log('Token expired while fetching playlists, user will need to re-authenticate');
      return [];
    }
    console.error('Error fetching user playlists:', error);
    return [];
  }
}

// Get tracks from a specific playlist
async function getPlaylistTracks(playlistId) {
  try {
    const response = await makeSpotifyAPICall(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`);
    
    if (!response) {
      console.error('No response from API');
      return [];
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch playlist tracks: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.items) {
      return data.items.map(item => ({
        id: item.track.id,
        name: item.track.name,
        artist: item.track.artists[0].name,
        album: item.track.album.name,
        uri: item.track.uri,
        preview_url: item.track.preview_url
      })).filter(track => track.id); // Filter out null tracks
    } else {
      return [];
    }
  } catch (error) {
    if (error.message === 'TOKEN_EXPIRED') {
      console.log('Token expired while fetching playlist tracks, user will need to re-authenticate');
      return [];
    }
    console.error('Error fetching playlist tracks:', error);
    return [];
  }
}

// Delete playlist method
async function deletePlaylist(playlistId) {
  if (!playlistId) {
    console.log('No playlist ID provided');
    return false;
  }

  // Get token from storage
  const token = getTokenFromStorage();
  if (!token) {
    console.error('No access token available');
    return false;
  }

  try {
    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/followers`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to delete playlist: ${response.status}`);
    }

    console.log('Playlist deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting playlist:', error);
    return false;
  }
}



// Export the Spotify object with search and savePlaylist methods
const Spotify = {
  search: search,
  savePlaylist: savePlaylist,
  logout: logout,
  getUserPlaylists: getUserPlaylists,
  getPlaylistTracks: getPlaylistTracks,
  deletePlaylist: deletePlaylist
};

export default Spotify;