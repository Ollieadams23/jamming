import React from 'react';
import TrackList from '../TrackList/TrackList';

class Playlist extends React.Component {
  render() {
    return (
    <div className="Playlist">{this.props.Playlists[1].name} <br/>
    {console.log(this.props.Playlists[0].name)}
  <input defaultValue={'New Playlist'}/>
  {/* <!-- Add a TrackList component --> */}
  <TrackList tracks={this.props.PlaylistTracks} onRemove={this.props.onRemove} isRemoval={true}/>
  <button className="Playlist-save">SAVE TO SPOTIFY</button>
</div>
);
  }
}

export default Playlist;