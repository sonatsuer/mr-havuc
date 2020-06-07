var cnv;
var walkerState;
var walkerSprite;
var gameState;
var enemies;
var score;
var topScore;
var monsterAnimation;
var deathSound, pointSound, boinkSound;

function preload(){
  monsterAnimation = loadAnimation('assets/zombi_001.png', 'assets/zombi_006.png');
  soundFormats('mp3');
  deathSound = loadSound('assets/death.mp3');
  pointSound = loadSound('assets/point.mp3');
  boinkSound = loadSound('assets/boink.mp3');
}

function setup() {
  cnv = createCanvas(800, 400);
  centerCanvas();
  gameState = gameStates.FRESH;
  walkerState = walkerStates.WALKING;
  walkerSprite = createSprite(50, height - 110, 50, 160);
  enemies = [];
  score = 0;
  topScore = 0;
}

function draw() {
  background(0);
  fill(100, 0, 0);
  rect(0, height - 50, width, 50);
  drawSprites();
  displayScore();
  switch(gameState){
    case gameStates.FRESH:
      freshGameScreen();
      break;
    case gameStates.PAUSED:
      pausedGameScreen();
      break;
    case gameStates.LOST:
      lostGameScreen();
      break;
    case gameStates.ONGOING:
      playGame();
  }
}

// Centering
function centerCanvas() {
  cnv.position(
    (windowWidth - width) / 2,
    (windowHeight - height) / 2
  );
}

function windowResized() {
  centerCanvas();
}

// Static Screens
function freshGameScreen() {
  background(0);
  textAlign(CENTER);
  fill(255);
  text( 'Ilgaz\'ın Oyununa Hoş Geldiniz!\n' +
        'Zıplamak için boşluk, oyunu durdurmak için D tuşunu kullanın.\n \n' +
        'Başlamak için Enter tuşuna basın.'
      , width / 2, height / 2);
  noLoop();
}

function lostGameScreen() {
  background(50, 0, 0, 100);
  textAlign(CENTER);
  fill(255);
  text( 'Öldünüz! \n' +
        'Yeniden başlamak için Enter tuşuna basın.'
      , width / 2, height / 2);
  noLoop();
}

function pausedGameScreen() {
  background(50, 50, 50, 150);
  textAlign(CENTER);
  fill(255);
  text('Devam etmek için D tuşuna basın.', width / 2, height / 2);
  noLoop();
}

// Game Logic
const walkerStates = {
  WALKING : 'walking',
  JUMPING : 'jumping',
  DEAD: 'dead'
}

const gameStates = {
  ONGOING : 'ongoing',
  PAUSED : 'paused',
  FRESH : 'fresh',
  LOST : 'lost'
}

function playGame() {
  // Jumping physics
  if( walkerSprite.position.y > height - 110) {
      walkerState = walkerStates.WALKING;
      walkerSprite.position.y = height - 110;
      walkerSprite.velocity.y = 0;
  } else {
    walkerSprite.addSpeed(0.35, 90);
  }

  // Collision check
  enemies.forEach(enemy => {
    if(enemy.overlap(walkerSprite)) {
      gameState = gameStates.LOST;
      walkerState = walkerStates.DEAD;
      deathSound.play();
    }
  });

  // Update enemy array
  var invisibleEnemies = enemies.filter(enemy =>
    enemy.position.x < -10
  );
  var visibleEnemies = enemies.filter(enemy =>
    enemy.position.x >= -10
  );
  enemies = visibleEnemies;
  invisibleEnemies.forEach(sprite => {
    sprite.remove();
    pointSound.play();
    score++;
    topScore = Math.max(topScore, score);
  });

  // Create new enemy if necessary
  if( enemies.length < 3 &&
      Math.max.apply(Math, enemies.map(enemy =>
        enemy.position.x)) < width - 150 &&
      Math.random() < 0.01
    ){
    var enemy = createSprite(width + 50, height - 80, 40, 40);
    enemy.velocity.x = -4;
    enemy.addAnimation('default', monsterAnimation);
    enemies.push(enemy);
  }

  // Pick walker animation
  switch(walkerState){
    case walkerStates.WALKING:
      break;
    case walkerStates.JUMPING:
      break;
    case walkerStates.DEAD:
      break;
  }
}


// Reset
function resetGame() {
  walkerSprite.position.y = height - 80;
  walkerSprite.velocity.y = 0;
  enemies.forEach(enemy =>
    enemy.remove()
  )
  enemies = [];
  score = 0;
}

// Display Score
function displayScore() {
  fill(200);
  textAlign(LEFT, BOTTOM);
  text('Puan: ' + score, 10, 20);
  textAlign(RIGHT, BOTTOM);
  text('Rekor: ' + topScore, width - 10, 20)
}

// Interactivity
function keyPressed() {
  if (keyCode === RETURN) {
    switch(gameState){
      case gameStates.FRESH:
        gameState = gameStates.ONGOING;
        loop();
        break;
      case gameStates.LOST:
        resetGame();
        gameState = gameStates.ONGOING;
        loop();
        break;
    }
  }

  if (key === 'd' || key === 'D') {
    switch(gameState){
      case gameStates.ONGOING:
        gameState = gameStates.PAUSED;
        noLoop();
        break;
      case gameStates.PAUSED:
        gameState = gameStates.ONGOING;
        loop();
        break;
    }
  }

  if ( key === ' ' &&
       gameState === gameStates.ONGOING &&
       walkerState === walkerStates.WALKING ) {
         walkerState = walkerStates.JUMPING;
         walkerSprite.velocity.y = -10;
         boinkSound.play();
       }
}