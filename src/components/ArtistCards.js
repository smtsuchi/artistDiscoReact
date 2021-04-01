import React, { Component } from 'react'
import { set } from 'js-cookie';
import TinderCard from 'react-tinder-card';

export default class ArtistCards extends Component {
    
    constructor(props){
        super(props);
        const a = this.props.artist;
        this.state = {
            artist: a,
            visited: set()
        }
        
    }

    

    render() {
        const a = this.props.artist;
        return (
            <div className="individual-card" id={a.id}>
                <TinderCard ref={this.props.childRef} className="swipe" key={a.id} preventSwipe={['up','down']} onSwipe={(dir) => this.props.onSwipe(dir, a)} onCardLeftScreen={() => this.props.onCardLeftScreen(a.name, a.id)}>
                    <div className="photo-card" style={{ backgroundImage: `url(${a.images[0].url})` }}>
                        <h1>{a.name}</h1>
                        <audio controls name='media'><source src={this.props.artist.track_preview} type="audio/mpeg" /></audio>
                        <p>{a.id}</p>
                    </div>
                </TinderCard>
            </div>
        )
    }
}
