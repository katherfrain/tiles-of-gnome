import React, { useState } from 'react';

import {useDispatch, useSelector} from 'react-redux';
import {takeDamage, takeHeal} from '../redux/actions'

export default function RenderHpBar(props) {
    
    // const props = useSelector((state) => state)[props.id];
    // const dispatchEvent = useDispatch();

    // const handleTakeDamage = () => {
    //     dispatchEvent(takeDamage(), props.id)
    // }

    // const handleTakeHeal = () => {
    //     dispatchEvent(takeHeal(), props.id)
    // }

    if(props.health < props.healthmax) {
        
        var hpPercent = props.health/props.healthmax*100;

        if(hpPercent < 100) {
            var hpSize = 3 + Math.round(Math.sqrt(props.healthmax))*2;
            return (
                <>
                <div className='hp-bar' style ={{width: `${hpSize}px`, left:`(33-${hpSize})/2px`}}>
                <div className='hp-bar-sub' style={{width: hpPercent+'%'}}></div></div>
                </>
                )
            }
        }
    return "";
  }