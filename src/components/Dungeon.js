/* eslint-disable no-loop-func */
import React from 'react'
import RenderHpBar from './HealthBar.js';
import renderHpBar from './HealthBar.js';
import Player from './Player.js';

const viewportSize = 6;
var mapWidth = 50;
var mapHeight = 30;

var tileSize = 33;
var potionPower = 10;


var playerTile = { x: 0, y: 0 };

var enemyPowerByLevels = [1, 3, 5, 7, 9];

var level;

var playerLevel;
var xpToNextLevel;
var playerWeapon;
var playerHP;
var playerHPmax;

//=============================================
// weapons special attacks
function critical20Attack(damage, tile) {
  
  if(Math.random()>0.7){
    damage *= 2;
    // spawnParticle('<h2>crit<h2>', {color:'#f00'}, tile);
  }
  return damage;
}

function weaponCanBroke(damage, tile) {
  if(Math.random()>0.95){
    damage = 0;
    // spawnParticle('<h2>broke weapon<h2>', {color:'#f00'}, tile);
    this.setWeapon('shatter', 0);
  }
  return damage;
}
function vampireWeapon(damage, tile) {
  if(Math.random()>0.5666){
    var heal = Math.ceil(damage/4);
    playerHP = Math.min(playerHPmax, playerHP + heal);
    // spawnParticle('+'+heal, {color:'#0f0'});
  }
  return damage;
}

function frozeWeapon(damage, tile) {
  if(Math.random()>0.677){
    if (!tile.unit.frozen) {
      tile.unit.frozen = true;
      tile.unit.damage = Math.floor(tile.unit.damage/2);
      // spawnParticle('froze', {color:'#0af'}, tile);
    }
  }
  return damage;
}


//=============================================
// weapons
var weapons = [null,

  [
    {title:'knuckles', damage:1},
    {title:'knife', damage:1},
    {title:'rusty knife', damage:1, attack:weaponCanBroke, desc:'can broke at any time'}
  ],
  [
    {title:'sword', damage:2},
    {title:'small axe', damage:3},
    {title:'mace', damage:3}
  ],
  [
    {title:'big axe', damage:4},
    {title:'spear', damage:4},
    {title:'spear of vampire', damage:4, attack:vampireWeapon, desc:'chance to get enemy HP'}
  ],
  [
    {title:'devil\'s mace', damage:6, attack:critical20Attack, desc:'chance to critical attack'},
    {title:'saberlight', damage:7, desc:'red ray'},
    {title:'wand of ice', damage:4, attack:frozeWeapon, desc:'chance to decrease enemy damage'}
  ]
]

var windowFocused = false;

var moveDelay = 0;

// var activeParticles = [];

function applyPlayerLevel() {
  xpToNextLevel += playerLevel * 40;
  playerHPmax = 20 + playerLevel*10;
  playerHP = Math.min(playerHPmax, playerHP+20);
}

function updateTilesAccessibility(){
  var addedLessOne = true;
  while(addedLessOne){
    addedLessOne = false;
    allTiles.some((t) => {
      if(t.accessible && (t.type === 0)){
        if (t.left && !t.left.accessible && t.left.type !== 1) {
          t.left.accessible = true;
          addedLessOne = true;
        }
        if (t.right && !t.right.accessible && t.right.type !== 1) {
          t.right.accessible = true;
          addedLessOne = true;
        }
        if (t.up && !t.up.accessible && t.up.type !== 1) {
          t.up.accessible = true;
          addedLessOne = true;
        }
        if (t.down && !t.down.accessible && t.down.type !== 1) {
          t.down.accessible = true;
          addedLessOne = true;
        }
      }
      return false;
    });
  }
}


var tasksQueue = [];


function placeUnit(tile, pow, damage){
  var hp = pow*5*level;
  if(!damage) {
    damage = pow*enemyPowerByLevels[level];
  }
  tile.unit = {hp:hp, hp_max:hp, damage:damage};
}

function removeUnit(tile){
  delete(tile.unit);
}


// function spawnParticle(html, style, tile){
//   if(!tile) tile = playerTile;
  
//   var p = document.createElement("div");
//   p.innerHTML = html;
//   for(var k in style){
//     if(style.hasOwnProperty(k)){
//       p.style[k] = style[k];
//     }
//   }
  
//   var x = (tile.x - playerTile.x + viewportSize + Math.random()*0.4) * tileSize;
//   var y = (tile.y - playerTile.y + viewportSize + Math.random()*0.4) * tileSize;
  
//   p.style.top = y+'px';
//   p.style.left = x+'px';
  
//   p.className = 'particle';
//   mapContainer.appendChild(p);
//   activeParticles.push({p:p, time: new Date().getTime()+3000});
// }

