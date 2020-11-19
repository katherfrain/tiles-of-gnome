import React, { useState } from 'react';
import Weapon from './Weapon';
import queenbee from './images/queenbee.png'


const defaultWeapon = new Weapon();


//set up all the default values as props
class Player extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            health: 10, //initial value
            healthmax: 10,
            xp: 0,
            level: 1, 
            weapon: defaultWeapon,
            playerTile: { x: 0, y: 0 }
            
        }
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

export default Player;