

const urlParams = new URLSearchParams(window.location.search);
let code = urlParams.get('code');


//get token
const getToken = async code => {

  // stored in the previous step
  const codeVerifier = localStorage.getItem('code_verifier');

  const url = "https://accounts.spotify.com/api/token";
  const payload = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    }),
  }

  //removed await
  const body =  fetch(url, payload);
  const response =  body.json();

  localStorage.setItem('access_token', response.access_token);
}


//get user profile
async function getProfile(accessToken1) {
  let accessToken = localStorage.getItem('access_token');

  const response = await fetch('https://api.spotify.com/v1/me', {
    headers: {
      Authorization: 'Bearer ' + accessToken
    }
  });

  const data = await response.json();
  console.log(data);
}




export default getProfile;
