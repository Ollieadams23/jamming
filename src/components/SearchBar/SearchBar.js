import React from 'react'; // Import React as it's a React component

class SearchBar extends React.Component {
  render() {
    return (
            <div className="SearchBar">
        <input placeholder="Enter A Song, Album, or Artist" />
        <button class="SearchButton">SEARCH</button>
        </div>
    );
  }
}

export default SearchBar; // Export the SearchBar component