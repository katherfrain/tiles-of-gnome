import React from 'react';

export default class Player extends React.Component {
    constructor() {
        super();
        this.state = {
            health: 10, //initial value
            healthmax: 10,
            xp: 0,
            level: 1, 
            weapon: 'TO BE PROGRAMMED IN WEAPONS COMPONENT',
            playerTile: 'Coordinates?'
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
}