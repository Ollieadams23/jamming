
// Move all auth logic to module level - these functions should be available globally

function generateRandomString(length) {
  let text = '';
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

  async function generateCodeChallenge(codeVerifier) {
    const digest = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(codeVerifier),
    );

    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  }

  function generateUrlWithSearchParams(url, params) {
    const urlObject = new URL(url);
    urlObject.search = new URLSearchParams(params).toString();

    return urlObject.toString();
  }

  function redirectToSpotifyAuthorizeEndpoint() {
    const codeVerifier = generateRandomString(64);

    generateCodeChallenge(codeVerifier).then((code_challenge) => {
      window.localStorage.setItem('code_verifier', codeVerifier);

      // Redirect to example:
      // GET https://accounts.spotify.com/authorize?response_type=code&client_id=77e602fc63fa4b96acff255ed33428d3&redirect_uri=http%3A%2F%2Flocalhost&scope=user-follow-modify&state=e21392da45dbf4&code_challenge=KADwyz1X~HIdcAG20lnXitK6k51xBP4pEMEZHmCneHD1JhrcHjE1P3yU_NjhBz4TdhV6acGo16PCd10xLwMJJ4uCutQZHw&code_challenge_method=S256

      window.location = generateUrlWithSearchParams(
        'https://accounts.spotify.com/authorize',
        {
          response_type: 'code',
          client_id: client_id,
          scope: 'user-read-private user-read-email',
          code_challenge_method: 'S256',
          code_challenge,
          redirect_uri,
        },
      );

      // If the user accepts spotify will come back to your application with the code in the response query string
      // Example: http://127.0.0.1:8080/?code=NApCCg..BkWtQ&state=profile%2Factivity
    });
  }

  function exchangeToken(code) {
    const code_verifier = localStorage.getItem('code_verifier');

    fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      body: new URLSearchParams({
        client_id,
        grant_type: 'authorization_code',
        code,
        redirect_uri,
        code_verifier,
      }),
    })
      .then(addThrowErrorToFetch)
      .then((data) => {
        processTokenResponse(data);

        // clear search query params in the url
        window.history.replaceState({}, document.title, '/');
      })
      .catch(handleError);
  }

  function refreshToken() {
    fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      body: new URLSearchParams({
        client_id,
        grant_type: 'refresh_token',
        refresh_token,
      }),
    })
      .then(addThrowErrorToFetch)
      .then(processTokenResponse)
      .catch(handleError);
  }

  function handleError(error) {
    console.error('Spotify API Error:', error);
    // Could dispatch an error event to React components if needed
    // For now, just log the error
  }

  async function addThrowErrorToFetch(response) {
    if (response.ok) {
      return response.json();
    } else {
      throw { response, error: await response.json() };
    }
  }

  function logout() {
    localStorage.clear();
    window.location.reload();
  }

  function processTokenResponse(data) {
    console.log(data);

    access_token = data.access_token;
    refresh_token = data.refresh_token;

    const t = new Date();
    expires_at = t.setSeconds(t.getSeconds() + data.expires_in);

    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    localStorage.setItem('expires_at', expires_at);

    // Notify React component about auth update
    window.dispatchEvent(new CustomEvent('spotifyAuthUpdate', {
      detail: {
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt: expires_at
      }
    }));

    // load data of logged in user
    getUserData();
  }

  function getUserData() {
    fetch('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: 'Bearer ' + access_token,
      },
    })
      .then(async (response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw await response.json();
        }
      })
      .then((data) => {
        console.log(data);
        
        // Notify React component about user profile update
        window.dispatchEvent(new CustomEvent('spotifyAuthUpdate', {
          detail: {
            accessToken: access_token,
            refreshToken: refresh_token,
            expiresAt: expires_at,
            userProfile: data
          }
        }));
      })
      .catch((error) => {
        console.error(error);
      });
  }

  // Your client id from your app in the spotify dashboard:
  // https://developer.spotify.com/dashboard/applications
  const client_id = '5ae439d04bd5467484c057d464a3bc8b';
  const redirect_uri = 'http://127.0.0.1:3000/public/index.html'; // Simplified redirect uri

  // Restore tokens from localStorage
  let access_token = localStorage.getItem('access_token') || null;
  let refresh_token = localStorage.getItem('refresh_token') || null;
  let expires_at = localStorage.getItem('expires_at') || null;

  // If the user has accepted the authorize request spotify will come back to your application with the code in the response query string
  // Example: http://127.0.0.1:8080/?code=NApCCg..BkWtQ&state=profile%2Factivity
  const args = new URLSearchParams(window.location.search);
  const code = args.get('code');

  if (code) {
    // we have received the code from spotify and will exchange it for a access_token
    exchangeToken(code);
  } else if (access_token && refresh_token && expires_at) {
    // we are already authorized, notify React component
    window.dispatchEvent(new CustomEvent('spotifyAuthUpdate', {
      detail: {
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt: expires_at
      }
    }));
    getUserData();
  }

  // Listen for React component events
  window.addEventListener('spotifyLogin', () => {
    redirectToSpotifyAuthorizeEndpoint();
  });

  window.addEventListener('spotifyRefresh', () => {
    if (refresh_token) {
      refreshToken();
    }
  });

//   document
//     .getElementById('login-button')
//     .addEventListener('click', redirectToSpotifyAuthorizeEndpoint, false);

//   document
//     .getElementById('refresh-button')
//     .addEventListener('click', refreshToken, false);

//   document
//     .getElementById('logout-button')
//     .addEventListener('click', logout, false);
//};




     async function search(term) {
        console.log('c-log spotify search function ' + term);
        alert('In Spotify search function term is  : '+ term);
        const code = args.get('code');
        alert(code);
        if(!code){
            await redirectToSpotifyAuthorizeEndpoint();
        alert('redirected to get code:'+code);
        }else{
                alert('allready Have code:'+code);

          let access_token = localStorage.getItem('access_token') || null;

        //const accessToken = await getAccessToken();
        console.log('Searching Spotify for:', term);
        const searchLimit = 10;
        const endpoint = `https://api.spotify.com/v1/search?q=${term}&type=track&limit=${searchLimit}`;
        return await fetch(endpoint, {
            headers: {
                Authorization: `Bearer ` + access_token
            }
        }).then(response => {
            return response.json();
        }).then(jsonResponse => {
              if (!jsonResponse.tracks) {
                  console.log('No tracks found');
                  return [];
                  }
    console.log(jsonResponse.tracks.items);
    
    // Return the formatted track data instead of just logging it
    return jsonResponse.tracks.items.map(track => ({
        id: track.id,
        name: track.name,
        artist: track.artists[0].name,
        album: track.album.name,
        uri: track.uri
            }))});
    }}

    const Spotify = {
    search: search
  }
}
}
export default Spotify