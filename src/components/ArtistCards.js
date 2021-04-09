import React, { Component } from 'react'
import { set } from 'js-cookie';
import TinderCard from 'react-tinder-card';
import Ticker from 'react-ticker';

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
                        <div className="preview-track">
                            <img className='thmbnl' alt="Track Thumbnail" src={a.track_thumbnail}></img>
                            {/* <div className="tckr"><h4>{a.track_name}</h4></div> */}
                            <Ticker mode="smooth">{() => (<><div className="tckr"><h3>{a.track_name} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</h3></div></>)}</Ticker>
                            <div className="adctrl"><audio controls name='media'><source src={a.track_preview} type="audio/mpeg" /></audio></div>
                        </div>
                        <p>{a.id}</p>
                    </div>
                </TinderCard>
            </div>
        )
    }
}
