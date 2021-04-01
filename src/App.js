import React, { Component } from "react";
import { SpotifyApiContext } from 'react-spotify-api';
import Cookies from 'js-cookie';
import { SpotifyAuth, Scopes } from 'react-spotify-auth';
import 'react-spotify-auth/dist/index.css';
import { Switch, Route } from "react-router-dom";
import Header from "./components/Header";
import Callback from "./components/Callback";
import "./css/App.css"
import GenreSelect from "./components/GenreSelect";
import SwipePage from "./views/SwipePage";

export default class App extends Component {
  constructor() {
    super();

    this.state = {
      access_token: Cookies.get('spotifyAuthToken'),
      refresh_token: '',
      current_user: '',
      current_user_id: '',
      redirect: '',
      artistlist: []
    }
    this.getCurrentUser = this.getCurrentUser.bind(this);
  }
  async getCurrentUser() {
    console.log('getting current user');
    let res = await fetch('	https://api.spotify.com/v1/me', {
      method: 'GET',
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": "Bearer " + Cookies.get('spotifyAuthToken')
      }
    })
    let data = await res.json();
    console.log('this', data)
    this.setState({
      current_user: data.display_name,
      current_user_id: data.id
    })
    return data
  }

  

  render () {
    const token = Cookies.get('spotifyAuthToken')
    return (
      <div className="App">
        {token ? (
        <SpotifyApiContext.Provider value={token}>
          {/* Your Spotify Code here */}
          <Header />
            <Switch>
              <Route path="/callback" render={() => <Callback getCurrentUser={this.getCurrentUser} token={token}/>} />
              <Route exact path="/" component={SwipePage} render={() => <SwipePage />} />
              <Route exact path="/genreselect" render={() => <GenreSelect />} />
              {/* <Route exact path="/test" render={() => <Test/>} /> */}
              
              {/* Header */}
              
              {/* Cards */}
              {/* Footer Buttons */}

            </Switch>
        </SpotifyApiContext.Provider>
      ) : (
        // Display the login page
        <div className="media-container">
          <div className="landing-page photo">
          <SpotifyAuth
            redirectUri='http://localhost:3000/callback'
            clientID='1a70ba777fec4ffd9633c0c418bdcf39'
            scopes={[Scopes.userReadPrivate, 'user-read-email']} // either style will work
          />
          </div>
        </div>
      )}
      </div>
    );
  }
}
