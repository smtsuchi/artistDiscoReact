import React, { Component } from 'react';
import Cookies from 'js-cookie';
import "../css/ArtistCards.css";
import "../css/Footer.css";
import "../css/SwipePage.css"
import Footer from '../components/Footer';
import ArtistCards from '../components/ArtistCards';
import { Redirect } from 'react-router-dom';

// const alreadyRemoved = [];
// let charactersState = 'hi';
export default class SwipePage extends Component {
    constructor () {
        super();

        this.state = {
            artists: [],
            liked_count:0,
            liked:[],
            used:[],
            visited: new Set(),
            childRefs: [],
            category_name: '',
            redirect:null
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
        this.updateAfterLeaveScreen = this.updateAfterLeaveScreen.bind(this);
        this.updateLiked = this.updateLiked.bind(this);
        this.exButton = React.createRef();
        
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
        if (data.tracks.length === 0) {
            return {
                preview_url: null,
                track_id: null,
                track_name: null,
                track_thumbnail: null
            };
        }
        while (!data.tracks[track_num].preview_url) {
            track_num++;
            if (track_num>data.tracks.length-1) {track_num--; break;}
        }
        if (data.tracks[track_num].preview_url) {
            const myTrack=data.tracks[track_num]
            let track_thumbnail = null;
            if (myTrack.album.images && myTrack.album.images[0]){
                track_thumbnail = myTrack.album.images[0].url
            } 
            return {
                preview_url: myTrack.preview_url,
                track_id: myTrack.id,
                track_name: myTrack.name,
                track_thumbnail: track_thumbnail
            };
        }
        let myTrack=data.tracks[0]
        let track_thumbnail = null;
        if (myTrack.album.images && myTrack.album.images[0]){
            track_thumbnail = myTrack.album.images[0].url
        } 
        return {
            preview_url: myTrack.preview_url,
            track_id: myTrack.id,
            track_name: myTrack.name,
            track_thumbnail: track_thumbnail
        };
    }

    async getRelatedArtists(artist_id, remaining_deck_length) {
        if (Cookies.get('spotifyAuthToken')){
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

            for (let i = 0; i<filtered_data.length; i++) {
                let track_details= await this.getTopTracks(filtered_data[i].id);
                const track_preview = track_details.preview_url;
                const track_id = track_details.track_id
                const track_name = track_details.track_name
                const track_thumbnail = track_details.track_thumbnail
                filtered_data[i].track_preview = track_preview;
                filtered_data[i].track_id = track_id;
                filtered_data[i].track_name = track_name;
                filtered_data[i].track_thumbnail = track_thumbnail;
            }
            current_artist = filtered_data.concat(current_artist)
            let child_refs = Array(current_artist.length).fill(0).map(i => React.createRef())
            console.log('updated deck', current_artist);


            // update db with cards_on_table, used, child_refs
            let raw = JSON.stringify({
                artists: current_artist,
                used: this.state.used.concat(artist_id),
                child_refs: child_refs
            });

            this.setState({
                artists: current_artist,
                used: this.state.used.concat(artist_id),
                childRefs: child_refs,
                category_name: this.props.location.state.category_name
            })
            
            // console.log('raw: ', raw)
            let postres = await fetch(`https://artist-disco-express-backend.herokuapp.com/patch-category/${this.props.location.state.current_user_id}/${this.props.location.state.category_name}`, {
                method: 'POST',
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                redirect: 'follow',
                body: raw
            })
            let postdata = await postres.json()
            console.log(`updated ${this.props.location.state.category_name} category: `, postdata)

            console.log('spotify api response', data);
        }
        else {
            console.log('No Token.. Redirecting')
            this.setState({redirect:'/login'})

        }
    }


    async componentDidMount() {
        if (this.props.location.state){
            const category_name = this.props.location.state.category_name
            if (this.props.location.state.first_time) {
                let count=0;
                while (count<this.state.used.length && this.state.used.includes(this.props.location.state.artist_id[count])) {
                    count++;
                }
                this.getRelatedArtists(this.props.location.state.artist_id[count])
                this.setState({buffer: this.props.location.state.artist_id})
            }
            else {
                //grab data from database then set state to re-render
                console.log('else')

                let getres = await fetch(`https://artist-disco-express-backend.herokuapp.com/category/${this.props.location.state.current_user_id}/${category_name}`, {
                    method: 'GET'
                });
                let getdata = await getres.json()
                // console.log(`get ${this.props.location.state.category_name} category: `, getdata)
                let data = getdata.myCategory
        
                this.setState({
                    artists: data.artists,
                    buffer: data.buffer,
                    used: data.used,
                    childRefs: data.childRefs,
                    liked: data.liked,
                    liked_count: data.liked_count,
                    visited: new Set(data.visited),
                    category_name: category_name
                })
            }
            // this.exButton = React.createRef()
            console.log('mounted again..')
            // else {this.getRelatedArtists(this.state.liked[this.state.liked_count])}
        }
        else {
            console.log('No State.. Redirecting')
            this.setState({redirect:'/login'})
        }

    }

    async updateLiked(artist_id) {
        let raw = JSON.stringify({artist_id:artist_id});
        let postres = await fetch(`https://artist-disco-express-backend.herokuapp.com/patch-category-liked/${this.props.location.state.current_user_id}/${this.props.location.state.category_name}`, {
            method: 'POST',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            redirect: 'follow',
            body: raw
        })
        let postdata = await postres.json()
        console.log(`updated ${this.props.location.state.category_name} liked : `, postdata)
    }

    follow(artist_id) {
        fetch(`https://api.spotify.com/v1/me/following?type=artist&ids=${artist_id}`, {
            method: "PUT",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": "Bearer " + Cookies.get('spotifyAuthToken')
            }
        });
        console.log('follow');
    }
    fav(track_id) {
        if (track_id){
            fetch(`https://api.spotify.com/v1/me/tracks?ids=${track_id}`, {
                method: "PUT",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + Cookies.get('spotifyAuthToken')
                }
            });
            console.log('fav');
        }
        else { console.log('no available track') }
    }
    atp(track_id) {
        const playlist_id = this.props.location.state.my_playlist
        if (track_id){
            fetch(`https://api.spotify.com/v1/playlists/${playlist_id}/tracks?uris=spotify%3Atrack%3A${track_id}`, {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + Cookies.get('spotifyAuthToken')
                }
            });
            console.log('atp');
        }
        else { console.log("Couldn't add son to playlist") }
    }

    onSwipe = (direction, artistObject) => {
        let sounds = document.getElementsByTagName('audio');
        for (let i=0; i<sounds.length; i++) sounds[i].pause();

        if (direction === 'left') {
            console.log('Swiped left on ' + artistObject.name)
        }
        else if (direction === 'right') {
            let short = this.props.location.state
            console.log('Swiped right on ' + artistObject.name)
            
            this.setState({ liked: this.state.liked.concat(artistObject.id) })
            this.updateLiked(artistObject.id);
            if (short.atp){this.atp(artistObject.track_id)}
            if (short.fav){this.fav(artistObject.track_id)}
            if (short.follow){this.follow(artistObject.id)}
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

    async updateAfterLeaveScreen(visited, artists) {
        let visitedArr = Array.from(visited)
        let raw = JSON.stringify({visited: visitedArr, artists: artists});
        let postres = await fetch(`https://artist-disco-express-backend.herokuapp.com/patch-category-leave-screen/${this.props.location.state.current_user_id}/${this.props.location.state.category_name}`, {
            method: 'POST',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            redirect: 'follow',
            body: raw
        })
        let postdata = await postres.json()
        console.log(`updated ${this.props.location.state.category_name} visited and artists (on table) : `, postdata)
    }

    onCardLeftScreen(myName, myIdentifier) {
        console.log(myName + ' left the screen');
        this.exButton.current.removeAttribute("disabled");
        
        let visited = new Set(this.state.visited).add(myIdentifier)
        // console.log('visited', visited)

        let newArtists=this.state.artists.filter(artist => artist.id !== myIdentifier)
        let deckLength=document.getElementById("deck").getElementsByClassName("individual-card").length;
        console.log('deck length: ', deckLength);
        
        this.setState({ 
            visited: visited,
            artists: newArtists
        });
        
        this.updateAfterLeaveScreen(visited, newArtists);

        if (deckLength <= 11) {
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
                for (let playlistArtist of this.state.buffer) {
                    if (!this.state.used.includes(playlistArtist)) {
                        console.log(playlistArtist);
                        this.getRelatedArtists(playlistArtist);
                        break;
                    }
            }}
        };
    }
    

    render() {
        if (this.state.redirect) {
            return <Redirect to='/login'/>
        }
        return (
            <div className="swipePage">
                <div className="media-container">
                    <div className="loading-gif"></div>
                </div>
                <div id="deck" className="artistCards__cardContainer">
                    {this.state.artists
                    // .filter(artist => (!this.state.visited.has(artist.id)))
                    .map( (artist,i) => (<ArtistCards childRef={this.state.childRefs[i]} key={artist.id} artist={artist}  onSwipe={this.onSwipe} onCardLeftScreen={this.onCardLeftScreen} />))}
                </div>
                <Footer exButton={this.exButton} swipe={this.swipe} />
            </div>
        )
    }
}
