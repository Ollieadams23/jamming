import React from 'react';
import TrackList from '../TrackList/TrackList';
import Track from '../Track/Track';

class SearchResults extends React.Component {
  render() {
    //console.log(...this.props.SearchResults)
    return (
            <div className="SearchResults">
        <h2>Search Results</h2>
        {/* <!-- Add a TrackList component --> */}
        <TrackList tracks={this.props.SearchResults} onAdd={this.props.onAdd} isRemoval={false} />
        </div>);
  }

}
  export default SearchResults;