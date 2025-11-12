import React from 'react';
import './Profile.css';
import Spotify from '../../util/spotify.js';

class Profile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: false,
      userProfile: null,
      accessToken: null,
      refreshToken: null,
      expiresAt: null
    };
  }

  componentDidMount() {
    // Check if user is already logged in
    const accessToken = localStorage.getItem('spotify_access_token');
    const expiresAt = localStorage.getItem('spotify_token_expiry');
    const refreshToken = localStorage.getItem('spotify_refresh_token');

    if (accessToken && expiresAt) {
      this.setState({
        isLoggedIn: true,
        accessToken,
        refreshToken,
        expiresAt
      });
      this.fetchUserProfile();
    }

    // Listen for Spotify auth updates
window.addEventListener('profileLoaded', this.handleProfileLoaded.bind(this));  
}

  componentWillUnmount() {
window.removeEventListener('profileLoaded', this.handleProfileLoaded.bind(this));  
}

handleProfileLoaded = () => {
  const accessToken = localStorage.getItem('spotify_access_token');
  const expiresAt = localStorage.getItem('spotify_token_expiry');
  const refreshToken = localStorage.getItem('spotify_refresh_token');
  
  if (accessToken && expiresAt && Date.now() < parseInt(expiresAt)) {
    this.setState({
      isLoggedIn: true,
      accessToken,
      refreshToken,
      expiresAt
    });
    this.fetchUserProfile();
  }
}


  fetchUserProfile = () => {
    const { accessToken } = this.state;
    if (!accessToken) return;

    fetch('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
    .then(async (response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw await response.json();
      }
    })
    .then((data) => {
      this.setState({ userProfile: data });
    })
    .catch((error) => {
      console.error('Error fetching user profile:', error);
    });
  }

handleLogin = () => {
  // Trigger Spotify auth flow
  Spotify.search('test').catch(() => {}); // This will trigger the auth flow
}


  handleLogout = () => {
    localStorage.clear();
    this.setState({
      isLoggedIn: false,
      userProfile: null,
      accessToken: null,
      refreshToken: null,
      expiresAt: null
    });
    window.location.reload();
  }

  handleRefreshToken = () => {
    // Trigger token refresh
    window.dispatchEvent(new CustomEvent('spotifyRefresh'));
  }

  render() {
    const { isLoggedIn, userProfile, accessToken, refreshToken, expiresAt } = this.state;

    if (!isLoggedIn) {
      return (
        <div className="profile-container">
          <div className="login-section">
            <h2>Connect to Spotify</h2>
            <p>Log in with your Spotify account to search for music and create playlists.</p>
            <button onClick={this.handleLogin} className="login-button">
              Log in with Spotify
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="profile-container">
        <div className="user-profile">
          {userProfile && (
            <div className="profile-info">
              <h2>Welcome, {userProfile.display_name}!</h2>
              <div className="profile-details">
                <div className="profile-image">
                  {userProfile.images && userProfile.images[0] && (
                    <img src={userProfile.images[0].url} alt="Profile" />
                  )}
                </div>
                <div className="profile-data">
                  <p><strong>Display name:</strong> {userProfile.display_name}</p>
                  <p><strong>Email:</strong> {userProfile.email}</p>
                  <p><strong>Country:</strong> {userProfile.country}</p>
                  <p><strong>Followers:</strong> {userProfile.followers.total}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="oauth-info">
            <h3>Session Info</h3>
            <p><strong>Access Token:</strong> {accessToken ? `${accessToken.substring(0, 20)}...` : 'None'}</p>
            <p><strong>Expires:</strong> {expiresAt ? new Date(parseInt(expiresAt)).toLocaleString() : 'Unknown'}</p>
          </div>

          <div className="profile-actions">
            <button onClick={this.handleRefreshToken} className="refresh-button">
              Refresh Token
            </button>
            <button onClick={this.handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default Profile;