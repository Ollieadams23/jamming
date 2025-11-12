import React from 'react';
import TrackList from '../TrackList/TrackList';

class Playlist extends React.Component {
    constructor(props) {
        super(props);
        this.handleNameChange = this.handleNameChange.bind(this);
    }

    handleNameChange(event) {
        console.log(event.target.value);
      this.props.onNameChange(event.target.value);
    }


  render() {
    return (
    <div  className="Playlist">{this.props.Playlists} <br/>
    {console.log("playlist " + this.props.Playlists)}
  <input 
    onChange={this.handleNameChange} 
    value={this.props.Playlists}
    placeholder="Enter playlist name..."
  />
  <div className="Playlist-actions">
    <div className="save-button-container">
      {this.props.isPlaylistSaved && <span className="saved-indicator">✓</span>}
      <button onClick={this.props.onSave} className="Playlist-save">SAVED TO SPOTIFY</button>
    </div>
    {this.props.canDelete && (
      <button onClick={this.props.onDelete} className="Playlist-delete">DELETE PLAYLIST</button>
    )}
  </div>
  {/* <!-- Add a TrackList component --> */}
  <TrackList tracks={this.props.PlaylistTracks} onRemove={this.props.onRemove} isRemoval={true}/>
</div>
);
  }
}

export default Playlist;