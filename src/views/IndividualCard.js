import React, { Component } from 'react'
import "../css/IndividualCard.css"

export default class IndividualCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            current_artist: ''
        };
    }

    async componentDidMount(){
        let getres = await fetch(`https://artist-disco-express-backend.herokuapp.com/category/single/${this.props.current_user_id}/${this.props.category_name}`, {
            method: "GET"
        });
        let getdata = await getres.json();
        // console.log(getdata)
        this.setState({
            current_artist: getdata.individual_card
        })
    }

    render() {
        const a = this.state.current_artist;
        if (this.state.current_artist) {
            return (
                <div className="individual-view">
                    <div className="single-photo" style={{ backgroundImage: `url(${a.images[0].url})` }}>
                        <div className="info">
                            <h1>{a.name}</h1>
                            <h2>Follower Count: {a.followers.total}</h2>
                            <p>{a.id}</p>
                            <div className="genres">
                                <h3>Genres:</h3>
                                {a.genres.map( (genre) => (<h3>{genre}</h3>))}
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
        return (
            <div className="individual-view">

            </div>
        )
    }
}
