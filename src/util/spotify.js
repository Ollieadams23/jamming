
const CLIENT_ID = '5ae439d04bd5467484c057d464a3bc8b';

const REDIRECT_URI = 'https://ollieadams23.github.io/jamming/index.html';

//const REDIRECT_URI = 'http://127.0.0.1:3000/public/index.html';

const SCOPES = 'user-read-private user-read-email playlist-read-private playlist-read-collaborative playlist-modify-public playlist-modify-private';

let accessToken = null;

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

    // Trigger profile loaded event
    window.dispatchEvent(new CustomEvent('profileLoaded'));
    
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
      // Token expired, clear storage and try to get new token
      clearTokenFromStorage();
      accessToken = null;
      throw new Error('Token expired');
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



// Save playlist method
async function savePlaylist(playlistName, trackUris) {
  // Check if there are values saved to the method's two arguments. If not, return.
  if (!playlistName || !trackUris || !Array.isArray(trackUris) || trackUris.length === 0) {
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
    // Step 1: Get user ID
    const userResponse = await fetch('https://api.spotify.com/v1/me', { headers });
    if (!userResponse.ok) {
      throw new Error('Failed to fetch user ID');
    }
    const userData = await userResponse.json();
    const userID = userData.id;
    console.log('User ID:', userID);

    // Step 2: Create playlist
    const createPlaylistResponse = await fetch(`https://api.spotify.com/v1/users/${userID}/playlists`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        "name": playlistName,
        "description": "New playlist description",
        "public": false
      })
    });

    if (!createPlaylistResponse.ok) {
      throw new Error('Failed to create playlist');
    }
    const playlistData = await createPlaylistResponse.json();
    const playlistID = playlistData.id;
    console.log('Playlist created:', playlistData);

    // Step 3: Add tracks to playlist
    const addTracksResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlistID}/tracks`, {
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
    console.log('Playlist saved successfully:', playlistName, 'with tracks:', trackUris);

  } catch (error) {
    console.error('Error saving playlist:', error);
  }
}



// Export the Spotify object with search and savePlaylist methods
const Spotify = {
  search: search,
  savePlaylist: savePlaylist,
  logout: logout
};

export default Spotify;