import React from 'react'

export default class Weapon extends React.Component{
    constructor() {
        super();
        this.state = ({
            weaponName: '',
            specialAttacks: null, 
            weaponDamage: 2,
            weaponBreakChance: 0.05
        })
    }

    checkWeaponDurability = () => {
        this.setState({
            weaponBreakChance: this.weaponBreakChance + (Math.random()*100),
        })
        if(this.weaponBreakChance > 95) {
            this.setState({
                specialAttacks: null,
                weaponDamage: 0
            })
            alert('your sword has broken')
        }
    }

};