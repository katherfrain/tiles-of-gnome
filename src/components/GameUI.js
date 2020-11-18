import React from 'react'
import Player from './Player';
import UILine from './UILine';


export default class GameUI extends React.Component {
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

    componentDidMount = () => {
        this.interval = setInterval(this.update)
    }

    componentWillUnmount = () => {
        clearInterval(this.interval);
    }

    update = () => {
        // if(needReRenderUI){
        //     this.forceUpdate();
        //     needReRenderUI = false;
        // }
    }

    render() {
        const {level, playerHP, playerHPmax, playerWeapon, playerLevel, xpToNextLevel} = this.props;
        return (
            <div>
                <UILine label='DUNGEON - ' value={level} />
                <hr key='line1' />
                <div key='portrait' className="cell portrait">
                <UILine label='HP:' value={playerHP+'/'+playerHPmax} />
                { playerWeapon && (<>
                    <UILine label='weapon:' value={playerWeapon.title} />
                    <UILine label={playerWeapon.desc} value="" />
                    <UILine label='damage:' value={'0-'+(playerLevel*2)+' (+'+playerWeapon.damage+')'} />
                </>)}
                <UILine label='level:' value={playerLevel} />
                <UILine label='XP for next level' value={xpToNextLevel} />
                </div>
            </div>
        )
    }
}