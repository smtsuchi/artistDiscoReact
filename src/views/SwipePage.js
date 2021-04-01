import React, { Component } from 'react';
import Cookies from 'js-cookie';
import "../css/ArtistCards.css";
import "../css/Footer.css";
import "../css/SwipePage.css"
import Footer from '../components/Footer';
import ArtistCards from '../components/ArtistCards';

// const alreadyRemoved = [];
// let charactersState = 'hi';
export default class SwipePage extends Component {
    constructor () {
        super();

        this.state = {
            first_time: true,
            artists: [],
            liked_count:0,
            liked:[],
            used:[],
            visited: new Set(),
            childRefs: []
            // artists: [{
            //     name: 'JID',
            //     image: 'https://i.scdn.co/image/659753bacc8aa2a9adae586a3642fd45a03d8830',
            //     id: '6U3ybJ9UHNKEdsH7ktGBZ7',
            //     track_preview: ''
            // },
            // {
            //     name: 'Saba',
            //     image: 'https://i.scdn.co/image/295664bfdd01707ae9dc94382bfdc00ea93de8e8',
            //     id: '7Hjbimq43OgxaBRpFXic4x',
            //     track_preview: ''
            // }]
        }
        this.onCardLeftScreen = this.onCardLeftScreen.bind(this);
        
    }

    async getTopTracks(artist_id) {
        let res = await fetch('https://api.spotify.com/v1/artists/'+ artist_id + '/top-tracks?market=US', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + Cookies.get('spotifyAuthToken')
            }
        })
        let data = await res.json();
        // console.log(data);
        let track_num=0;
        if (data.tracks.length === 0) { return null}
        while (!data.tracks[track_num].preview_url) {
            track_num++;
            if (track_num>data.tracks.length-1) {track_num--; break;}
        }
        if (data.tracks[track_num].preview_url) {
            return data.tracks[track_num].preview_url;
        }
        return  null
    }

    async getRelatedArtists(artist_id, remaining_deck_length) {
        let res = await fetch(`https://api.spotify.com/v1/artists/${artist_id}/related-artists`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + Cookies.get('spotifyAuthToken')
            }
        })
        let data = await res.json()
        let current_artist = this.state.artists.slice(0,remaining_deck_length);
        let current_ids_on_table = current_artist.map(artist => artist.id)
        let checklist=new Set(data.artists.map(artist => artist.id))
        let filtered_data = data.artists.filter(artist => {if (checklist.has(artist.id)) {checklist.delete(artist.id); return true} return false}).filter(artist => ((!this.state.visited.has(artist.id)&&!current_ids_on_table.includes(artist.id))&&artist.images.length>0))
        // if (filtered_data.length === 0) {
        //     for (let playlistArtist of this.props.location.state.artist_id) {
        //         if (!this.state.used.includes(playlistArtist)) {
        //             this.getRelatedArtists(playlistArtist);
        //             break;
        //         }
        //     }
        //     return
        // }
        for (let i = 0; i<filtered_data.length; i++) {
            let track_preview= await this.getTopTracks(filtered_data[i].id);
            filtered_data[i].track_preview = track_preview;
        }
        current_artist = filtered_data.concat(current_artist)
        let child_refs = Array(current_artist.length).fill(0).map(i => React.createRef())
        console.log('updated deck', current_artist);
        this.setState({
            artists: current_artist,
            used: this.state.used.concat(artist_id),
            childRefs: child_refs
        })
        console.log('spotify api response', data);
    }


    componentDidMount() {
        if (this.state.first_time) {
            let count=0;
            while (count<this.state.used.length && this.state.used.includes(this.props.location.state.artist_id[count])) {
                count++;
            }
            this.setState({ first_time: false });
            this.getRelatedArtists(this.props.location.state.artist_id[count])
        }
        this.exButton = React.createRef()
        console.log('mounted again..')
        // else {this.getRelatedArtists(this.state.liked[this.state.liked_count])}
        

    }

    onSwipe = (direction, artistObject) => {
        if (direction === 'left') {
            console.log('Swiped left on ' + artistObject.name)
        }
        else if (direction === 'right') {
            console.log('Swiped right on ' + artistObject.name)
            this.setState({ liked: this.state.liked.concat(artistObject.id) })
        }
    }

    swipe = (direction) => {
        // if (document.getElementById("deck")){
        //     let top_card = document.getElementById("deck").getElementsByClassName("individual-card");
        //     console.log('hi', top_card)
        //     let card = document.getElementById("360IAlyVv4PCEVjgyMZrxK");
        //     console.log('card', card)
        // }
        const cardsLeft = this.state.artists //.filter(person => !alreadyRemoved.includes(person.name))
        if (cardsLeft.length) {
            let indexToBeRemoved = cardsLeft.length - 1 // Find the card object to be removed
            while (!this.state.childRefs[indexToBeRemoved].current && indexToBeRemoved>-1) {
                indexToBeRemoved-=1
            }
        //   const index = db.map(person => person.name).indexOf(toBeRemoved) // Find the index of which to make the reference to
        // Make sure the next card gets removed next time if this card do not have time to exit the screen
          this.state.childRefs[indexToBeRemoved].current.swipe(direction) // Swipe the card!
        }
        console.log('Button Swipe: ', direction)
    }
    

    onCardLeftScreen(myName, myIdentifier) {
        console.log(myName + ' left the screen');
        this.exButton.current.removeAttribute("disabled");
        // const removeMe = document.getElementById(myIdentifier);
        // removeMe.remove();
        let newArtists=this.state.artists.filter(artist => artist.id !== myIdentifier)
        let deckLength=document.getElementById("deck").getElementsByClassName("individual-card").length;
        console.log('deck length: ', deckLength);
        this.setState({ 
            visited: new Set(this.state.visited).add(myIdentifier),
            artists: newArtists
        });
        if (deckLength <= 8) {
            let count=this.state.liked_count;
            while (this.state.used.includes(this.state.liked[count])){
                count++;
            }
            this.setState({
                liked_count: count,
                used: this.state.used.concat(this.state.liked.slice(0,count))
            })
            if (this.state.liked[count]) {
                this.getRelatedArtists(this.state.liked[count],deckLength-1)
            }
            else {
                for (let playlistArtist of this.props.location.state.artist_id) {
                    if (!this.state.used.includes(playlistArtist)) {
                        console.log(playlistArtist);
                        this.getRelatedArtists(playlistArtist);
                        break;
                    }
            }}
        };

        
    }
    

    render() {
        return (
            <div className="swipePage  loading-gif">
                <div id="deck" className="artistCards__cardContainer">
                    {this.state.artists
                    .filter(artist => (!this.state.visited.has(artist.id)))
                    .map( (artist,i) => (<ArtistCards childRef={this.state.childRefs[i]} key={artist.id} artist={artist}  onSwipe={this.onSwipe} onCardLeftScreen={this.onCardLeftScreen} />))}
                </div>
                <Footer exButton={this.exButton} swipe={this.swipe} />
            </div>
        )
    }
}
