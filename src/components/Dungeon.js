import React, {useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import store from '../redux/store'

var moveDelay = 0;

export default class Dungeon extends React.Component {
    constructor(props){
        super();
    }

    update = () => {
        if(moveDelay > 0) {
            moveDelay --
        }
        else {

        }
    }

    componentDidMount = () => {
        this.interval = setInterval(this.update, 17)
    }
}