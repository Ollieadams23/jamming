
const url = window.location.href;
//let accessToken = null;
let expiresIn = null;

const client_id = '5ae439d04bd5467484c057d464a3bc8b';
const client_secret = '0d2c4839f0604b7eb7b8811c4dc32722';
//const redirect_uri = 'http://127.0.0.1:3000/';
const scopes = 'playlist-modify-public playlist-modify-private';
const tokenEndpoint = 'https://accounts.spotify.com/api/token';

//code verifier and challenge for PKCE flow
const generateRandomString = (length) => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}

const codeVerifier  = generateRandomString(64);

const sha256 = async (plain) => {
  const encoder = new TextEncoder()
  const data = encoder.encode(plain)
  return window.crypto.subtle.digest('SHA-256', data)
}

const base64encode = (input) => {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}


//removed await from hashed
const hashed =  sha256(codeVerifier)
const codeChallenge = base64encode(hashed);

//request authorization
const clientId = '5ae439d04bd5467484c057d464a3bc8b';
const redirectUri = 'http://127.0.0.1:3000/next.html';

const scope = 'user-read-private user-read-email';
const authUrl = new URL("https://accounts.spotify.com/authorize")

// generated in the previous step
window.localStorage.setItem('code_verifier', codeVerifier);

const params =  {
  response_type: 'code',
  client_id: clientId,
  scope,
  code_challenge_method: 'S256',
  code_challenge: codeChallenge,
  redirect_uri: redirectUri,
}

authUrl.search = new URLSearchParams(params).toString();
console.log("Auth URL:", authUrl.toString());
window.location.href = authUrl.toString();





// console.log(authUrl);
// const fetchData = async function (url) {
//   try {
//     const response = await fetch(url);
//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }
//     const data = await response.json();
//         console.log('Data fetched successfully:', data);  

//     return data;
//   } catch (error) {
//     console.log('Error:' + error);
//     throw error;
//   }
// };

// (async () => {
//   try {
//     const data = await fetchData(authUrl);
//     console.log('Response data:', data);
//   } catch (error) {
//     console.error('Error:', error);
//   }
// })();


// console.log(fetchData ())

// //console.log("after calling URL:", returl);
// //const code = url.match(/code=([^&]*)/);
// console.log("code=", code);

// fetch(tokenEndpoint, {
//   method: 'POST',
  
//   headers: {
//     'Authorization': 'Basic ' + btoa(client_id + ':' + client_secret),
//     'Content-Type': 'application/x-www-form-urlencoded'
//   },
  
// })
// .then(response => response.json())
// .then(data => {
//   // Handle the response data
//   console.log(data.access_token);
//   console.log(data.refresh_token);
//   console.log(data.expires_in);
// })
// .catch(error => {
//   console.error('Error:', error);
// });

// export function getAccessToken(){
//     if(accessToken){
//         return accessToken;
//     }
//     console.log(code)
//     console.log(url)
//     const accessTokenMatch = url.match(/access_token=([^&]*)/);
//     const expiresInMatch = url.match(/expires_in=([^&]*)/);
//     accessToken = accessTokenMatch ? accessTokenMatch[1] : null;
//     expiresIn = expiresInMatch ? parseInt(expiresInMatch[1]) : null;

//     if(accessToken){
//     if (expiresIn) {
//   window.setTimeout(() => {
//     accessToken = null;
//   }, expiresIn * 1000);
//     }
//     window.history.pushState('Access Token', null, '/');
//         return accessToken;

//     }
//         console.log('Access Token:', accessToken);
//         console.log('Expires In:', expiresIn);

    
//     window.location = authUrl;


// }



// const Spotify = {
//      async search(term) {
//         const accessToken = await getAccessToken();
//         console.log('Searching Spotify for:', term);
//         const endpoint = `https://api.spotify.com/v1/search?type=track&q=called+to+the+night`;
//         return await fetch(endpoint, {
//             headers: {
//                 Authorization: `Bearer ${accessToken}`
//             }
//         }).then(response => {
//             return response.json();
//         }).then(jsonResponse => {
//             if (!jsonResponse.tracks) {
//                 return alert('No tracks found');
//             }
//             {console.log(jsonResponse.tracks.items)};
//             {alert(JSON.stringify(jsonResponse.tracks.items))};
//             return jsonResponse.tracks.items.map(track => ({
//                 id: track.id,
//                 name: track.name,
//                 artist: track.artists[0].name,
//                 album: track.album.name,
//                 uri: track.uri
//             }));
//         });
//     }
// }

// export default Spotify