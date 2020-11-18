import React, {useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import store from '../redux/store'

export default class Tile extends React.Component {
    constructor(props){
        super();
        this.state = {
            addedLessOne: true
        }
    }
    decideTypeTile(list) {
        var randomTile = Math.floor(Math.random()*list.length);
        return randomTile;
    }
    deleteRandomTile(list) {
        let randomTile = this.decideTypeTile(list)
        list.splice(randomTile, randomTile + 1)
        return randomTile;
    }

    placeTile(tile, power, damage) {

    }
    updateTileAccessibility = () => {
        console.log('fuck')
        }
    }

// if(tasksQueue.length > 0){
//     tryMoveTo(tasksQueue.pop());
// } else {

//     if(upPressed) tryMoveTo(playerTile.up);
//     if(downPressed) tryMoveTo(playerTile.down);
//     if(leftPressed) tryMoveTo(playerTile.left);
//     if(rightPressed) tryMoveTo(playerTile.right);
// }
// }