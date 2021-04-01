import React, { Component } from 'react'
import Cookies from 'js-cookie';
import { Redirect } from 'react-router-dom'
import "../css/GenreSelect.css"

export default class GenreSelect extends Component {
    constructor() {
        super();

        this.state = {
            playlist_artist_id: [],
            redirect: null
        }
    }

    async generateArtists(e) {
        e.preventDefault();
        let playlist_id=e.target[0].value;
        let res = await fetch(`https://api.spotify.com/v1/playlists/${playlist_id}/tracks?market=US`, {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": "Bearer " + Cookies.get('spotifyAuthToken')
            }
        })
        let data = await res.json()
        // console.log(data)
        let playlist_artist_id = data.items.map(d => d.track.artists[0].id)
        // let single = data.items[0].track.artists[0].id
        console.log(playlist_artist_id)
        this.setState({playlist_artist_id: playlist_artist_id})
        // this.setState({artist_id: single})
        this.setState({ redirect: "/"})
    }

    render() {
        if (this.state.redirect) {
            // console.log(this.state.playlist_artist_id)
            console.log(this.state.artist_id)
            return <Redirect to={{pathname: this.state.redirect, state: { artist_id:this.state.playlist_artist_id }}} />
        }
        return (
            <div className="main">
                <div className="text"><h1>Select a Genre</h1></div>
                
                <div className="genreForm">
                    <form id='selectgenre' onSubmit={(e) => this.generateArtists(e)}>
                        <select className='form-control' name="playlist" id="genres">
                            <option value="37i9dQZF1DX0XUsuxWHRQd">Hip Hop</option>
                            <option value="37i9dQZF1DXcBWIGoYBM5M">Pop</option>
                            <option value="37i9dQZF1DWXRqgorJj26U">Rock</option>
                            <option value="37i9dQZF1DX9tPFwDMOaN1">K-Pop</option>
                            <option value="37i9dQZF1DX4dyzvuaRJ0n">Electronic Dance Music</option>
                            <option value="37i9dQZF1DX10zKzsJ2jva">Latin Trap</option>
                            <option value="37i9dQZF1DX1lVhptIYRda">Country</option>
                            <option value="37i9dQZF1DX4SBhb3fqCJd">Contemporary R&B</option>
                            <option value="37i9dQZF1DX2Nc3B70tvx0">Indie Rock</option>
                            <option value="37i9dQZF1DX0KpeLFwA3tO">Punk Rock</option>
                            <option value="37i9dQZF1DXa8NOEUWPn9W">House Music</option>
                            <option value="37i9dQZF1DX82GYcclJ3Ug">Alternative Rock</option>
                            <option value="37i9dQZF1DWTx0xog3gN3q">Soul</option>
                            <option value="37i9dQZF1DWY7IeIP1cdjF">Reggaeton</option>
                            <option value="37i9dQZF1DWWQRwui0ExPn">Lo-Fi Music</option>
                            <option value="37i9dQZF1DWZgauS5j6pMv">Funk</option>
                            <option value="37i9dQZF1DX1MUPbVKMgJE">Disco</option>
                            <option value="37i9dQZF1DWWEJlAGA9gs0">Classical Music</option>
                            <option value="37i9dQZF1DWTR4ZOXTfd9K">Jazz</option>
                            <option value="37i9dQZF1DX7Qo2zphj7u3">Latin Music</option>
                            <option value="37i9dQZF1DWTcqUzwhNmKv">Metal</option>
                        </select>
                        <div className="submit"><button type='submit' form='selectgenre' className='button'>Submit</button></div>
                    </form>
                </div>  
            </div>
        )
    }
}
