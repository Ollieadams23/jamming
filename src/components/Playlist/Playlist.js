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
  <input onChange={this.handleNameChange} defaultValue={this.props.Playlists}/>
  {/* <!-- Add a TrackList component --> */}
  <TrackList tracks={this.props.PlaylistTracks} onRemove={this.props.onRemove} isRemoval={true}/>
  <button onClick={this.props.onSave} className="Playlist-save">SAVE TO SPOTIFY</button>
</div>
);
  }
}

export default Playlist;