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
      expiresAt: null,
      userPlaylists: [],
      isLoadingProfile: false
    };
  }

  componentDidMount() {
    console.log('Profile: componentDidMount called');
    // Check if user is already logged in
    const accessToken = localStorage.getItem('spotify_access_token');
    const expiresAt = localStorage.getItem('spotify_token_expiry');

    console.log('Profile: Initial token check - token exists:', !!accessToken, 'expires:', expiresAt);

    if (accessToken && expiresAt && Date.now() < parseInt(expiresAt)) {
      console.log('Profile: User already logged in, setting state and fetching data');
      this.setState({
        isLoggedIn: true,
        accessToken,
        expiresAt,
        isLoadingProfile: true
      });
      
      // Fetch profile and playlists, then hide loading
      Promise.all([
        this.fetchUserProfile(),
        this.fetchUserPlaylists()
      ]).finally(() => {
        this.setState({ isLoadingProfile: false });
        console.log('Profile: Initial data fetch complete');
      });
    } else {
      console.log('Profile: No valid token found on mount');
    }

    // Listen for Spotify auth updates
    console.log('Profile: Adding profileLoaded event listener');
window.addEventListener('profileLoaded', this.handleProfileLoaded.bind(this));  
}

  componentWillUnmount() {
window.removeEventListener('profileLoaded', this.handleProfileLoaded.bind(this));  
}

handleProfileLoaded = () => {
  console.log('Profile: handleProfileLoaded called');
  const accessToken = localStorage.getItem('spotify_access_token');
  const expiresAt = localStorage.getItem('spotify_token_expiry');
  
  console.log('Profile: Token check - token exists:', !!accessToken, 'expires:', expiresAt);
  
  if (accessToken && expiresAt && Date.now() < parseInt(expiresAt)) {
    console.log('Profile: Setting logged in state and fetching data');
    this.setState({
      isLoggedIn: true,
      accessToken,
      expiresAt,
      isLoadingProfile: true
    });
    
    // Fetch profile and playlists, then hide loading
    Promise.all([
      this.fetchUserProfile(),
      this.fetchUserPlaylists()
    ]).finally(() => {
      this.setState({ isLoadingProfile: false });
      console.log('Profile: Finished loading profile data');
    });
  } else {
    console.log('Profile: Token invalid or expired');
  }
}

  fetchUserPlaylists = () => {
    console.log('Profile: fetchUserPlaylists called');
    return Spotify.getUserPlaylists().then(playlists => {
      console.log('Profile: User playlists received:', playlists);
      this.setState({ userPlaylists: playlists });
      // Notify parent component about playlists
      if (this.props.onPlaylistsUpdate) {
        console.log('Profile: Calling onPlaylistsUpdate with playlists');
        this.props.onPlaylistsUpdate(playlists);
      }
    }).catch(error => {
      console.error('Profile: Error fetching playlists:', error);
    });
  }

  fetchUserProfile = () => {
    const { accessToken } = this.state;
    if (!accessToken) return Promise.resolve();

    return fetch('https://api.spotify.com/v1/me', {
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
      expiresAt: null
    });
    window.location.reload();
  }

  render() {
    const { isLoggedIn, userProfile, accessToken, expiresAt, isLoadingProfile } = this.state;

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

    if (isLoadingProfile) {
      return (
        <div className="profile-container">
          <div className="profile-loading">
            <div className="profile-spinner"></div>
            <p>Loading profile...</p>
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
            <p><em>Token will auto-refresh before expiration</em></p>
          </div>

          <div className="profile-actions">
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