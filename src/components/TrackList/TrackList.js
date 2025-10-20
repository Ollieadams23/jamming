import React from "react";
import Track from '../Track/Track.js';

import './TrackList.css';

class TrackList extends React.Component {



  render() {
    //console.log(...this.props.tracks)
    return (
             <div className="TrackList">
                {this.props.tracks.map((name, artist, album, id) => (
                    <Track onRemove={this.props.onRemove} isRemoval={this.props.isRemoval} onAdd={this.props.onAdd} key={id} track={name} artist={artist} album={album}/>
                ))}
                
                <button className="Track-action">+</button>
            </div>
    );
  }
  }

  export default TrackList;