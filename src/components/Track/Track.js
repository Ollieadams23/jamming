import React from "react";


class Track extends React.Component {

    constructor(props) {
        super(props);
        this.addTrack = this.addTrack.bind(this);
        this.removeTrack = this.removeTrack.bind(this);
    }

addTrack() {
            this.props.onAdd(this.props.track);
        }

removeTrack() {
            this.props.onRemove(this.props.track);
        }


renderAction  (){
            const isRemoval = this.props.isRemoval;
            if (!isRemoval) {
                return (<button onClick={this.addTrack} className="Track-action">+</button>);
            }
            return (<button onClick={this.removeTrack} className="Track-action">-</button>);
        }

     
  render() {

    //console.log(this.props.track)
        
    
    return (
        <div className="Track">
            <div className="Track-information">
                <h3>Track: {this.props.track.name}</h3>
                <p>Artist: {this.props.track.artist} | Album: {this.props.track.album}</p>
                <p>ID: {this.props.track.id}</p>
            </div>
            {this.renderAction()}
        </div>
    );
  }
}

export default Track;