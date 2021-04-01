import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'
// import { getHashParams } from '../getHash'

export default class Callback extends Component {
    constructor() {
        super();
        this.state = {
            data: {}
        }
    }

    async componentDidMount() {
        let res = await this.props.getCurrentUser()
        console.log(res)
        // const code = params.code;
        // console.log(code)
        // const state = params.state;
        // const res = await fetch('http://localhost:5000/getToken'+code+'.'+state, {
        //     method: 'GET'
        // })
        // const data = await res.json()
        // console.log(data)
        // this.setState({data:data})
        
    }
    render() {
        if (true) {
            return <Redirect to="/genreselect" />
        }
        return (
            
            <div>
                Hi
            </div>
        )
    }
}
