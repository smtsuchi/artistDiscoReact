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
import Settings from "./views/Settings"
import IndividualCard from "./views/IndividualCard";
import Login from "./components/Login";

export default class App extends Component {
  constructor() {
    super();

    this.state = {
      access_token: Cookies.get('spotifyAuthToken'),
      current_user: '',
      current_user_id: '',
      category_names: [],
      settings: {current_playlist: null}
    }
    this.getCurrentUser = this.getCurrentUser.bind(this);
    this.getCurrentUserData = this.getCurrentUserData.bind(this);
    this.generateArtists = this.generateArtists.bind(this);
    this.reset = this.reset.bind(this);

    

  }

  reset(){
    this.setState({access_token: 'expired'})
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
    console.log('spotify get cur_user', data)
    // this.setState({
    //   current_user: data.display_name,
    //   current_user_id: data.id
    // })
    return data
  }

  async getCurrentUserData() {
    const my_current_spotify = await this.getCurrentUser();
    console.log('getting current user data from backend');
    let res = await fetch(`/userData/${my_current_spotify.id}`, {
      method: 'GET'
    })
    let data = await res.json();
    console.log('this backend', data)
    if (data) {
      this.setState({
        current_user: my_current_spotify.display_name,
        current_user_id: my_current_spotify.id,
        category_names: data.category_names,
        settings: data.settings
      })
      return data
    } else {
      // Create User Profile
      let urlencoded = new URLSearchParams();
      urlencoded.append("user_id", my_current_spotify.id);
      let postres = await fetch('/userData', {
        method: 'POST',
        body: urlencoded
      })
      let postdata = await postres.json()
      console.log('just created a new user', postdata)
      this.setState({
        current_user: my_current_spotify.display_name,
        current_user_id: my_current_spotify.id,
        category_names: postdata.createdUser.category_names,
        settings: postdata.createdUser.settings
      })
      return postdata
    }
  }

  async generateArtists(e) {
    e.preventDefault();
    // console.log(e);
    const selected_index = e.target[0].options.selectedIndex;
    const category_name = e.target[0][selected_index].innerHTML;
    // console.log(category_name);
    
    if (this.state.category_names.includes(category_name)) {
      // Load the saved database data
      let getres = await fetch(`/category/${this.state.current_user_id}/${category_name}`, {
        method: "GET"
      })
      let getdata = await getres.json();
      let buffer = getdata.myCategory.buffer

      let mySettings = this.state.settings;
      mySettings.current_playlist = category_name;

      this.setState({
        settings: mySettings
      })

      return {buffer:buffer, first_time: false}
    }
    else {
      if (Cookies.get('spotifyAuthToken')){
        // Create new category: initialize with data from the API call
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
        
        let buffer = data.items.map(d => d.track.artists[0].id)

        // add buffer to Database: category
        let urlencoded = new URLSearchParams();
        urlencoded.append("category_name", category_name);
        urlencoded.append("buffer", buffer);
        let postres = await fetch(`/category/${this.state.current_user_id}`, {
          method: "POST",
          body: urlencoded
        })
        let postdata = await postres.json()
        console.log(postdata)

        let mySettings = this.state.settings;
        mySettings.current_playlist = category_name;

        this.setState({
          category_names: this.state.category_names.concat(category_name),
          settings: mySettings
        })

        return {buffer:buffer, first_time: true}
      }
      else {this.reset()}
    }
  }

  render () {
    const token = Cookies.get('spotifyAuthToken')
    return (
      <div className="App">
        {token||this.state.current_user_id ? (
        <SpotifyApiContext.Provider value={token}>
          {/* Your Spotify Code here */}
          <Header settings={this.state.settings} current_user_id={this.state.current_user_id}/>
            <Switch>
              <Route path="/callback" render={() => <Callback getCurrentUser={this.getCurrentUser} getCurrentUserData={this.getCurrentUserData} token={token}/>} />
              <Route exact path="/"component={SwipePage} render={() => <SwipePage />} />
              <Route exact path="/artistdetails"  render={() => <IndividualCard current_user_id={this.state.current_user_id} category_name={this.state.settings.current_playlist} />} />
              <Route exact path="/settings" render={() => <Settings current_user_id={this.state.current_user_id} settings={this.state.settings} />} />
              <Route exact path="/genreselect" render={() => <GenreSelect settings={this.state.settings} generateArtists={this.generateArtists} current_user_id={this.state.current_user_id} category_names={this.state.category_names}/>} />
              <Route exact path="/login" render={() => <Login reset={this.reset} /> }  />
              
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
