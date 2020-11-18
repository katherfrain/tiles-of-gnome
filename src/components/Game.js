import React, {useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import store from '../redux/store'
import Player from './Player';


export default class Game extends React.Component {
    constructor(props){
        super();
        this.state = {
            upPressed: false,
            downPressed: false, 
            leftPressed: false,
            rightPressed: false
        }
    }

    startNewGame = () => {
        const playerCharacter = new Player();
        //render dungeon function? 
    }

    // update = () => {
    //     if(needsReRender === true){
    //         this.forceUpdate();
    //         needsReRender = false; 
    //     }
    // }

    componentDidMount = () => {
        this.interval = setInterval(this.update)
    } 
}