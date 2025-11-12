import React from 'react';
import SearchBar from '../SearchBar/SearchBar';
import SearchResults from '../SearchResults/SearchResults';
import Playlist from '../Playlist/Playlist';
import Profile from '../Profile/Profile';
import './App.css';
import Spotify from '../../util/spotify.js';



class App extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
    SearchResults: [],
    PlaylistName: '',
    PlaylistTracks: [],
    UserPlaylists: [],
    CurrentPlaylistId: null,
    isPlaylistSaved: false,
    isLoadingAuth: false // Add loading state for authentication
        
        }


    //binds
    this.addTrack = this.addTrack.bind(this);
    this.removeTrack = this.removeTrack.bind(this);
    this.updatePlaylistName = this.updatePlaylistName.bind(this);
    this.savePlaylist = this.savePlaylist.bind(this);
    this.search = this.search.bind(this);
    this.updateUserPlaylists = this.updateUserPlaylists.bind(this);
    this.loadPlaylist = this.loadPlaylist.bind(this);
    this.createNewPlaylist = this.createNewPlaylist.bind(this);
    this.deletePlaylist = this.deletePlaylist.bind(this);
    this.refreshPlaylists = this.refreshPlaylists.bind(this);

    }

  componentDidMount() {
    // Check if we just came back from Spotify auth
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get('code');
    
    if (authCode) {
      // Show loading indicator while processing auth
      this.setState({ isLoadingAuth: true });
      
      // Wait longer for token exchange to complete and Profile component to initialize
      setTimeout(() => {
        const token = localStorage.getItem('spotify_access_token');
        if (token) {
          // Force refresh playlists after successful auth
          console.log('Auth completed, refreshing playlists...');
          this.refreshPlaylists();
        } else {
          console.log('No token found after auth');
        }
        // Hide loading indicator
        this.setState({ isLoadingAuth: false });
      }, 2000); // Increased to 2 seconds to ensure token exchange completes
    }
  }
  
