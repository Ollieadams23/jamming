import React from 'react';
import SearchBar from '../SearchBar/SearchBar';
import SearchResults from '../SearchResults/SearchResults';
import Playlist from '../Playlist/Playlist';
import './App.css';
import Spotify from '../../util/spotify.js';



class App extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
    SearchResults:[
          {name: 'jjj7',
          artist: 'artist',
          album: 'album',
          id: '7'},
          {name: 'jjj8',
          artist: 'artist',
          album: 'album',
          id: '8'},
          {name: 'jjj9',
          artist: 'artist',
          album: 'album',
          id: '9'}
    ],
    

      
    PlaylistName: 'My Playlist0',
      
    

      PlaylistTracks: [
        {name: 'aaa',
        artist: 'artist',
        album: 'album',
        id: '2'},
        {name: 'bbb',
        artist: 'artist',
        album: 'album',
        id: '3'},
        {name: 'ccc',
        artist: 'artist',
        album: 'album',
        id: '4'}
        ]}


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
      //to be implemented
    }

    search(term) {
      console.log(term);
      Spotify({term})
      //commented out this .then as not working throws error
      // .then(tracks => {
      //   this.setState({SearchResults: tracks});
      // });

      //to be implemented
    }


  render() {
    //console.log(...this.state.SearchResults)
  return (
    <div>
  <h1>Ja<span className="highlight">mmm</span>ing</h1>
  <div className="App">
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
