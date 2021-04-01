import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import "../css/Header.css";
import QueueMusicIcon from '@material-ui/icons/QueueMusic';

export default class Header extends Component {
    render() {
        return (
            <div className='header'>
                <div className='appbtn'><Link className='spread' id='appbtn' to="/"><i className="fas fa-clone"></i></Link></div>
                <div className='playlistbtn'><Link className='spread' id='playlistbtn' to="/"><i className="fas fa-id-badge"></i></Link></div>
                <div className='sparebtn'><Link className='spread' to="/"><i className="fas fa-user-cog"></i></Link></div>
                <div className='profbtn'><Link className='spread' to="/genreselect"><QueueMusicIcon id="mui" className="fas fa-music"></QueueMusicIcon></Link></div>
            </div>
        )
    }
}
