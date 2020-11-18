import React, {useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import store from '../redux/store'

export default function Game(props) {
    const health = useSelector((state) => state)[props.health];
    const dispatchEvent = useDispatch(); 
    const [score, setScore] = useState('0');

}