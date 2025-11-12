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
    PlaylistName: 'My Playlist0',
    PlaylistTracks: []
        
        }


    //binds
    this.addTrack = this.addTrack.bind(this);
    this.removeTrack = this.removeTrack.bind(this);
    this.updatePlaylistName = this.updatePlaylistName.bind(this);
    this.savePlaylist = this.savePlaylist.bind(this);
    this.search = this.search.bind(this);

    }
  
//methods
    addTrack(track) {
      let tracks = this.state.PlaylistTracks;
      console.log(tracks);
      if (tracks.find(savedTrack => savedTrack.id === track.id)) {
  return;
}
      tracks.push(track);
      this.setState({PlaylistTracks: tracks});
    }
  
    removeTrack(track) {
      let tracks = this.state.PlaylistTracks;
      tracks = tracks.filter(currentTrack => currentTrack.id !== track.id);
      this.setState({PlaylistTracks: tracks});
    }

    updatePlaylistName(name) {
      this.setState({PlaylistName: name});
    }

    savePlaylist() {
      // Extract track URIs from the current playlist tracks
      const trackUris = this.state.PlaylistTracks.map(track => track.uri);
      
      // Call Spotify.savePlaylist with playlist name and track URIs
      Spotify.savePlaylist(this.state.PlaylistName, trackUris);
      
      // Reset the playlist after saving
      this.setState({PlaylistName: "new playlist"});
      this.setState({PlaylistTracks: []});
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


  render() {
    //console.log(...this.state.SearchResults)
  return (
    <div>
  <h1>Ja<span className="highlight">mmm</span>ing</h1>
  <div className="App">
    <Profile />
    <SearchBar onSearch={this.search}/>
    {/* <!-- Add a SearchBar component --> */}
    <SearchResults SearchResults={this.state.SearchResults} onAdd={this.addTrack}/>
    
    <div className="App-playlist" >
      <Playlist onSave={this.savePlaylist} onNameChange={this.updatePlaylistName} Playlists={this.state.PlaylistName} PlaylistTracks={this.state.PlaylistTracks} onRemove={this.removeTrack}/>
      {/* <!-- Add a Playlist component --> */}
    </div>
  </div>
</div>
  );
}}


export default App;