function randomFromList(list){
  var i = Math.floor(Math.random()*list.length);
  return list[i];
}

function removeRandomFromList(list){
    var i = Math.floor(Math.random()*list.length);
    var ret = list[i];
    list.splice(i,1);
    return ret;
}

function canPass(tile) {
  return tile && tile.type === 0;
}

function countOfNotWallNeighbors(tile){
  var c = 0;
  if(tile.left && tile.left.type !== 1)
    c++;
  if(tile.right && tile.right.type !== 1)
    c++;
  if(tile.up && tile.up.type !== 1)
    c++;
  if(tile.down && tile.down.type !== 1)
    c++;
  return c;
}

var field = [];
var allTiles = [];




export default class Dungeon extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            windowFocused: false,
            needReRender: false,
            upPressed: false,
            downPressed: false,
            leftPressed: false,
            rightPressed: false,
        }
    }

    setWeapon(title,damage,onAttack, desc) {
      if(!desc) desc = '';
      playerWeapon = {title:title,damage:damage,onAttack:onAttack,desc:desc};
      this.setState({
        needReRenderUI: true,
      })
    }

    componentDidMount = () => {
      this.interval = setInterval(this.update, 17);

      document.onclick = () => {
        this.setState({
          windowFocused: true,
          needReRender: true,
        })
      };

      window.onblur = () =>  {
        this.resetKeys();
        this.setState({
          windowFocused: false,
          needReRender: true,
        })
      }; 

      document.onkeydown = (evt) => {
        if(!this.state.windowFocused) return;
        evt = evt || window.event;
        switch (evt.keyCode) {
          case 65:
          case 37:
            this.setState({leftPressed: true});
            break;
          case 68:
          case 39:
            this.setState({rightPressed: true});
            break;
          case 83:
          case 40:
            this.setState({downPressed: true});
            break
          case 87:
          case 38:
            this.setState({upPressed: true});
            break
        default:
            break;
          
        }
      };
      document.onkeyup = (evt) => {
        evt = evt || window.event;
        switch (evt.keyCode) {
          case 65:
          case 37:
            this.setState({leftPressed: false});
            break;
          case 68:
          case 39:
            this.setState({rightPressed: false});
            break;
          case 83:
          case 40:
            this.setState({downPressed: false});
            break
          case 87:
          case 38:
            this.setState({upPressed: false});
            break
          default:
            break;
          
        }
      };
      this.startNewGame();
    }

    resetKeys() {
      this.setState({
        upPressed: false,
        downPressed: false,
        leftPressed: false,
        rightPressed: false,
      })
    }

    componentWillUnmount = () => {
      clearInterval(this.interval);
    }

    generateLevel(w,h) {
      this.resetKeys();
      if(field.w !== w || field.h !== h) { //regenerate field if size changed
        field.length = 0;
        field.w = w;
        field.h = h;
        
        allTiles = [];
        
        for(let x = 0; x < w; x++) {
          field.push((() => {
            var line = [];
            for (var y = 0; y < h; y++) {
              var tile = {type:1, x:x, y:y, left:null,right:null,up:null,down:null};
              allTiles.push(tile);
              line.push(tile);
            }
            return line;
          })());
        }
        
        for(let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            var tile = field[x][y];
            if(y>0){
              tile.up = field[x][y-1];
            }
            if(y<h-1){
              tile.down = field[x][y+1];
            }
            if(x>0){
              tile.left = field[x-1][y];
            }
            if(x<w-1){
              tile.right = field[x+1][y];
            }
          }
        }
      } else { //init tiles
        allTiles.forEach((tile) => {
          tile.type = 1;
          delete(tile.accessible);
          delete(tile.distance);
          delete(tile.unit);
        });
      }
      
      
      //dungeon generation
      var emptyTiles = [];
      
      var curTile = randomFromList(allTiles);
      playerTile = curTile;
      
      var passagesLen = 7+3*level;
      var dungeonSize = 40+40*level;
      
      while (dungeonSize>0) {
        for(var j=0; j<passagesLen; j++) {
          curTile.type=0;
          emptyTiles.push(curTile);
          dungeonSize--;
          
          var nextTiles =[];
          if(curTile.left) {
            if(!canPass(curTile.left.left) && !canPass(curTile.left.up) && !canPass(curTile.left.down) && (!curTile.left.left || (!canPass(curTile.left.left.up) && !canPass(curTile.left.left.down)))) {
              nextTiles.push(curTile.left);
            }
          }
          if(curTile.right) {
            if(!canPass(curTile.right.right) && !canPass(curTile.right.up) && !canPass(curTile.right.down) && (!curTile.right.right || (!canPass(curTile.right.right.up) && !canPass(curTile.right.right.down)))) {
              nextTiles.push(curTile.right);
            }
          }
          if(curTile.up) {
            if(!canPass(curTile.up.up) && !canPass(curTile.up.left) && !canPass(curTile.up.right) && (!curTile.up.up || (!canPass(curTile.up.up.left) && !canPass(curTile.up.up.right)))) {
              nextTiles.push(curTile.up);
            }
          }
          if(curTile.down) {
            if(!canPass(curTile.down.down) && !canPass(curTile.down.left) && !canPass(curTile.down.right) && (!curTile.down.down || (!canPass(curTile.down.down.left) && !canPass(curTile.down.down.right)))) {
              nextTiles.push(curTile.down);
            }
          }
          
          
          if(nextTiles.length === 0)
            break;
          
          curTile = randomFromList(nextTiles);
          
        }
        curTile = randomFromList(emptyTiles);
      }
      
      //shortcut passages
    
      var tilesCanShortcutted = allTiles.filter(function(tile) {
        if(canPass(tile)) {
          return false;
        }
        var cpl = canPass(tile.left);
        var cpr = canPass(tile.right);
        var cpu = canPass(tile.up);
        var cpd = canPass(tile.down);
        
        return (cpl&&cpr&&!cpu&&!cpd) || (!cpl&&!cpr&&cpu&&cpd);
      });
      
      for(var i = 0; i < level; i++) {
        
        if(tilesCanShortcutted.length < 1) break;
        
        tile = removeRandomFromList(tilesCanShortcutted);
        tile.type = 0;
        emptyTiles.push(tile);
      }
      
      //calculate tiles distance from spawn point.
      playerTile.distance = 1;
      var tilesToMeasure = [playerTile];
      emptyTiles = [];
      while(tilesToMeasure.length > 0) {
        tile = tilesToMeasure.shift();
        var curDist = tile.distance + 1;
        if (tile.left && canPass(tile.left) && !tile.left.distance) {
          tilesToMeasure.push(tile.left);
          emptyTiles.push(tile.left);
          tile.left.distance = curDist;
        }
        if (tile.right && canPass(tile.right) && !tile.right.distance) {
          tilesToMeasure.push(tile.right);
          emptyTiles.push(tile.right);
          tile.right.distance = curDist;
        }
        if (tile.up && canPass(tile.up) && !tile.up.distance) {
          tilesToMeasure.push(tile.up);
          emptyTiles.push(tile.up);
          tile.up.distance = curDist;
        }
        if (tile.down && canPass(tile.down) && !tile.down.distance) {
          tilesToMeasure.push(tile.down);
          emptyTiles.push(tile.down);
          tile.down.distance = curDist;
        }
      }
      
      //ladder put
      tile = emptyTiles.pop();
      if (level === 4) {
        tile.type = 3;
        placeUnit(tile, 6, 12);
      } else {
        tile.type = 4;
      }
      
      
      //sort by tile passes to neighbors
      emptyTiles.sort(function(a,b){
        return countOfNotWallNeighbors(b)-countOfNotWallNeighbors(a);
      });
      
      //chests distribution
      var chestsCount = 1 + Math.round(Math.random());
      for(i = 0; i<chestsCount; i++){
        emptyTiles.pop().type = 6;
      }
      
      
      //potions distribution
      var potionsCount = level+Math.random()*2.3;
      for(i = 0; i<potionsCount; i++){
        emptyTiles.pop().type = 5;
      }
      
      
      //enemy distribution
      var enemyCount = Math.round(level * (3 +Math.random()*1.7)) ;
      for(let i = 0; i < enemyCount; i++) {
        tile = removeRandomFromList(emptyTiles);
        tile.type = 2;
        placeUnit(tile, 1);
      }
      
      this.setState({
        needReRender: true,
        needReRenderUI: true,
      })
      
      // spawnParticle('<h1>Dungeon '+level+'</h1>', {color:'#f80'});
      
      playerTile.accessible = true;
      updateTilesAccessibility();
    }

  tryMoveTo(tile){
    this.tryMoveToSUB(tile);
    updateTilesAccessibility();
  }

  tryMoveToSUB(tile) {
    if(!tile) return false;
    moveDelay = 8;
    
    switch(tile.type){
      
      //fight turn
      case 3: //boss
      case 2: //enemy
        var damage = Math.round((playerLevel * 2) * Math.random())+playerWeapon.damage;
        if (playerWeapon.onAttack) {
          damage = playerWeapon.onAttack(damage, tile);
        }
        tile.unit.hp -= damage;
        if (damage) {
          // spawnParticle(-damage, {color:'#f00'}, tile);
        } else {
          // spawnParticle('miss', {color:'#777'}, tile);
        }
        if(tile.unit.hp < 1) {
          xpToNextLevel -= 10;
          this.setState({
            needReRenderUI: true,
          })
          if(tile.type === 3) { //boss
            // spawnParticle('<h1>You Win!!!</h1>', {color:'#0f4'});
            tile.type = 5;
            removeUnit(tile);
          } else {
            if(xpToNextLevel <= 0) {
              playerLevel++;
              // spawnParticle('level up', {color:'#ff0'}, tile);
              applyPlayerLevel();
            }
            if(Math.random()>0.93){ //drop potion chance
              tile.type = 5;
            } else {
              tile.type = 0;
            }
            removeUnit(tile);
          }
        } else {
          damage = Math.round(tile.unit.damage * Math.random());
          playerHP -= damage;
          this.setState({
            needReRenderUI: true,
          })
          if(playerHP<1){
            this.startNewGame();
            // spawnParticle('<h2>You Lose!</h2>', {color:'#f30'});
          } else {
            if(damage){
              // spawnParticle(-damage, {color:'#f00'});
            } else {
              // spawnParticle('miss', {color:'#777'});
            }
          }
        }
        
        return false;
        
        
      //door to next level
      case 4:
        if (level === 4) {
          this.startNewGame();
        } else {
          level++;
          this.generateLevel(mapWidth,mapHeight);
        }
        return true;
      
      //heal potion
      case 5:
        tile.type = 0;
        playerHP =Math.min(playerHP+potionPower, playerHPmax);
        // spawnParticle('+'+potionPower, {color:'#0f0'});
    this.setState({
      needReRenderUI: true,
    })
        break;
      
      //cheast finded
      case 6:
        tile.type = 0;
        var weapon = randomFromList(weapons[level]);
        this.setWeapon(weapon.title, weapon.damage, weapon.attack, weapon.desc);
        this.setState({
          needReRenderUI: true,
        })
        // spawnParticle('you found<br>'+playerWeapon.title, {color:'#0f0'});
        break;
      default:
        break;
    }

    if(canPass(tile)) {
      this.setState({
        needReRender: true,
      })
      playerTile = tile;
      return true;
    }
    return false;
  }

  
  startNewGame() {
    level = 1;
    this.setWeapon('none',0,false,'');
    this.generateLevel(mapWidth,mapHeight);
    playerLevel = 1;
    xpToNextLevel = 0;
    applyPlayerLevel();
    playerHP = playerHPmax;
    this.setState({
      needReRenderUI: true,
    })
  }

  update = () => {
    if(moveDelay > 0) {
      moveDelay--;
    } else {
      
      if(tasksQueue.length > 0){
        this.tryMoveTo(tasksQueue.pop());
      } else {
        if(this.state.upPressed) this.tryMoveTo(playerTile.up);
        if(this.state.downPressed) this.tryMoveTo(playerTile.down);
        if(this.state.leftPressed) this.tryMoveTo(playerTile.left);
        if(this.state.rightPressed) this.tryMoveTo(playerTile.right);
      }
    }
    
    if(this.state.needReRender){
      this.setState({
        needReRender: false
      })
    }
  }

  render() {
    var cells = [];
    
    var pauseLabel;
    if(!this.state.windowFocused){
      pauseLabel = (
          <div className="pause-label">
              <span className="flash">PAUSE</span>
              <br />
              <span className="flash">click to continue</span>
          </div>
      )
    }
    
    for(var y = - viewportSize; y <= viewportSize; y++){
      for(var x = - viewportSize; x <= viewportSize; x++){
        var label = undefined;
        let tileType;
        
        if(x===0 && y===0){
          tileType = 'cell player';
          label = <RenderHpBar health = {playerHP} healthmax = {playerHPmax}/>;
        } else {
          var tileLine = field[playerTile.x+x];
          tileType = 'cell cell-1';
          if(tileLine) {
            var tile = tileLine[playerTile.y+y];
            if(tile){
              tileType = 'cell cell-'+tile.type;
              
              if(tile.unit) {
                tileType += level;
                label = <RenderHpBar health = {tile.unit.hp} healthmax = {tile.unit.hp_max}/>;
              }
              
              if(this.state.windowFocused && tile.accessible){
                tileType += ' cell-comeable';
              }
            }
          }
        }
        

        cells.push(
          <div key={x+'_'+y} className={tileType} >
            {label}
          </div>
        )
      }
    }
    
    return (
      <div className="field" style={{
        width:tileSize*(viewportSize*2+1)+'px',
        height:tileSize*(viewportSize*2+1)+'px',
      }}>
          {cells}
          {pauseLabel}
      </div>
    )
  }
};