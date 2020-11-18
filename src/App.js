import logo from './logo.svg';
import './App.css';
import React from 'react'

(function(){
	
	
  "use strict";
    
  var mapWidth = 50;
  var mapHeight = 30;
  
  var viewportSize = 6;
  var tileSize = 33;
  var potionPower = 10;
  
  
  var playerTile;
  var needReRender = false;
  var needReRenderUI = false;
  
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
      spawnParticle('<h2>crit<h2>', {color:'#f00'}, tile);
    }
    return damage;
  }
  
  function weaponCanBroke(damage, tile) {
    if(Math.random()>0.95){
      damage = 0;
      spawnParticle('<h2>broke weapon<h2>', {color:'#f00'}, tile);
      setWeapon('shatter', 0);
    }
    return damage;
  }
  function vampireWeapon(damage, tile) {
    if(Math.random()>0.5666){
      var heal = Math.ceil(damage/4);
      playerHP = Math.min(playerHPmax, playerHP + heal);
      spawnParticle('+'+heal, {color:'#0f0'});
    }
    return damage;
  }
  
  function frozeWeapon(damage, tile) {
    if(Math.random()>0.677){
      if (!tile.unit.frozen) {
        tile.unit.frozen = true;
        tile.unit.damage = Math.floor(tile.unit.damage/2);
        spawnParticle('froze', {color:'#0af'}, tile);
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
  
  var upPressed;
  var downPressed;
  var leftPressed;
  var rightPressed;
  var moveDelay = 0;
  function resetKeys(){
    upPressed = false;
    downPressed = false;
    leftPressed = false;
    rightPressed = false;
  }
  
  var activeParticles = [];
  
  var mapContainer = document.getElementById('dungeon-container');
  
  function startNewGame() {
    level = 1;
    setWeapon('none',0,false,'');
    generateLevel(mapWidth,mapHeight);
    playerLevel = 1;
    xpToNextLevel = 0;
    applyPlayerLevel();
    playerHP = playerHPmax;
    needReRenderUI = true;
  }
  
  function applyPlayerLevel() {
    xpToNextLevel += playerLevel * 40;
    playerHPmax = 20 + playerLevel*10;
    playerHP = Math.min(playerHPmax, playerHP+20);
  }
  
  function updateTilesAccessibility(){
    var addedLessOne = true;
    while(addedLessOne){
      addedLessOne = false;
      allTiles.some(function(t){
        if(t.accessible && (t.type === 0)){
          
          if (t.left && !t.left.accessible && t.left.type != 1) {
            t.left.accessible = true;
            addedLessOne = true;
          }
          if (t.right && !t.right.accessible && t.right.type != 1) {
            t.right.accessible = true;
            addedLessOne = true;
          }
          if (t.up && !t.up.accessible && t.up.type != 1) {
            t.up.accessible = true;
            addedLessOne = true;
          }
          if (t.down && !t.down.accessible && t.down.type != 1) {
            t.down.accessible = true;
            addedLessOne = true;
          }
        }
        return false;
      });
    }
  }
  
  
  function tryMoveTo(tile){
    tryMoveToSUB(tile);
    updateTilesAccessibility();
  }
  
  function tryMoveToSUB(tile) {
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
          spawnParticle(-damage, {color:'#f00'}, tile);
        } else {
          spawnParticle('miss', {color:'#777'}, tile);
        }
        if(tile.unit.hp < 1) {
          xpToNextLevel -= 10;
          needReRenderUI = true;
          if(tile.type === 3) { //boss
            spawnParticle('<h1>You Win!!!</h1>', {color:'#0f4'});
            tile.type = 5;
            removeUnit(tile);
          } else {
            if(xpToNextLevel <= 0) {
              playerLevel++;
              spawnParticle('level up', {color:'#ff0'}, tile);
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
          needReRenderUI = true;
          if(playerHP<1){
            startNewGame();
            spawnParticle('<h2>You Lose!</h2>', {color:'#f30'});
          } else {
            if(damage){
              spawnParticle(-damage, {color:'#f00'});
            } else {
              spawnParticle('miss', {color:'#777'});
            }
          }
        }
        needReRender = true;
        return false;
        
        
      //door to next level
      case 4:
        if (level === 4) {
          startNewGame();
        } else {
          level++;
          generateLevel(mapWidth,mapHeight);
        }
        return true;
      
      //heal potion
      case 5:
        tile.type = 0;
        playerHP =Math.min(playerHP+potionPower, playerHPmax);
        spawnParticle('+'+potionPower, {color:'#0f0'});
        needReRenderUI = true;
        break;
      
      //cheast finded
      case 6:
        tile.type = 0;
        var weapon = randomFromList(weapons[level]);
        setWeapon(weapon.title, weapon.damage, weapon.attack, weapon.desc);
        needReRenderUI = true;
        spawnParticle('you found<br>'+playerWeapon.title, {color:'#0f0'});
        break;
  
    }
    if(canPass(tile)) {
      needReRender = true;
      playerTile = tile;
      return true;
    }
    return false;
  }
  
  var tasksQueue = [];
  
  function clickTile(e) {
    tasksQueue.length = 0;
    if (windowFocused && this.accessible) {
      
      allTiles.some(function(t){
        t.distance = 0;
        return false;
      });
      
      debugger;
      
      var tile;
      playerTile.distance = 1;
      var tilesToMeasure = [playerTile];
      while(tilesToMeasure.length > 0) {
        tile = tilesToMeasure.shift();
        var curDist = tile.distance + 1;
        
        if(tile.left === this){
          tile = tile.left;
          tile.distance = curDist;
          break;
        } else if(tile.right === this){
          tile = tile.right;
          tile.distance = curDist;
          break;
        } else if(tile.up === this){
          tile = tile.up;
          tile.distance = curDist;
          break;
        } else if(tile.down === this){
          tile = tile.down;
          tile.distance = curDist;
          break;
        } 
        
        if (tile.left && canPass(tile.left) && !tile.left.distance) {
          tilesToMeasure.push(tile.left);
          tile.left.distance = curDist;
        }
        if (tile.right && canPass(tile.right) && !tile.right.distance) {
          tilesToMeasure.push(tile.right);
          tile.right.distance = curDist;
        }
        if (tile.up && canPass(tile.up) && !tile.up.distance) {
          tilesToMeasure.push(tile.up);
          tile.up.distance = curDist;
        }
        if (tile.down && canPass(tile.down) && !tile.down.distance) {
          tilesToMeasure.push(tile.down);
          tile.down.distance = curDist;
        }
      }
      while(tile && (tile != playerTile)){
        tasksQueue.push(tile);
        if(tile.left && (tile.left.distance === (tile.distance-1))){
          tile = tile.left;
        } else if(tile.right && (tile.right.distance === (tile.distance-1))){
          tile = tile.right;
        } else if(tile.up && (tile.up.distance === (tile.distance-1))){
          tile = tile.up;
        } else if(tile.down && (tile.down.distance === (tile.distance-1))){
          tile = tile.down;
        }
      }
      
      
    }
  }
  
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
  
  
  function spawnParticle(html, style, tile){
    if(!tile) tile = playerTile;
    
    var p = document.createElement("div");
    p.innerHTML = html;
    for(var k in style){
      if(style.hasOwnProperty(k)){
        p.style[k] = style[k];
      }
    }
    
    var x = (tile.x - playerTile.x + viewportSize + Math.random()*0.4) * tileSize;
    var y = (tile.y - playerTile.y + viewportSize + Math.random()*0.4) * tileSize;
    
    p.style.top = y+'px';
    p.style.left = x+'px';
    
    p.className = 'particle';
    mapContainer.appendChild(p);
    activeParticles.push({p:p, time: new Date().getTime()+3000});
  }
  
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
  
  function setWeapon(title,damage,onAttack, desc) {
    if(!desc) desc = '';
    playerWeapon = {title:title,damage:damage,onAttack:onAttack,desc:desc};
    needReRenderUI = true;
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
  function generateLevel(w,h) {
    resetKeys();
    if(field.w != w || field.h != h) { //regenerate field if size changed
      field.length = 0;
      field.w = w;
      field.h = h;
      
      allTiles = [];
      
      for(var x = 0; x < w; x++) {
        field.push((function() {
          var line = [];
          for (var y = 0; y < h; y++) {
            var tile = {type:1, x:x, y:y, left:null,right:null,up:null,down:null};
            allTiles.push(tile);
            line.push(tile);
          }
          return line;
        })());
      }
      
      for(var y = 0; y < h; y++) {
        for (var x = 0; x < w; x++) {
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
      allTiles.map(function(tile){
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
    for(var i = 0; i < enemyCount; i++) {
      tile = removeRandomFromList(emptyTiles);
      tile.type = 2;
      placeUnit(tile, 1);
    }
    
    needReRender = true;
    needReRenderUI = true;
    
    spawnParticle('<h1>Dungeon '+level+'</h1>', {color:'#f80'});
    
    playerTile.accessible = true;
    updateTilesAccessibility();
  }
  
  function renderHpBar(hp, hp_max){
    var hpPercent = hp / hp_max*100;
    if(hpPercent < 100) {
      
      var hpSize = 3 + Math.round(Math.sqrt(hp_max))*2;
      return React.DOM.div({
        className:'hp-bar',
        style:{
          width: hpSize+'px',
          left: ((tileSize-hpSize)/2)+'px'
        }
      },
      React.DOM.div({
        className:'hp-bar-sub',
        style:{
          width: hpPercent+'%'
        }
      }
      )
      )
    }
    return undefined;
    
  }
    
  var Dungeon = React.createClass({
      componentDidMount:function(){
        this.interval = setInterval(this.update, 17);
        document.onclick = function(){
          windowFocused = true;
          needReRender = true;
        };
        window.onblur = function () {
          resetKeys();
          windowFocused = false;
          needReRender = true;
        }; 
  
        document.onkeydown = function(evt) {
          if(!windowFocused) return;
          evt = evt || window.event;
          switch (evt.keyCode) {
            case 65:
            case 37:
              leftPressed = true;
              break;
            case 68:
            case 39:
              rightPressed = true;
              break;
            case 83:
            case 40:
              downPressed = true;
              break
            case 87:
            case 38:
              upPressed = true;
              break
            
          }
        };
        document.onkeyup = function(evt) {
          evt = evt || window.event;
          switch (evt.keyCode) {
            case 65:
            case 37:
              leftPressed = false;
              break;
            case 68:
            case 39:
              rightPressed = false;
              break;
            case 83:
            case 40:
              downPressed = false;
              break
            case 87:
            case 38:
              upPressed = false;
              break
            
          }
        };
        
        
        
      },
      componentWillUnmount:function(){
        clearInterval(this.interval);
      },
      update:function(){
        
        if(moveDelay > 0) {
          moveDelay--;
        } else {
          
          if(tasksQueue.length > 0){
            tryMoveTo(tasksQueue.pop());
          } else {
          
            if(upPressed) tryMoveTo(playerTile.up);
            if(downPressed) tryMoveTo(playerTile.down);
            if(leftPressed) tryMoveTo(playerTile.left);
            if(rightPressed) tryMoveTo(playerTile.right);
          }
        }
        
        
        if(needReRender){
          this.forceUpdate();
          needReRender = false;
        }
        
        //remove expired particles from DOM
        var time = new Date().getTime();
        activeParticles = activeParticles.filter( function(p) {
          if(p.time < time){
            if(p.p.parentNode){
              p.p.parentNode.removeChild(p.p);
            }
            return false;
          }
          return true;
        });
        
  
        
        
      },
      render: function () {
        var cells = [];
        var self = this;
        
        var pauseLabel;
        if(!windowFocused){
          pauseLabel = React.DOM.div({
              className:'pause-label'
            },
            React.DOM.span({
                className:'flash'
              },'PAUSE'),
            React.DOM.br(),
            React.DOM.span({
                className:'flash'
              },'click to continue')
          )
          
          
        }
        
        for(var y = - viewportSize; y <= viewportSize; y++){
          
          
          
          for(var x = - viewportSize; x <= viewportSize; x++){
            
            var label = undefined;
            
            if(x===0 && y===0){
              var tileType = 'cell player';
              label = renderHpBar(playerHP, playerHPmax);
            } else {
              var tileLine = field[playerTile.x+x];
              var tileType = 'cell cell-1';
              if(tileLine) {
                var tile = tileLine[playerTile.y+y];
                if(tile){
                  tileType = 'cell cell-'+tile.type;
                  
                  if(tile.unit) {
                    tileType += level;
                    label = renderHpBar(tile.unit.hp, tile.unit.hp_max);
                  }
                  
                  if(windowFocused && tile.accessible){
                    tileType += ' cell-comeable';
                  }
                }
              }
            }
            
          
            
            cells.push(
              React.DOM.div({
                key:x+'_'+y,
                className:tileType,
                onClick:clickTile.bind(tile)
              },label));
          }
          
        }
        
        return React.DOM.div( {
            className: 'field',
            style:{
            width:tileSize*(viewportSize*2+1)+'px',
            height:tileSize*(viewportSize*2+1)+'px',
          }
          },
          cells,
          pauseLabel
          
        )
      }
    });
  
  var GameUI = React.createClass({
  
  
      componentDidMount:function(){
        this.interval = setInterval(this.update, 17);
      },
      componentWillUnmount:function(){
        clearInterval(this.interval);
      },
      update:function(){
        if(needReRenderUI){
          this.forceUpdate();
          needReRenderUI = false;
        }
      },
      renderUIline:function(label, value){
        return React.DOM.div( {
                key:label,
                className: 'ui-line'
              },
              React.DOM.span( {
                  className: 'ui-label'
                },
                label
              ),
              React.DOM.span( {
                  className: 'ui-value'
                },
                value
              )				
            )
      },
      render: function () {
        var uil = this.renderUIline;
        return React.DOM.div(null,
        [
          uil('DUNGEON - ', level),
          React.DOM.hr({key:'line1'}),
          React.DOM.div({key:'portrait', className:'cell portrait'}),
          uil('HP:', playerHP+'/'+playerHPmax),
          uil('weapon:', playerWeapon.title),
          uil(playerWeapon.desc,''),
          uil('damage:', '0-'+(playerLevel*2)+' (+'+playerWeapon.damage+')'),
          uil('level:', playerLevel),
          uil('XP for next level', xpToNextLevel)
        ]);
        
      }
    });
  
    startNewGame();
    
    ReactDOM.render(
    React.createElement(Dungeon),
    mapContainer
    );
    ReactDOM.render(
    React.createElement(GameUI),
    document.getElementById('ui-container')
    );
    
    
    
  })()
function App() {
  return (
    <div className="App">

    </div>
  );
}

export default App;
