import React from 'react';
import Weapon from './Weapon';
import queenbee from './images/queenbee.svg'


const defaultWeapon = new Weapon();

export default class Player extends React.Component {
    constructor() {
        super();
        this.state = {
            health: 10, //initial value
            healthmax: 10,
            xp: 0,
            level: 1, 
            weapon: defaultWeapon,
            playerTile: 'Coordinates?'
        }
    }

    useKeyPress(e) {
        e.preventDefault();
        //move(e.key.replace("Arrow", "").toLowerCase())
        const dir = e.key.replace("Arrow", "").toLowerCase();
        console.log(dir)
    }

    
    levelUp = () => {
        if(this.xp >= (this.level*40)) {
            return (
                this.setState({
                    level: this.level + 1,
                    health: this.health + (10*this.level),
                    healthmax: this.healthmax + (10*this.level)
                })
            )
        }
        return (
            this.setState({
                level: this.level
            })
        )
    }
    render()  {
        return(
            <svg id = 'queenbee'
            src = {queenbee}
            alt='queen bee'
            height={200}
            />
        )
    }
    
}