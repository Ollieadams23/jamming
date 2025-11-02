import React from 'react'; // Import React as it's a React component

class SearchBar extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            term: ''
        };


        //binds
        this.search = this.search.bind(this);
        this.handleTermChange = this.handleTermChange.bind(this);
    }

    search(term) {
        // const args = new URLSearchParams(window.location.search);
        // const code = args.get('code');
        // alert(code);
        this.props.onSearch(this.state.term);
    }

    handleTermChange(event) {
        
        this.setState({term: event.target.value});
        console.log(this.state.term);
    }


  render() {
    return (
            <div className="SearchBar">
        <input onChange={this.handleTermChange} placeholder="Enter A Song, Album, or Artist" />
        <button onClick={this.search} className="SearchButton">SEARCH</button>
        </div>
    );
  }
}

export default SearchBar; // Export the SearchBar component