//methods
    addTrack(track) {
      let tracks = this.state.PlaylistTracks;
      console.log(tracks);
      if (tracks.find(savedTrack => savedTrack.id === track.id)) {
  return;
}
      tracks.push(track);
      this.setState({
        PlaylistTracks: tracks,
        isPlaylistSaved: false // Mark as unsaved when tracks are added
      });
    }
  
    removeTrack(track) {
      let tracks = this.state.PlaylistTracks;
      tracks = tracks.filter(currentTrack => currentTrack.id !== track.id);
      this.setState({
        PlaylistTracks: tracks,
        isPlaylistSaved: false // Mark as unsaved when tracks are removed
      });
    }

    updatePlaylistName(name) {
      this.setState({
        PlaylistName: name,
        isPlaylistSaved: false // Mark as unsaved when name is changed
      });
    }

    savePlaylist() {
      // Extract track URIs from the current playlist tracks
      const trackUris = this.state.PlaylistTracks.map(track => track.uri);
      
      // Call Spotify.savePlaylist with playlist name, track URIs, and playlist ID (if editing existing)
      Spotify.savePlaylist(this.state.PlaylistName, trackUris, this.state.CurrentPlaylistId).then(() => {
        // Mark as saved after successful save
        this.setState({ isPlaylistSaved: true });
        // Refresh the playlists list to show changes
        this.refreshPlaylists();
      }).catch(error => {
        console.error('Save failed:', error);
        // Keep saved state as false if save failed
      });
      
      // If it was a new playlist (no CurrentPlaylistId), reset after saving
      if (!this.state.CurrentPlaylistId) {
        this.setState({PlaylistName: ""});
        this.setState({PlaylistTracks: []});
        this.setState({isPlaylistSaved: false}); // Reset saved state for new playlist
      }
    }

    search(term) {
  console.log('Searching for:', term);
  
  // Capture the Promise returned by Spotify function
  const searchPromise = Spotify.search(term);
  
  // Handle the results when they come back
  if (searchPromise && searchPromise.then) {
    searchPromise.then(tracks => {
      console.log('Received tracks:', tracks);
      alert(`Found ${tracks ? tracks.length : 0} tracks`);
      
      // Update state with the real search results
      console.log('About to update state with tracks:', tracks);
      console.log('Current SearchResults state before update:', this.state.SearchResults);
      this.setState({SearchResults: tracks || []});
      console.log('State updated! New SearchResults:', this.state.SearchResults);
    }).catch(error => {
      console.error('Search failed:', error);
      alert('Search failed');
    });
  }
}

    updateUserPlaylists(playlists) {
      console.log('App: updateUserPlaylists called with:', playlists);
      this.setState({UserPlaylists: playlists});
      console.log('App: UserPlaylists state updated');
    }

    refreshPlaylists() {
      console.log('refreshPlaylists called');
      // Call Spotify API to get fresh playlist data
      Spotify.getUserPlaylists().then(playlists => {
        console.log('Got playlists from API:', playlists);
        this.setState({UserPlaylists: playlists});
        console.log('Updated UserPlaylists state');
      }).catch(error => {
        console.error('Error refreshing playlists:', error);
      });
    }

    loadPlaylist(playlist) {
      console.log('Loading playlist:', playlist);
      
      // Update the playlist name and current playlist ID
      this.setState({
        PlaylistName: playlist.name,
        CurrentPlaylistId: playlist.id,
        isPlaylistSaved: true // Loaded playlist is considered saved initially
      });
      
      // Fetch the tracks from the playlist
      Spotify.getPlaylistTracks(playlist.id).then(tracks => {
        console.log('Loaded playlist tracks:', tracks);
        this.setState({PlaylistTracks: tracks});
      }).catch(error => {
        console.error('Error loading playlist tracks:', error);
        alert('Failed to load playlist tracks');
      });
    }

    createNewPlaylist() {
      this.setState({
        PlaylistName: '',
        PlaylistTracks: [],
        CurrentPlaylistId: null,
        isPlaylistSaved: false
      });
    }

    deletePlaylist() {
      if (window.confirm("Are you sure you want to delete this playlist?")) {
        Spotify.deletePlaylist(this.state.CurrentPlaylistId).then(() => {
          // Clear the current playlist after successful deletion
          this.setState({
            PlaylistName: "",
            PlaylistTracks: [],
            CurrentPlaylistId: null,
            isPlaylistSaved: false
          });
          // Refresh the playlists list to show changes
          this.refreshPlaylists();
        }).catch(error => {
          console.error('Delete failed:', error);
        });
      }
    }


  render() {
    //console.log(...this.state.SearchResults)
  return (
    <div>
  <h1>Total Ja<span className="highlight">mm</span>s</h1>
  <div className="App">
    <Profile onPlaylistsUpdate={this.updateUserPlaylists} />
    
    {/* Loading overlay for authentication */}
    {this.state.isLoadingAuth && (
      <div className="loading-overlay">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your Spotify data...</p>
        </div>
      </div>
    )}
    
    <div className="App-main-content">
      <div className="App-left-panel">
        <div className="user-playlists-section">
          <div className="playlists-header">
            <h2>Your Playlists ({this.state.UserPlaylists.length})</h2>
            <button className="new-playlist-btn" onClick={this.createNewPlaylist}>
              + New Playlist
            </button>
          </div>
          <div className="playlists-list">
            {this.state.UserPlaylists.length > 0 ? (
              this.state.UserPlaylists.map(playlist => (
                <div 
                  key={playlist.id} 
                  className={`playlist-item ${playlist.id === this.state.CurrentPlaylistId ? 'active' : ''}`}
                  onClick={() => this.loadPlaylist(playlist)}
                >
                  <div className="playlist-info">
                    <h4>{playlist.name}</h4>
                    <p>{playlist.tracks} tracks • {playlist.public ? 'Public' : 'Private'}</p>
                    {playlist.description && <p className="playlist-description">{playlist.description}</p>}
                  </div>
                </div>
              ))
            ) : (
              <p>No playlists found. Login to see your playlists.</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="App-right-panel">
        <SearchBar onSearch={this.search}/>
        <SearchResults SearchResults={this.state.SearchResults} onAdd={this.addTrack}/>
        
        <div className="App-playlist">
          <Playlist 
            onSave={this.savePlaylist} 
            onNameChange={this.updatePlaylistName} 
            onDelete={this.deletePlaylist}
            Playlists={this.state.PlaylistName} 
            PlaylistTracks={this.state.PlaylistTracks} 
            onRemove={this.removeTrack}
            canDelete={this.state.CurrentPlaylistId !== null}
            isPlaylistSaved={this.state.isPlaylistSaved}
          />
        </div>
      </div>
    </div>
  </div>
</div>
  );
}}


export default App;
