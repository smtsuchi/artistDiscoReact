import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import "../css/Header.css";
import QueueMusicIcon from '@material-ui/icons/QueueMusic';

export default class Header extends Component {
    constructor(props) {
        super(props);
        this.state = {
            redirect: null,
            category_name: '',
            atp: true,
            fav: true,
            follow: true,
            my_playlist: this.props.my_playlist

        }
        this.regenerateArtists = this.regenerateArtists.bind(this);
    }
    
    regenerateArtists() {
        // console.log('regen')
        if (this.props.settings) {
            if (this.props.settings.current_playlist){
                // Load the saved database data
                this.setState({
                    first_time: false,
                    category_name: this.props.settings.current_playlist,
                    atp: this.props.settings.add_to_playlist_on_like,
                    fav: this.props.settings.fav_on_like,
                    follow: this.props.settings.follow_on_like,
                    redirect: '/'
                })
            }
        }
    }
    

    render() {
        if (this.state.redirect) {
            this.setState({redirect: null});
            return <Redirect to={{
                pathname: this.state.redirect,
                state: {
                    first_time:this.state.first_time,
                    category_name:this.state.category_name,
                    current_user_id:this.props.current_user_id,
                    atp: this.state.atp,
                    fav: this.state.fav,
                    follow: this.state.follow,
                    my_playlist: this.props.my_playlist
                }
            }} />
        }
        return (
            <div className='header'>
                <div className='appbtn'><div className='spread' id='appbtn'  onClick={this.regenerateArtists} ><i className="fas fa-clone"></i></div></div>
                <div className='playlistbtn'><Link className='spread' id='playlistbtn' to="/artistdetails"><i className="fas fa-id-badge"></i></Link></div>
                <div className='sparebtn'><Link className='spread' to="/settings"><i className="fas fa-user-cog"></i></Link></div>
                <div className='profbtn'><Link className='spread' to="/genreselect"><QueueMusicIcon id="mui" className="fas fa-music"></QueueMusicIcon></Link></div>
            </div>
        )
    }
}
