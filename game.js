const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const coinsDisplay = document.getElementById('coins');
const statusDisplay = document.getElementById('status');
const restartBtn = document.getElementById('restart');

// Game state
let gameState = 'playing'; // 'playing', 'won', 'levelComplete'
let coins = 0;
let currentLevel = 1;
const MAX_LEVEL = 3;

// Gravity and physics
const GRAVITY = 0.5;
const JUMP_FORCE = -12;
const MOVE_SPEED = 5;

// JimJam - the hero!
const jimjam = {
  x: 50,
  y: 300,
  width: 40,
  height: 50,
  velocityX: 0,
  velocityY: 0,
  isOnGround: false,
  color: '#ff6b6b',
  eyeColor: '#fff',
  direction: 1, // 1 = right, -1 = left
  isFlying: false,
  flyingTime: 0,
  wingAngle: 0
};

// Emu - the hand-bird friend!
const emu = {
  x: 20,
  y: 280,
  width: 30,
  height: 35,
  targetX: 20,
  targetY: 280,
  color: '#ffd93d',
  wingAngle: 0
};

// Controls
const keys = {
  left: false,
  right: false,
  jump: false
};

// Level dimensions
const LEVEL_WIDTH = 2200;

// Level configurations
const levelData = {
  1: {
    name: "Living Room Lava",
    platforms: [
      { x: 0, y: 350, width: LEVEL_WIDTH, height: 50, isFloor: true },
      { x: 150, y: 280, width: 100, height: 20 },
      { x: 350, y: 220, width: 120, height: 20 },
      { x: 550, y: 260, width: 100, height: 20 },
      { x: 750, y: 200, width: 130, height: 20 },
      { x: 950, y: 250, width: 100, height: 20 },
      { x: 1150, y: 190, width: 120, height: 20 },
      { x: 1350, y: 240, width: 100, height: 20 },
      { x: 1550, y: 180, width: 130, height: 20 },
      { x: 1750, y: 220, width: 100, height: 20 },
      { x: 1950, y: 280, width: 120, height: 20 },
      { x: 2080, y: 320, width: 80, height: 30 }
    ],
    stars: [
      { x: 300, y: 250 },
      { x: 700, y: 180 },
      { x: 1100, y: 220 },
      { x: 1500, y: 100 },
      { x: 1900, y: 250 }
    ],
    powerups: [
      { x: 400, y: 180 },
      { x: 1200, y: 150 },
      { x: 1800, y: 180 }
    ],
    greyhounds: [
      { x: 250, minX: 150, maxX: 450, speed: 1.5 },
      { x: 700, minX: 550, maxX: 850, speed: 2 },
      { x: 1000, minX: 900, maxX: 1200, speed: 1.8 },
      { x: 1400, minX: 1300, maxX: 1600, speed: 2.2 },
      { x: 1800, minX: 1700, maxX: 1950, speed: 1.5 }
    ],
    pipes: [
      { x: 280 },
      { x: 600 },
      { x: 1000 },
      { x: 1450 },
      { x: 1850 }
    ]
  },
  2: {
    name: "Underwater Ice Cave",
    platforms: [
      { x: 0, y: 350, width: LEVEL_WIDTH, height: 50, isFloor: true },
      { x: 120, y: 290, width: 110, height: 25 },
      { x: 320, y: 230, width: 100, height: 25 },
      { x: 500, y: 270, width: 120, height: 25 },
      { x: 720, y: 200, width: 100, height: 25 },
      { x: 920, y: 260, width: 130, height: 25 },
      { x: 1120, y: 190, width: 100, height: 25 },
      { x: 1320, y: 250, width: 120, height: 25 },
      { x: 1520, y: 180, width: 110, height: 25 },
      { x: 1720, y: 230, width: 100, height: 25 },
      { x: 1920, y: 280, width: 130, height: 25 },
      { x: 2070, y: 310, width: 90, height: 30 }
    ],
    stars: [
      { x: 280, y: 260 },
      { x: 650, y: 170 },
      { x: 1050, y: 230 },
      { x: 1450, y: 150 },
      { x: 1850, y: 200 }
    ],
    powerups: [
      { x: 350, y: 190 },
      { x: 1000, y: 160 },
      { x: 1650, y: 140 }
    ],
    greyhounds: [
      { x: 200, minX: 100, maxX: 400, speed: 1.2 },
      { x: 600, minX: 480, maxX: 750, speed: 1.5 },
      { x: 950, minX: 850, maxX: 1100, speed: 1.3 },
      { x: 1350, minX: 1250, maxX: 1500, speed: 1.6 },
      { x: 1750, minX: 1650, maxX: 1900, speed: 1.4 }
    ],
    pipes: [] // No pipes in underwater level
  },
  3: {
    name: "Smokey Mountain Trail",
    platforms: [
      { x: 0, y: 350, width: LEVEL_WIDTH, height: 50, isFloor: true },
      { x: 130, y: 280, width: 80, height: 30, isTree: true },
      { x: 300, y: 220, width: 90, height: 30, isTree: true },
      { x: 480, y: 260, width: 85, height: 30, isTree: true },
      { x: 680, y: 190, width: 80, height: 30, isTree: true },
      { x: 880, y: 240, width: 95, height: 30, isTree: true },
      { x: 1080, y: 180, width: 80, height: 30, isTree: true },
      { x: 1280, y: 230, width: 90, height: 30, isTree: true },
      { x: 1480, y: 170, width: 85, height: 30, isTree: true },
      { x: 1680, y: 210, width: 80, height: 30, isTree: true },
      { x: 1880, y: 260, width: 95, height: 30, isTree: true },
      { x: 2050, y: 300, width: 100, height: 35, isTree: true }
    ],
    stars: [
      { x: 250, y: 250 },
      { x: 580, y: 160 },
      { x: 980, y: 210 },
      { x: 1380, y: 140 },
      { x: 1780, y: 180 }
    ],
    powerups: [
      { x: 380, y: 180 },
      { x: 1180, y: 140 },
      { x: 1580, y: 130 }
    ],
    greyhounds: [], // No greyhounds - we have bears!
    bears: [
      { x: 200, minX: 100, maxX: 400, speed: 1.0 },
      { x: 550, minX: 450, maxX: 700, speed: 1.2 },
      { x: 900, minX: 800, maxX: 1050, speed: 1.1 },
      { x: 1300, minX: 1200, maxX: 1450, speed: 1.3 },
      { x: 1700, minX: 1600, maxX: 1850, speed: 1.0 }
    ],
    pipes: [] // No pipes in mountain level
  }
};

// Active level data (populated by loadLevel)
let platforms = [];
let stars = [];
let flyingPowerups = [];
let greyhounds = [];
let pipes = [];
let penguins = []; // For level 2
let bears = []; // For level 3

// Flag (goal)
let flag = {
  x: 2100,
  y: 270,
  width: 10,
  height: 80
};

// Clouds/Bubbles for decoration
let clouds = [];

// Camera for scrolling
let camera = {
  x: 0
};

// Load a level
function loadLevel(levelNum) {
  currentLevel = levelNum;
  const data = levelData[levelNum];

  // Set up platforms
  platforms = data.platforms.map(p => ({ ...p }));

  // Set up stars
  stars = data.stars.map(s => ({ ...s, collected: false }));

  // Set up powerups
  flyingPowerups = data.powerups.map(p => ({ ...p, collected: false }));

  // Set up greyhounds
  greyhounds = data.greyhounds.map(g => ({
    x: g.x,
    y: 310,
    width: 50,
    height: 40,
    speed: g.speed,
    direction: Math.random() > 0.5 ? 1 : -1,
    minX: g.minX,
    maxX: g.maxX,
    alive: true,
    legPhase: 0
  }));

  // Set up pipes (level 1 only)
  if (data.pipes && data.pipes.length > 0) {
    pipes = data.pipes.map((p, i) => ({
      x: p.x,
      y: 300,
      width: 50,
      height: 50,
      snakeOut: i * 0.2,
      snakeDirection: 1,
      snakeSpeed: 0.03 + Math.random() * 0.015,
      waitUntil: 0
    }));
  } else {
    pipes = [];
  }

  // Set up penguins (level 2 only)
  if (levelNum === 2) {
    penguins = platforms.filter(p => !p.isFloor).map(p => ({
      x: p.x + p.width / 2 - 15,
      y: p.y - 30,
      width: 30,
      height: 30,
      platformX: p.x,
      platformWidth: p.width,
      direction: 1,
      waddlePhase: Math.random() * Math.PI * 2
    }));
  } else {
    penguins = [];
  }

  // Set up bears (level 3 only)
  if (data.bears && data.bears.length > 0) {
    bears = data.bears.map(b => ({
      x: b.x,
      y: 305,
      width: 60,
      height: 45,
      speed: b.speed,
      direction: Math.random() > 0.5 ? 1 : -1,
      minX: b.minX,
      maxX: b.maxX,
      alive: true,
      walkPhase: 0
    }));
  } else {
    bears = [];
  }

  // Add bounce property to tree platforms
  platforms.forEach(p => {
    if (p.isTree) {
      p.bounceOffset = 0;
      p.bounceVelocity = 0;
    }
  });

  // Set up clouds/bubbles
  clouds = [];
  for (let i = 0; i < 10; i++) {
    clouds.push({
      x: i * 220 + Math.random() * 100,
      y: 30 + Math.random() * 60,
      size: 30 + Math.random() * 25
    });
  }

  // Reset player position
  jimjam.x = 50;
  jimjam.y = 300;
  jimjam.velocityX = 0;
  jimjam.velocityY = 0;
  jimjam.isFlying = false;
  jimjam.flyingTime = 0;
  emu.x = 20;
  emu.y = 280;
  camera.x = 0;
  gameState = 'playing';
}

// Initialize level 1
loadLevel(1);

// Detect touch device and add appropriate class to body
const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
if (isTouchDevice) {
  document.body.classList.add('touch-device');
} else {
  document.body.classList.add('no-touch');
}

// Event listeners
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = true;
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = true;
  if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
    e.preventDefault();
    keys.jump = true;
  }
});

document.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = false;
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = false;
  if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') keys.jump = false;
});

// Touch controls for mobile
const touchLeft = document.getElementById('touch-left');
const touchRight = document.getElementById('touch-right');
const touchJump = document.getElementById('touch-jump');

if (touchLeft) {
  touchLeft.addEventListener('touchstart', (e) => {
    e.preventDefault();
    keys.left = true;
  });
  touchLeft.addEventListener('touchend', (e) => {
    e.preventDefault();
    keys.left = false;
  });
}

if (touchRight) {
  touchRight.addEventListener('touchstart', (e) => {
    e.preventDefault();
    keys.right = true;
  });
  touchRight.addEventListener('touchend', (e) => {
    e.preventDefault();
    keys.right = false;
  });
}

if (touchJump) {
  touchJump.addEventListener('touchstart', (e) => {
    e.preventDefault();
    keys.jump = true;
  });
  touchJump.addEventListener('touchend', (e) => {
    e.preventDefault();
    keys.jump = false;
  });
}

// Prevent default touch behavior on canvas to avoid scrolling
canvas.addEventListener('touchstart', (e) => e.preventDefault());
canvas.addEventListener('touchmove', (e) => e.preventDefault());

restartBtn.addEventListener('click', resetGame);

function resetGame() {
  coins = 0;
  loadLevel(1);
  statusDisplay.textContent = '';
  coinsDisplay.textContent = 'Stars: 0';
}

function nextLevel() {
  if (currentLevel < MAX_LEVEL) {
    loadLevel(currentLevel + 1);
    statusDisplay.textContent = `Level ${currentLevel}: ${levelData[currentLevel].name}!`;
    setTimeout(() => {
      if (gameState === 'playing') statusDisplay.textContent = '';
    }, 2000);
  } else {
    gameState = 'won';
  }
}

function update() {
  if (gameState !== 'playing') return;

  // Handle input
  if (keys.left) {
    jimjam.velocityX = -MOVE_SPEED;
    jimjam.direction = -1;
  } else if (keys.right) {
    jimjam.velocityX = MOVE_SPEED;
    jimjam.direction = 1;
  } else {
    jimjam.velocityX = 0;
  }

  if (keys.jump && jimjam.isOnGround) {
    jimjam.velocityY = JUMP_FORCE;
    jimjam.isOnGround = false;
  }

  // Flying controls - hold jump to fly up when powered!
  if (jimjam.isFlying) {
    jimjam.wingAngle += 0.4;
    jimjam.flyingTime--;

    if (keys.jump) {
      jimjam.velocityY = -4; // Fly upward
    }

    if (jimjam.flyingTime <= 0) {
      jimjam.isFlying = false;
      statusDisplay.textContent = 'Flying wore off!';
      setTimeout(() => {
        if (gameState === 'playing' && !jimjam.isFlying) statusDisplay.textContent = '';
      }, 1500);
    }
  }

  // Apply gravity (reduced when flying)
  jimjam.velocityY += jimjam.isFlying ? GRAVITY * 0.3 : GRAVITY;

  // Move JimJam
  jimjam.x += jimjam.velocityX;
  jimjam.y += jimjam.velocityY;

  // Keep in bounds (level bounds, not screen bounds)
  if (jimjam.x < 0) jimjam.x = 0;
  if (jimjam.x + jimjam.width > LEVEL_WIDTH) jimjam.x = LEVEL_WIDTH - jimjam.width;

  // Update camera to follow JimJam
  const targetCameraX = jimjam.x - canvas.width / 3;
  camera.x = Math.max(0, Math.min(targetCameraX, LEVEL_WIDTH - canvas.width));

  // Platform collision
  jimjam.isOnGround = false;
  platforms.forEach(platform => {
    // Adjust platform y position for tree bounce
    const platformY = platform.isTree ? platform.y + (platform.bounceOffset || 0) : platform.y;

    if (jimjam.x < platform.x + platform.width &&
        jimjam.x + jimjam.width > platform.x &&
        jimjam.y + jimjam.height > platformY &&
        jimjam.y + jimjam.height < platformY + platform.height + jimjam.velocityY + 1 &&
        jimjam.velocityY >= 0) {
      jimjam.y = platformY - jimjam.height;
      jimjam.velocityY = 0;
      jimjam.isOnGround = true;

      // Trigger tree bounce on landing
      if (platform.isTree && Math.abs(platform.bounceVelocity) < 0.5) {
        platform.bounceVelocity = 3; // Start bouncing down
      }
    }
  });

  // Fall off screen reset
  if (jimjam.y > canvas.height) {
    jimjam.x = 50;
    jimjam.y = 300;
    jimjam.velocityY = 0;
  }

  // Emu follows JimJam
  emu.targetX = jimjam.x - 40 * jimjam.direction;
  emu.targetY = jimjam.y - 20;
  emu.x += (emu.targetX - emu.x) * 0.08;
  emu.y += (emu.targetY - emu.y) * 0.08;
  emu.wingAngle += 0.2;

  // Collect stars
  stars.forEach(star => {
    if (!star.collected) {
      const dx = (jimjam.x + jimjam.width/2) - star.x;
      const dy = (jimjam.y + jimjam.height/2) - star.y;
      const distance = Math.sqrt(dx*dx + dy*dy);
      if (distance < 30) {
        star.collected = true;
        coins++;
        coinsDisplay.textContent = `Stars: ${coins}`;
      }
    }
  });

  // Collect flying powerups
  flyingPowerups.forEach(powerup => {
    if (!powerup.collected) {
      const dx = (jimjam.x + jimjam.width/2) - powerup.x;
      const dy = (jimjam.y + jimjam.height/2) - powerup.y;
      const distance = Math.sqrt(dx*dx + dy*dy);
      if (distance < 30) {
        powerup.collected = true;
        jimjam.isFlying = true;
        jimjam.flyingTime = 300; // About 5 seconds of flying
        statusDisplay.textContent = 'WHEEE! JimJam can FLY!';
      }
    }
  });

  // Update greyhounds
  greyhounds.forEach(dog => {
    if (!dog.alive) return;

    // Move greyhound
    dog.x += dog.speed * dog.direction;
    dog.legPhase += 0.3;

    // Reverse direction at boundaries
    if (dog.x <= dog.minX || dog.x + dog.width >= dog.maxX) {
      dog.direction *= -1;
    }

    // Check collision with JimJam
    if (jimjam.x < dog.x + dog.width &&
        jimjam.x + jimjam.width > dog.x &&
        jimjam.y < dog.y + dog.height &&
        jimjam.y + jimjam.height > dog.y) {

      // Check if JimJam is jumping on top
      if (jimjam.velocityY > 0 && jimjam.y + jimjam.height < dog.y + dog.height / 2) {
        // Stomp the greyhound!
        dog.alive = false;
        jimjam.velocityY = JUMP_FORCE / 2; // Bounce
      } else {
        // Got wet nosed! Reset position
        jimjam.x = 50;
        jimjam.y = 300;
        jimjam.velocityY = 0;
        statusDisplay.textContent = 'Eww! Wet nose attack! Boop!';
        setTimeout(() => {
          if (gameState === 'playing') statusDisplay.textContent = '';
        }, 1500);
      }
    }
  });

  // Update pipes and snakes
  pipes.forEach(pipe => {
    const now = Date.now();

    // If waiting, check if wait time is over
    if (pipe.waitUntil > now) {
      return; // Still waiting, skip this pipe
    }

    // Snake moves up and down
    pipe.snakeOut += pipe.snakeSpeed * pipe.snakeDirection;

    if (pipe.snakeOut >= 1) {
      pipe.snakeDirection = -1;
    } else if (pipe.snakeOut <= 0) {
      pipe.snakeOut = 0;
      pipe.snakeDirection = 1;
      pipe.waitUntil = now + 5000; // Wait 5 seconds before popping back up
    }

    // Check collision with snake (only when snake is out)
    if (pipe.snakeOut > 0.3) {
      const snakeHeadX = pipe.x + pipe.width / 2;
      const snakeHeadY = pipe.y - pipe.snakeOut * 40;

      const dx = (jimjam.x + jimjam.width/2) - snakeHeadX;
      const dy = (jimjam.y + jimjam.height/2) - snakeHeadY;
      const distance = Math.sqrt(dx*dx + dy*dy);

      if (distance < 25) {
        // Got bit by snake!
        jimjam.x = 50;
        jimjam.y = 300;
        jimjam.velocityY = 0;
        statusDisplay.textContent = 'Hisss! Snake bite! Ssssorry!';
        setTimeout(() => {
          if (gameState === 'playing') statusDisplay.textContent = '';
        }, 1500);
      }
    }
  });

  // Update bears (level 3)
  bears.forEach(bear => {
    if (!bear.alive) return;

    // Move bear
    bear.x += bear.speed * bear.direction;
    bear.walkPhase += 0.15;

    // Reverse direction at boundaries
    if (bear.x <= bear.minX || bear.x + bear.width >= bear.maxX) {
      bear.direction *= -1;
    }

    // Check collision with JimJam
    if (jimjam.x < bear.x + bear.width &&
        jimjam.x + jimjam.width > bear.x &&
        jimjam.y < bear.y + bear.height &&
        jimjam.y + jimjam.height > bear.y) {

      // Check if JimJam is jumping on top
      if (jimjam.velocityY > 0 && jimjam.y + jimjam.height < bear.y + bear.height / 2) {
        // Stomp the bear!
        bear.alive = false;
        jimjam.velocityY = JUMP_FORCE / 2;
        statusDisplay.textContent = 'Boop! Bear belly bounce!';
        setTimeout(() => {
          if (gameState === 'playing') statusDisplay.textContent = '';
        }, 1500);
      } else {
        // Got bear hugged!
        jimjam.x = 50;
        jimjam.y = 300;
        jimjam.velocityY = 0;
        statusDisplay.textContent = 'Bear hug! Too cuddly!';
        setTimeout(() => {
          if (gameState === 'playing') statusDisplay.textContent = '';
        }, 1500);
      }
    }
  });

  // Update tree bounces (level 3)
  platforms.forEach(p => {
    if (p.isTree) {
      // Apply spring physics
      p.bounceVelocity += -p.bounceOffset * 0.3; // Spring force
      p.bounceVelocity *= 0.85; // Damping
      p.bounceOffset += p.bounceVelocity;
    }
  });

  // Check win condition (reach the blanket fort / submarine / cabin)
  if (jimjam.x + jimjam.width > flag.x) {
    if (currentLevel < MAX_LEVEL) {
      gameState = 'levelComplete';
      const messages = {
        1: 'Level Complete! Time to dive underwater!',
        2: 'Level Complete! Time to go hiking in the Smokeys!'
      };
      statusDisplay.textContent = messages[currentLevel] || 'Level Complete!';
      setTimeout(() => {
        nextLevel();
      }, 2000);
    } else {
      gameState = 'won';
      statusDisplay.textContent = `Woohoo! JimJam collected ${coins} stars!`;
    }
  }

  // Update penguins (level 2)
  penguins.forEach(penguin => {
    penguin.waddlePhase += 0.1;
    penguin.x += penguin.direction * 0.5;

    // Waddle back and forth on platform
    if (penguin.x <= penguin.platformX) {
      penguin.direction = 1;
    } else if (penguin.x + penguin.width >= penguin.platformX + penguin.platformWidth) {
      penguin.direction = -1;
    }
  });
}

function drawCloud(x, y, size) {
  if (currentLevel === 1) {
    // Regular cloud
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
    ctx.arc(x + size * 0.4, y - size * 0.1, size * 0.4, 0, Math.PI * 2);
    ctx.arc(x + size * 0.8, y, size * 0.5, 0, Math.PI * 2);
    ctx.arc(x + size * 0.4, y + size * 0.2, size * 0.35, 0, Math.PI * 2);
    ctx.fill();
  } else if (currentLevel === 2) {
    // Underwater bubble
    const float = Math.sin(Date.now() / 500 + x) * 3;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y + float, size * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Bubble shine
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(x - size * 0.1, y + float - size * 0.1, size * 0.08, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Flying birds (Level 3)
    const flap = Math.sin(Date.now() / 150 + x) * 8;
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    // Left wing
    ctx.moveTo(x - 8, y + flap);
    ctx.quadraticCurveTo(x - 4, y - 3, x, y);
    // Right wing
    ctx.quadraticCurveTo(x + 4, y - 3, x + 8, y + flap);
    ctx.stroke();
  }
}

function drawPenguin(penguin) {
  const x = penguin.x;
  const y = penguin.y;
  const waddle = Math.sin(penguin.waddlePhase) * 3;

  ctx.save();
  ctx.translate(x + penguin.width / 2, y + penguin.height / 2);
  ctx.rotate(waddle * 0.05);
  ctx.translate(-(x + penguin.width / 2), -(y + penguin.height / 2));

  // Body (black)
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.ellipse(x + 15, y + 15, 12, 15, 0, 0, Math.PI * 2);
  ctx.fill();

  // Belly (white)
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(x + 15, y + 18, 8, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.arc(x + 15, y + 2, 8, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(x + 12, y, 3, 0, Math.PI * 2);
  ctx.arc(x + 18, y, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(x + 12 + penguin.direction, y, 1.5, 0, Math.PI * 2);
  ctx.arc(x + 18 + penguin.direction, y, 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Beak
  ctx.fillStyle = '#ffa500';
  ctx.beginPath();
  ctx.moveTo(x + 15, y + 2);
  ctx.lineTo(x + 15 + penguin.direction * 6, y + 4);
  ctx.lineTo(x + 15, y + 6);
  ctx.closePath();
  ctx.fill();

  // Feet
  ctx.fillStyle = '#ffa500';
  const footOffset = Math.sin(penguin.waddlePhase) * 2;
  ctx.beginPath();
  ctx.ellipse(x + 10, y + 28 + footOffset, 5, 3, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + 20, y + 28 - footOffset, 5, 3, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Flippers
  ctx.fillStyle = '#1a1a1a';
  const flipperAngle = Math.sin(penguin.waddlePhase) * 0.3;
  ctx.save();
  ctx.translate(x + 3, y + 12);
  ctx.rotate(-0.3 + flipperAngle);
  ctx.fillRect(-2, 0, 4, 12);
  ctx.restore();
  ctx.save();
  ctx.translate(x + 27, y + 12);
  ctx.rotate(0.3 - flipperAngle);
  ctx.fillRect(-2, 0, 4, 12);
  ctx.restore();

  ctx.restore();
}

function drawDivingHelmet(x, y, size) {
  // Clear glass dome
  ctx.strokeStyle = 'rgba(200, 200, 200, 0.8)';
  ctx.lineWidth = 2;
  ctx.fillStyle = 'rgba(200, 230, 255, 0.3)';
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Metal rim at bottom
  ctx.fillStyle = '#888';
  ctx.fillRect(x - size, y + size - 4, size * 2, 6);

  // Shine on glass
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.beginPath();
  ctx.ellipse(x - size * 0.3, y - size * 0.3, size * 0.3, size * 0.2, -0.5, 0, Math.PI * 2);
  ctx.fill();

  // Air bubbles coming out
  if (Math.random() > 0.95) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.arc(x + size * 0.8, y - size - Math.random() * 10, 2 + Math.random() * 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawJimJam() {
  const x = jimjam.x;
  const y = jimjam.y;
  const dir = jimjam.direction;

  // Draw wings if flying!
  if (jimjam.isFlying) {
    const wingFlap = Math.sin(jimjam.wingAngle) * 15;

    ctx.save();
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 10;

    // Left wing
    ctx.fillStyle = '#00ffff';
    ctx.beginPath();
    ctx.ellipse(x - 5, y + 25 + wingFlap, 20, 10, -0.5 + wingFlap * 0.02, 0, Math.PI * 2);
    ctx.fill();

    // Right wing
    ctx.beginPath();
    ctx.ellipse(x + jimjam.width + 5, y + 25 - wingFlap, 20, 10, 0.5 - wingFlap * 0.02, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Sparkle trail
    ctx.fillStyle = `rgba(0, 255, 255, ${0.3 + Math.random() * 0.3})`;
    ctx.beginPath();
    ctx.arc(x + Math.random() * jimjam.width, y + jimjam.height + Math.random() * 10, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Legs
  ctx.fillStyle = '#4169e1'; // Blue jeans
  ctx.fillRect(x + 8, y + 35, 10, 15);
  ctx.fillRect(x + 22, y + 35, 10, 15);

  // Shoes
  ctx.fillStyle = '#dc143c'; // Red sneakers
  ctx.fillRect(x + 5, y + 47, 14, 6);
  ctx.fillRect(x + 21, y + 47, 14, 6);

  // Body/Shirt
  ctx.fillStyle = jimjam.isFlying ? '#ff6b6b' : '#dc143c'; // Red t-shirt
  ctx.fillRect(x + 5, y + 18, 30, 20);

  // Ankylosaurus on shirt!
  ctx.fillStyle = '#4a7c59'; // Dino green
  // Body
  ctx.beginPath();
  ctx.ellipse(x + 20, y + 28, 8, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  // Head
  ctx.beginPath();
  ctx.arc(x + 12, y + 27, 3, 0, Math.PI * 2);
  ctx.fill();
  // Tail with club
  ctx.beginPath();
  ctx.moveTo(x + 28, y + 28);
  ctx.lineTo(x + 32, y + 26);
  ctx.lineTo(x + 34, y + 27);
  ctx.lineTo(x + 32, y + 28);
  ctx.closePath();
  ctx.fill();
  // Spikes on back
  ctx.fillStyle = '#3d6b4a';
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.arc(x + 14 + i * 4, y + 24, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
  // Legs
  ctx.fillRect(x + 14, y + 30, 2, 3);
  ctx.fillRect(x + 18, y + 30, 2, 3);
  ctx.fillRect(x + 22, y + 30, 2, 3);
  ctx.fillRect(x + 26, y + 30, 2, 3);

  // Arms
  ctx.fillStyle = '#ffdbac'; // Skin
  // Left arm
  ctx.fillRect(x - 2, y + 20, 8, 14);
  // Right arm
  ctx.fillRect(x + 34, y + 20, 8, 14);

  // Head
  ctx.fillStyle = '#ffdbac'; // Skin color
  ctx.beginPath();
  ctx.arc(x + 20, y + 12, 14, 0, Math.PI * 2);
  ctx.fill();

  // Messy hair
  ctx.fillStyle = '#8B4513'; // Brown hair
  ctx.beginPath();
  ctx.ellipse(x + 20, y + 4, 14, 8, 0, Math.PI, 2 * Math.PI);
  ctx.fill();
  // Hair tufts
  ctx.beginPath();
  ctx.ellipse(x + 12, y - 2, 4, 6, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + 20, y - 4, 3, 5, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + 27, y - 1, 4, 5, 0.4, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(x + 15 + dir * 2, y + 10, 5, 0, Math.PI * 2);
  ctx.arc(x + 25 + dir * 2, y + 10, 5, 0, Math.PI * 2);
  ctx.fill();

  // Pupils (looking in direction of movement)
  ctx.fillStyle = '#708090'; // Gray eyes
  ctx.beginPath();
  ctx.arc(x + 16 + dir * 3, y + 10, 2.5, 0, Math.PI * 2);
  ctx.arc(x + 26 + dir * 3, y + 10, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Rosy cheeks
  ctx.fillStyle = 'rgba(255, 150, 150, 0.5)';
  ctx.beginPath();
  ctx.arc(x + 10, y + 15, 4, 0, Math.PI * 2);
  ctx.arc(x + 30, y + 15, 4, 0, Math.PI * 2);
  ctx.fill();

  // Big happy smile
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x + 20, y + 16, 7, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();

  // Freckles
  ctx.fillStyle = '#cd853f';
  ctx.beginPath();
  ctx.arc(x + 14, y + 12, 1, 0, Math.PI * 2);
  ctx.arc(x + 18, y + 14, 1, 0, Math.PI * 2);
  ctx.arc(x + 22, y + 14, 1, 0, Math.PI * 2);
  ctx.arc(x + 26, y + 12, 1, 0, Math.PI * 2);
  ctx.fill();

  // Diving helmet (Level 2)
  if (currentLevel === 2) {
    drawDivingHelmet(x + 20, y + 10, 18);
  }
}

function drawEmu() {
  const x = emu.x;
  const y = emu.y;

  // Bob animation
  const bobOffset = Math.sin(emu.wingAngle) * 2;

  // Long skinny legs
  ctx.strokeStyle = '#4a4a4a';
  ctx.lineWidth = 3;
  // Left leg
  ctx.beginPath();
  ctx.moveTo(x + 12, y + 30);
  ctx.lineTo(x + 8, y + 45 + bobOffset);
  ctx.lineTo(x + 5, y + 48 + bobOffset);
  ctx.stroke();
  // Right leg
  ctx.beginPath();
  ctx.moveTo(x + 20, y + 30);
  ctx.lineTo(x + 24, y + 45 - bobOffset);
  ctx.lineTo(x + 27, y + 48 - bobOffset);
  ctx.stroke();

  // Big fluffy body
  ctx.fillStyle = '#5c4033';
  ctx.beginPath();
  ctx.ellipse(x + 15, y + 22, 18, 14, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Fluffy feather texture on body
  ctx.fillStyle = '#4a3728';
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.ellipse(x + 8 + i * 5, y + 20 + (i % 2) * 4, 4, 6, 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Long neck
  ctx.fillStyle = '#6b5344';
  ctx.beginPath();
  ctx.moveTo(x + 25, y + 15);
  ctx.quadraticCurveTo(x + 35, y + 5 + bobOffset, x + 38, y - 15 + bobOffset);
  ctx.quadraticCurveTo(x + 40, y - 20 + bobOffset, x + 35, y - 20 + bobOffset);
  ctx.quadraticCurveTo(x + 28, y - 15 + bobOffset, x + 28, y + 10);
  ctx.closePath();
  ctx.fill();

  // Small head
  ctx.fillStyle = '#5c4033';
  ctx.beginPath();
  ctx.ellipse(x + 38, y - 22 + bobOffset, 8, 7, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // Beak
  ctx.fillStyle = '#2d2d2d';
  ctx.beginPath();
  ctx.moveTo(x + 44, y - 22 + bobOffset);
  ctx.lineTo(x + 52, y - 20 + bobOffset);
  ctx.lineTo(x + 44, y - 18 + bobOffset);
  ctx.closePath();
  ctx.fill();

  // Big googly eye
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(x + 40, y - 24 + bobOffset, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.arc(x + 41, y - 24 + bobOffset, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Messy head feathers
  ctx.fillStyle = '#4a3728';
  ctx.beginPath();
  ctx.ellipse(x + 35, y - 28 + bobOffset, 3, 5, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + 38, y - 30 + bobOffset, 2, 4, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + 41, y - 29 + bobOffset, 2, 4, 0.4, 0, Math.PI * 2);
  ctx.fill();

  // Diving helmet (Level 2)
  if (currentLevel === 2) {
    drawDivingHelmet(x + 38, y - 22 + bobOffset, 12);
  }
}

function drawFlyingPowerup(x, y) {
  // Floating animation
  const float = Math.sin(Date.now() / 200) * 5;

  ctx.save();
  ctx.translate(x, y + float);

  // Donut body (tan/beige)
  ctx.fillStyle = '#d4a574';
  ctx.beginPath();
  ctx.arc(0, 0, 18, 0, Math.PI * 2);
  ctx.fill();

  // Donut hole
  ctx.fillStyle = '#87CEEB'; // Sky shows through
  ctx.beginPath();
  ctx.arc(0, 0, 6, 0, Math.PI * 2);
  ctx.fill();

  // Chocolate icing on top
  ctx.fillStyle = '#4a2c2a';
  ctx.beginPath();
  ctx.ellipse(0, -2, 16, 12, 0, Math.PI, 2 * Math.PI);
  ctx.fill();
  // Icing drips
  ctx.beginPath();
  ctx.ellipse(-12, 2, 4, 6, 0.2, 0, Math.PI);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(10, 4, 3, 5, -0.3, 0, Math.PI);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(0, 5, 3, 4, 0, 0, Math.PI);
  ctx.fill();

  // Colorful sprinkles!
  const sprinkleColors = ['#ff6b6b', '#4ade80', '#60a5fa', '#fbbf24', '#f472b6', '#a78bfa'];
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const r = 8 + Math.sin(i * 3) * 4;
    const sx = Math.cos(angle) * r;
    const sy = Math.sin(angle) * r - 4;
    if (sy < 2) { // Only on the icing
      ctx.fillStyle = sprinkleColors[i % sprinkleColors.length];
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(angle + 0.5);
      ctx.fillRect(-3, -1, 6, 2);
      ctx.restore();
    }
  }

  // Sparkle effect
  ctx.fillStyle = `rgba(255, 255, 255, ${0.5 + Math.sin(Date.now() / 100) * 0.3})`;
  ctx.beginPath();
  ctx.arc(-8, -8, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawStar(x, y) {
  ctx.fillStyle = '#ffd700';
  ctx.strokeStyle = '#ffa500';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    const radius = i === 0 ? 15 : 15;
    if (i === 0) {
      ctx.moveTo(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius);
    } else {
      ctx.lineTo(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius);
    }
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawGreyhound(dog) {
  if (!dog.alive) return;

  const x = dog.x;
  const y = dog.y;
  const dir = dog.direction;
  const legOffset = Math.sin(dog.legPhase) * 5;

  // Greyhound body (long and slender)
  ctx.fillStyle = '#1a1a1a'; // Black color

  // Body
  ctx.beginPath();
  ctx.ellipse(x + 25, y + 20, 22, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Long neck
  ctx.beginPath();
  ctx.ellipse(x + 42 * (dir === 1 ? 1 : -0.2), y + 10, 8, 12, dir * 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Small head
  ctx.beginPath();
  ctx.ellipse(x + 48 * (dir === 1 ? 1 : -0.3), y + 2, 10, 8, dir * 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Long snout
  ctx.fillStyle = '#2d2d2d';
  ctx.beginPath();
  ctx.ellipse(x + 55 * (dir === 1 ? 1 : -0.5), y + 4, 8, 4, dir * 0.1, 0, Math.PI * 2);
  ctx.fill();

  // BIG WET NOSE (the deadly weapon!)
  ctx.fillStyle = '#4a4a4a';
  ctx.beginPath();
  ctx.ellipse(x + 62 * (dir === 1 ? 1 : -0.6), y + 4, 5, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  // Wet shine on nose
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.beginPath();
  ctx.ellipse(x + 60 * (dir === 1 ? 1 : -0.5), y + 2, 2, 1.5, 0, 0, Math.PI * 2);
  ctx.fill();
  // Drip from wet nose (silly!)
  ctx.fillStyle = 'rgba(150, 200, 255, 0.7)';
  ctx.beginPath();
  ctx.ellipse(x + 62 * (dir === 1 ? 1 : -0.6), y + 9 + Math.abs(Math.sin(dog.legPhase)) * 3, 2, 3 + Math.abs(Math.sin(dog.legPhase)) * 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eye
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.arc(x + 46 * (dir === 1 ? 1 : -0.2), y, 3, 0, Math.PI * 2);
  ctx.fill();

  // Derpy tongue hanging out (silly!)
  ctx.fillStyle = '#ff6b9d';
  ctx.beginPath();
  ctx.ellipse(x + 58 * (dir === 1 ? 1 : -0.6), y + 8 + Math.sin(dog.legPhase * 2) * 2, 4, 6, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Legs (animated)
  ctx.fillStyle = '#1a1a1a';
  // Front legs
  ctx.fillRect(x + 35, y + 25 + legOffset, 5, 15);
  ctx.fillRect(x + 40, y + 25 - legOffset, 5, 15);
  // Back legs
  ctx.fillRect(x + 8, y + 25 - legOffset, 5, 15);
  ctx.fillRect(x + 13, y + 25 + legOffset, 5, 15);

  // Thin tail (wagging)
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + 3, y + 15);
  ctx.quadraticCurveTo(x - 5, y + 5 + Math.sin(dog.legPhase * 3) * 5, x - 8, y + 10);
  ctx.stroke();

  // Floppy ear
  ctx.fillStyle = '#2d2d2d';
  ctx.beginPath();
  ctx.ellipse(x + 44 * (dir === 1 ? 1 : -0.1), y - 2, 5, 8, -0.5, 0, Math.PI * 2);
  ctx.fill();

  // Diving helmet (Level 2)
  if (currentLevel === 2) {
    drawDivingHelmet(x + 48 * (dir === 1 ? 1 : -0.3), y + 2, 14);
  }
}

function drawBear(bear) {
  if (!bear.alive) return;

  const x = bear.x;
  const y = bear.y;
  const dir = bear.direction;
  const walkOffset = Math.sin(bear.walkPhase) * 3;

  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.beginPath();
  ctx.ellipse(x + 30, y + 45, 25, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Back legs
  ctx.fillStyle = '#2d1810';
  ctx.beginPath();
  ctx.ellipse(x + 12, y + 35 - walkOffset, 8, 12, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + 48, y + 35 + walkOffset, 8, 12, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Big round body
  ctx.fillStyle = '#1a1a1a'; // Black bear
  ctx.beginPath();
  ctx.ellipse(x + 30, y + 22, 28, 22, 0, 0, Math.PI * 2);
  ctx.fill();

  // Lighter belly patch
  ctx.fillStyle = '#3d2d20';
  ctx.beginPath();
  ctx.ellipse(x + 30, y + 28, 15, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Front legs
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.ellipse(x + 15, y + 38 + walkOffset, 7, 10, -0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + 45, y + 38 - walkOffset, 7, 10, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.ellipse(x + 30 + dir * 15, y + 5, 14, 12, dir * 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Snout
  ctx.fillStyle = '#3d2d20';
  ctx.beginPath();
  ctx.ellipse(x + 30 + dir * 25, y + 8, 8, 6, dir * 0.1, 0, Math.PI * 2);
  ctx.fill();

  // Nose
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.ellipse(x + 30 + dir * 30, y + 6, 4, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  // Nose shine
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.beginPath();
  ctx.arc(x + 29 + dir * 30, y + 5, 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Ears
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.arc(x + 20 + dir * 10, y - 5, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 40 + dir * 10, y - 5, 6, 0, Math.PI * 2);
  ctx.fill();
  // Inner ears
  ctx.fillStyle = '#4a3728';
  ctx.beginPath();
  ctx.arc(x + 20 + dir * 10, y - 5, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 40 + dir * 10, y - 5, 3, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(x + 25 + dir * 18, y + 2, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.arc(x + 26 + dir * 19, y + 2, 2, 0, Math.PI * 2);
  ctx.fill();

  // Friendly expression - slight smile
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x + 30 + dir * 25, y + 10, 4, 0.2 * Math.PI, 0.8 * Math.PI);
  ctx.stroke();

  // Little tail
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.ellipse(x + 5 - dir * 5, y + 15, 6, 5, -dir * 0.5, 0, Math.PI * 2);
  ctx.fill();
}

function drawSwordPerson(sp) {
  if (!sp.alive) return;

  const x = sp.x;
  const y = sp.y;
  const dir = sp.direction;

  // Body (tunic)
  ctx.fillStyle = '#8b0000'; // Dark red tunic
  ctx.fillRect(x + 5, y + 15, 20, 25);

  // Head
  ctx.fillStyle = '#ffdbac'; // Skin color
  ctx.beginPath();
  ctx.arc(x + 15, y + 10, 10, 0, Math.PI * 2);
  ctx.fill();

  // Silly helmet
  ctx.fillStyle = '#4a4a4a';
  ctx.beginPath();
  ctx.ellipse(x + 15, y + 5, 12, 8, 0, Math.PI, 2 * Math.PI);
  ctx.fill();
  // Helmet spike
  ctx.beginPath();
  ctx.moveTo(x + 15, y - 5);
  ctx.lineTo(x + 12, y + 5);
  ctx.lineTo(x + 18, y + 5);
  ctx.closePath();
  ctx.fill();

  // Derpy eyes
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(x + 11, y + 8, 4, 0, Math.PI * 2);
  ctx.arc(x + 19, y + 8, 4, 0, Math.PI * 2);
  ctx.fill();
  // Pupils (looking at sword)
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.arc(x + 12 + dir, y + 9, 2, 0, Math.PI * 2);
  ctx.arc(x + 20 + dir, y + 9, 2, 0, Math.PI * 2);
  ctx.fill();

  // Worried mouth
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x + 15, y + 18, 4, 0.2 * Math.PI, 0.8 * Math.PI);
  ctx.stroke();

  // Legs
  ctx.fillStyle = '#5c4033';
  ctx.fillRect(x + 7, y + 38, 6, 10);
  ctx.fillRect(x + 17, y + 38, 6, 10);

  // Arm holding sword
  ctx.fillStyle = '#ffdbac';
  ctx.save();
  ctx.translate(x + 15, y + 20);
  ctx.rotate(sp.swingAngle * dir);

  // Arm
  ctx.fillRect(0, -3, 20, 6);

  // Sword handle
  ctx.fillStyle = '#8b4513';
  ctx.fillRect(18, -5, 8, 10);

  // Sword blade (shiny!)
  ctx.fillStyle = '#c0c0c0';
  ctx.beginPath();
  ctx.moveTo(26, -4);
  ctx.lineTo(45, 0);
  ctx.lineTo(26, 4);
  ctx.closePath();
  ctx.fill();

  // Sword shine
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(28, -2);
  ctx.lineTo(38, 0);
  ctx.lineTo(28, 1);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawPipe(pipe) {
  const x = pipe.x;
  const y = pipe.y;

  // Pipe body (green like Mario!)
  ctx.fillStyle = '#228B22';
  ctx.fillRect(x, y, pipe.width, pipe.height);

  // Pipe rim (top part that sticks out)
  ctx.fillStyle = '#2E8B2E';
  ctx.fillRect(x - 5, y, pipe.width + 10, 15);

  // Pipe highlight
  ctx.fillStyle = '#32CD32';
  ctx.fillRect(x + 5, y + 15, 8, pipe.height - 15);

  // Pipe shadow
  ctx.fillStyle = '#1B5E1B';
  ctx.fillRect(x + pipe.width - 10, y + 15, 8, pipe.height - 15);

  // Snake coming out!
  if (pipe.snakeOut > 0) {
    const snakeHeight = pipe.snakeOut * 40;
    const snakeX = x + pipe.width / 2;
    const snakeY = y;

    // Snake body (wavy)
    ctx.strokeStyle = '#2d5a27';
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(snakeX, snakeY + 10);
    for (let i = 0; i < snakeHeight; i += 5) {
      const wave = Math.sin((i + Date.now() / 100) * 0.3) * 5;
      ctx.lineTo(snakeX + wave, snakeY - i);
    }
    ctx.stroke();

    // Snake body pattern
    ctx.strokeStyle = '#4a8f43';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(snakeX, snakeY + 10);
    for (let i = 0; i < snakeHeight; i += 5) {
      const wave = Math.sin((i + Date.now() / 100) * 0.3) * 5;
      ctx.lineTo(snakeX + wave, snakeY - i);
    }
    ctx.stroke();

    // Snake head
    const headY = snakeY - snakeHeight;
    const headWave = Math.sin(Date.now() / 100 * 0.3) * 5;

    ctx.fillStyle = '#2d5a27';
    ctx.beginPath();
    ctx.ellipse(snakeX + headWave, headY, 10, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Snake eyes
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(snakeX + headWave - 4, headY - 2, 3, 0, Math.PI * 2);
    ctx.arc(snakeX + headWave + 4, headY - 2, 3, 0, Math.PI * 2);
    ctx.fill();

    // Snake pupils (slits)
    ctx.fillStyle = '#000';
    ctx.fillRect(snakeX + headWave - 5, headY - 4, 2, 5);
    ctx.fillRect(snakeX + headWave + 3, headY - 4, 2, 5);

    // Forked tongue
    if (pipe.snakeOut > 0.5) {
      ctx.strokeStyle = '#ff6b6b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(snakeX + headWave, headY - 8);
      ctx.lineTo(snakeX + headWave, headY - 15);
      ctx.lineTo(snakeX + headWave - 4, headY - 20);
      ctx.moveTo(snakeX + headWave, headY - 15);
      ctx.lineTo(snakeX + headWave + 4, headY - 20);
      ctx.stroke();
    }
  }
}

function drawBlanketFort() {
  const x = flag.x - 20;
  const y = flag.y - 40;

  if (currentLevel === 1) {
    // BLANKET FORT (Level 1)
    ctx.fillStyle = '#6b4c9a';
    ctx.beginPath();
    ctx.moveTo(x, y + 100);
    ctx.lineTo(x + 10, y + 20);
    ctx.lineTo(x + 50, y);
    ctx.lineTo(x + 90, y + 20);
    ctx.lineTo(x + 100, y + 100);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#9d7cc7';
    for (let i = 0; i < 5; i++) {
      const sx = x + 20 + (i % 3) * 25;
      const sy = y + 30 + Math.floor(i / 3) * 30;
      ctx.beginPath();
      ctx.arc(sx, sy, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath();
    ctx.moveTo(x + 25, y + 100);
    ctx.lineTo(x + 35, y + 45);
    ctx.lineTo(x + 65, y + 45);
    ctx.lineTo(x + 75, y + 100);
    ctx.closePath();
    ctx.fill();

    const glow = ctx.createRadialGradient(x + 50, y + 80, 5, x + 50, y + 80, 30);
    glow.addColorStop(0, 'rgba(255, 200, 100, 0.4)');
    glow.addColorStop(1, 'rgba(255, 200, 100, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(x + 25, y + 45, 50, 55);

    ctx.fillStyle = '#ff6b6b';
    ctx.beginPath();
    ctx.ellipse(x + 20, y + 95, 15, 10, -0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#4ade80';
    ctx.beginPath();
    ctx.ellipse(x + 80, y + 95, 12, 8, 0.3, 0, Math.PI * 2);
    ctx.fill();

    const colors = ['#ff6b6b', '#fbbf24', '#4ade80', '#60a5fa', '#f472b6'];
    for (let i = 0; i < 5; i++) {
      const lx = x + 15 + i * 18;
      const ly = y + 15 + Math.sin(i * 0.8) * 10;
      if (i < 4) {
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(lx, ly);
        ctx.lineTo(lx + 18, y + 15 + Math.sin((i + 1) * 0.8) * 10);
        ctx.stroke();
      }
      ctx.fillStyle = colors[i];
      ctx.beginPath();
      ctx.arc(lx, ly, 4 + Math.sin(Date.now() / 200 + i) * 1, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = colors[i] + '40';
      ctx.beginPath();
      ctx.arc(lx, ly, 8, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x + 35, y - 5, 30, 15);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('FORT', x + 50, y + 6);
  } else if (currentLevel === 2) {
    // SUBMARINE (Level 2)
    const subY = y + 20;

    // Main hull
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.ellipse(x + 50, subY + 40, 50, 25, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hull stripe
    ctx.fillStyle = '#ff8c00';
    ctx.fillRect(x + 5, subY + 35, 90, 10);

    // Conning tower
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(x + 35, subY + 10, 30, 25);
    ctx.beginPath();
    ctx.arc(x + 50, subY + 10, 15, Math.PI, 0);
    ctx.fill();

    // Periscope
    ctx.fillStyle = '#888';
    ctx.fillRect(x + 47, subY - 20, 6, 30);
    ctx.fillRect(x + 45, subY - 25, 15, 8);

    // Porthole windows
    ctx.fillStyle = '#1a3a5c';
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 3;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(x + 25 + i * 25, subY + 40, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // Window shine
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(x + 23 + i * 25, subY + 38, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Propeller
    ctx.fillStyle = '#666';
    const propAngle = Date.now() / 100;
    ctx.save();
    ctx.translate(x - 5, subY + 40);
    ctx.rotate(propAngle);
    ctx.fillRect(-3, -12, 6, 24);
    ctx.rotate(Math.PI / 2);
    ctx.fillRect(-3, -12, 6, 24);
    ctx.restore();

    // Bubbles from propeller
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    for (let i = 0; i < 3; i++) {
      const bx = x - 15 - i * 8 + Math.sin(Date.now() / 200 + i) * 3;
      const by = subY + 35 + Math.sin(Date.now() / 300 + i * 2) * 5;
      ctx.beginPath();
      ctx.arc(bx, by, 3 + i, 0, Math.PI * 2);
      ctx.fill();
    }

    // "HOME" sign
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('HOME', x + 50, subY + 8);
  } else if (currentLevel === 3) {
    // MOUNTAIN CABIN (Level 3)
    const cabinY = y + 10;

    // Cabin base/walls
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x + 10, cabinY + 30, 80, 60);

    // Log texture
    ctx.strokeStyle = '#5d3a1a';
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(x + 10, cabinY + 35 + i * 12);
      ctx.lineTo(x + 90, cabinY + 35 + i * 12);
      ctx.stroke();
    }

    // Roof
    ctx.fillStyle = '#4a3728';
    ctx.beginPath();
    ctx.moveTo(x, cabinY + 30);
    ctx.lineTo(x + 50, cabinY - 10);
    ctx.lineTo(x + 100, cabinY + 30);
    ctx.closePath();
    ctx.fill();

    // Roof texture
    ctx.strokeStyle = '#3d2d20';
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(x + 10 + i * 10, cabinY + 25 - i * 5);
      ctx.lineTo(x + 90 - i * 10, cabinY + 25 - i * 5);
      ctx.stroke();
    }

    // Chimney
    ctx.fillStyle = '#696969';
    ctx.fillRect(x + 70, cabinY - 5, 15, 25);
    // Smoke
    ctx.fillStyle = 'rgba(200, 200, 200, 0.6)';
    for (let i = 0; i < 3; i++) {
      const smokeY = cabinY - 15 - i * 15 + Math.sin(Date.now() / 300 + i) * 3;
      const smokeX = x + 77 + Math.sin(Date.now() / 400 + i * 2) * 5;
      ctx.beginPath();
      ctx.arc(smokeX, smokeY, 6 + i * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Door
    ctx.fillStyle = '#5d3a1a';
    ctx.fillRect(x + 38, cabinY + 55, 24, 35);
    // Door handle
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(x + 55, cabinY + 75, 3, 0, Math.PI * 2);
    ctx.fill();

    // Windows
    ctx.fillStyle = '#fffacd';
    ctx.fillRect(x + 18, cabinY + 45, 15, 15);
    ctx.fillRect(x + 67, cabinY + 45, 15, 15);
    // Window frames
    ctx.strokeStyle = '#5d3a1a';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 18, cabinY + 45, 15, 15);
    ctx.strokeRect(x + 67, cabinY + 45, 15, 15);
    // Window cross
    ctx.beginPath();
    ctx.moveTo(x + 25.5, cabinY + 45);
    ctx.lineTo(x + 25.5, cabinY + 60);
    ctx.moveTo(x + 18, cabinY + 52.5);
    ctx.lineTo(x + 33, cabinY + 52.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + 74.5, cabinY + 45);
    ctx.lineTo(x + 74.5, cabinY + 60);
    ctx.moveTo(x + 67, cabinY + 52.5);
    ctx.lineTo(x + 82, cabinY + 52.5);
    ctx.stroke();

    // Warm glow from windows
    ctx.fillStyle = 'rgba(255, 200, 100, 0.3)';
    ctx.beginPath();
    ctx.arc(x + 25.5, cabinY + 52.5, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 74.5, cabinY + 52.5, 20, 0, Math.PI * 2);
    ctx.fill();

    // Welcome mat
    ctx.fillStyle = '#8b0000';
    ctx.fillRect(x + 35, cabinY + 88, 30, 8);

    // "CABIN" sign
    ctx.fillStyle = '#5d3a1a';
    ctx.fillRect(x + 30, cabinY + 20, 40, 12);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 9px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('CABIN', x + 50, cabinY + 29);
  }
}

function draw() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background gradient based on level
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  if (currentLevel === 1) {
    // Sky gradient
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.7, '#b0e0e6');
  } else if (currentLevel === 2) {
    // Underwater gradient
    gradient.addColorStop(0, '#0a4a6e');
    gradient.addColorStop(0.5, '#0d5c7a');
    gradient.addColorStop(1, '#1a3a5c');
  } else {
    // Smokey Mountain sky gradient
    gradient.addColorStop(0, '#5d8aa8');
    gradient.addColorStop(0.4, '#87CEEB');
    gradient.addColorStop(0.7, '#b8d4e8');
    gradient.addColorStop(1, '#c9dfc9');
  }
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Mountain background (Level 3)
  if (currentLevel === 3) {
    // Distant misty mountains
    ctx.fillStyle = '#7a9eb8';
    ctx.beginPath();
    ctx.moveTo(0, 250);
    ctx.lineTo(150, 120);
    ctx.lineTo(300, 200);
    ctx.lineTo(450, 100);
    ctx.lineTo(600, 180);
    ctx.lineTo(750, 90);
    ctx.lineTo(900, 170);
    ctx.lineTo(canvas.width, 130);
    ctx.lineTo(canvas.width, 400);
    ctx.lineTo(0, 400);
    ctx.closePath();
    ctx.fill();

    // Mid mountains
    ctx.fillStyle = '#5a7a5a';
    ctx.beginPath();
    ctx.moveTo(0, 280);
    ctx.lineTo(200, 180);
    ctx.lineTo(350, 240);
    ctx.lineTo(500, 160);
    ctx.lineTo(700, 220);
    ctx.lineTo(canvas.width, 190);
    ctx.lineTo(canvas.width, 400);
    ctx.lineTo(0, 400);
    ctx.closePath();
    ctx.fill();

    // Smokey mist effect
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = `rgba(200, 210, 220, ${0.15 - i * 0.04})`;
      ctx.beginPath();
      ctx.ellipse(200 + i * 250, 200 + i * 20, 200, 40 + i * 10, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Underwater light rays (Level 2)
  if (currentLevel === 2) {
    ctx.save();
    for (let i = 0; i < 5; i++) {
      const rayX = 100 + i * 180;
      ctx.fillStyle = 'rgba(100, 200, 255, 0.1)';
      ctx.beginPath();
      ctx.moveTo(rayX, 0);
      ctx.lineTo(rayX + 60, 0);
      ctx.lineTo(rayX + 100, canvas.height);
      ctx.lineTo(rayX - 40, canvas.height);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  // Save context and apply camera transform
  ctx.save();
  ctx.translate(-camera.x, 0);

  // Clouds (parallax - move slower)
  clouds.forEach(cloud => drawCloud(cloud.x - camera.x * 0.3 + camera.x, cloud.y, cloud.size));

  // Platforms
  platforms.forEach(platform => {
    if (platform.isFloor) {
      if (currentLevel === 1) {
        // LAVA FLOOR!
        ctx.fillStyle = '#ff4500';
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);

        // Lava bubbles and glow
        ctx.fillStyle = '#ff6600';
        for (let i = 0; i < platform.width; i += 40) {
          const bubbleY = platform.y + 10 + Math.sin(Date.now() / 200 + i) * 5;
          ctx.beginPath();
          ctx.arc(platform.x + i + 20, bubbleY, 8 + Math.sin(Date.now() / 150 + i) * 3, 0, Math.PI * 2);
          ctx.fill();
        }

        // Hot orange/yellow streaks
        ctx.fillStyle = '#ffcc00';
        for (let i = 0; i < platform.width; i += 60) {
          const streakWidth = 20 + Math.sin(Date.now() / 300 + i) * 10;
          ctx.fillRect(platform.x + i + 10, platform.y + 2, streakWidth, 4);
        }

        // Glow effect on top
        const gradient = ctx.createLinearGradient(0, platform.y - 20, 0, platform.y);
        gradient.addColorStop(0, 'rgba(255, 100, 0, 0)');
        gradient.addColorStop(1, 'rgba(255, 100, 0, 0.4)');
        ctx.fillStyle = gradient;
        ctx.fillRect(platform.x, platform.y - 20, platform.width, 20);
      } else if (currentLevel === 2) {
        // OCEAN FLOOR (Level 2)
        ctx.fillStyle = '#1a3a5c';
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);

        // Sandy bottom
        ctx.fillStyle = '#c2b280';
        ctx.fillRect(platform.x, platform.y, platform.width, 8);

        // Seaweed
        for (let i = 0; i < platform.width; i += 80) {
          const seaweedHeight = 20 + Math.sin(Date.now() / 500 + i) * 5;
          ctx.fillStyle = '#228B22';
          ctx.beginPath();
          ctx.moveTo(platform.x + i + 30, platform.y);
          ctx.quadraticCurveTo(
            platform.x + i + 35 + Math.sin(Date.now() / 300 + i) * 5,
            platform.y - seaweedHeight / 2,
            platform.x + i + 30,
            platform.y - seaweedHeight
          );
          ctx.quadraticCurveTo(
            platform.x + i + 25 + Math.sin(Date.now() / 300 + i) * 5,
            platform.y - seaweedHeight / 2,
            platform.x + i + 30,
            platform.y
          );
          ctx.fill();
        }
      } else if (currentLevel === 3) {
        // MOUNTAIN TRAIL (Level 3)
        // Dirt path
        ctx.fillStyle = '#8B7355';
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);

        // Trail texture - dirt and gravel
        ctx.fillStyle = '#6B5344';
        for (let i = 0; i < platform.width; i += 30) {
          ctx.beginPath();
          ctx.arc(platform.x + i + Math.random() * 20, platform.y + 5 + Math.random() * 5, 3 + Math.random() * 2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Grass along edges
        ctx.fillStyle = '#228B22';
        for (let i = 0; i < platform.width; i += 15) {
          // Top grass
          const grassHeight = 8 + Math.sin(i * 0.5) * 3;
          ctx.beginPath();
          ctx.moveTo(platform.x + i, platform.y);
          ctx.lineTo(platform.x + i + 3, platform.y - grassHeight);
          ctx.lineTo(platform.x + i + 6, platform.y);
          ctx.fill();
        }

        // Small rocks
        ctx.fillStyle = '#696969';
        for (let i = 0; i < platform.width; i += 100) {
          ctx.beginPath();
          ctx.ellipse(platform.x + i + 50, platform.y + 3, 8, 5, 0.2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Trail markers (small wooden posts)
        for (let i = 200; i < platform.width; i += 400) {
          ctx.fillStyle = '#5d3a1a';
          ctx.fillRect(platform.x + i, platform.y - 20, 6, 20);
          ctx.fillStyle = '#ff6b6b';
          ctx.fillRect(platform.x + i - 2, platform.y - 25, 10, 8);
        }
      }
    } else {
      if (currentLevel === 1) {
        // Floating COUCH!
        const couchColor = '#6b4c9a';

        ctx.fillStyle = couchColor;
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);

        ctx.fillStyle = '#5a3d89';
        ctx.fillRect(platform.x, platform.y - 12, platform.width, 14);

        ctx.fillStyle = '#7d5cb0';
        ctx.fillRect(platform.x - 8, platform.y - 8, 12, platform.height + 8);
        ctx.fillRect(platform.x + platform.width - 4, platform.y - 8, 12, platform.height + 8);

        ctx.strokeStyle = '#4a3570';
        ctx.lineWidth = 2;
        const cushionWidth = platform.width / 3;
        ctx.beginPath();
        ctx.moveTo(platform.x + cushionWidth, platform.y + 2);
        ctx.lineTo(platform.x + cushionWidth, platform.y + platform.height - 2);
        ctx.moveTo(platform.x + cushionWidth * 2, platform.y + 2);
        ctx.lineTo(platform.x + cushionWidth * 2, platform.y + platform.height - 2);
        ctx.stroke();

        ctx.fillStyle = '#3d2a54';
        ctx.fillRect(platform.x + 5, platform.y + platform.height, 6, 8);
        ctx.fillRect(platform.x + platform.width - 11, platform.y + platform.height, 6, 8);
      } else if (currentLevel === 2) {
        // ICE BLOCK (Level 2)
        // Main ice block
        ctx.fillStyle = '#a8d8ea';
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);

        // Ice shine
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fillRect(platform.x + 5, platform.y + 3, platform.width * 0.3, 4);

        // Ice cracks
        ctx.strokeStyle = '#7ec8e3';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(platform.x + platform.width * 0.4, platform.y);
        ctx.lineTo(platform.x + platform.width * 0.5, platform.y + platform.height);
        ctx.moveTo(platform.x + platform.width * 0.7, platform.y + 5);
        ctx.lineTo(platform.x + platform.width * 0.6, platform.y + platform.height - 5);
        ctx.stroke();

        // Icicles hanging below
        ctx.fillStyle = '#c5e8f7';
        for (let i = 0; i < 3; i++) {
          const icicleX = platform.x + 15 + i * (platform.width / 3);
          const icicleHeight = 8 + Math.sin(i * 2) * 3;
          ctx.beginPath();
          ctx.moveTo(icicleX - 4, platform.y + platform.height);
          ctx.lineTo(icicleX, platform.y + platform.height + icicleHeight);
          ctx.lineTo(icicleX + 4, platform.y + platform.height);
          ctx.closePath();
          ctx.fill();
        }
      } else if (currentLevel === 3 && platform.isTree) {
        // BOUNCY TREE (Level 3)
        const bounceY = platform.bounceOffset || 0;
        const treeX = platform.x + platform.width / 2;
        const treeY = platform.y + bounceY;

        // Tree trunk
        ctx.fillStyle = '#5d3a1a';
        ctx.fillRect(treeX - 12, treeY, 24, 60);

        // Trunk texture
        ctx.strokeStyle = '#4a2d14';
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(treeX - 8, treeY + 10 + i * 18);
          ctx.quadraticCurveTo(treeX, treeY + 15 + i * 18, treeX + 8, treeY + 10 + i * 18);
          ctx.stroke();
        }

        // Leafy canopy (multiple layers for fullness)
        const leafColors = ['#1a5c1a', '#228B22', '#2d8c2d', '#3ca03c'];
        for (let layer = 0; layer < 3; layer++) {
          ctx.fillStyle = leafColors[layer];
          const layerY = treeY - 20 - layer * 25;
          const layerSize = 35 - layer * 5;

          ctx.beginPath();
          ctx.moveTo(treeX, layerY - layerSize);
          ctx.lineTo(treeX - layerSize - 10, layerY + 10);
          ctx.lineTo(treeX + layerSize + 10, layerY + 10);
          ctx.closePath();
          ctx.fill();
        }

        // Platform (the bouncy branch area)
        ctx.fillStyle = '#228B22';
        ctx.beginPath();
        ctx.ellipse(treeX, treeY + 5, platform.width / 2 + 10, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        // Leaves detail on platform
        ctx.fillStyle = '#2d8c2d';
        for (let i = 0; i < 5; i++) {
          const leafX = platform.x + 10 + i * (platform.width / 5);
          ctx.beginPath();
          ctx.ellipse(leafX, treeY + 2 + Math.sin(i) * 3, 8, 5, i * 0.3, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (currentLevel === 3) {
        // Simple platform for level 3 (shouldn't happen, but fallback)
        ctx.fillStyle = '#228B22';
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
      }
    }
  });

  // Penguins (Level 2 only)
  if (currentLevel === 2) {
    penguins.forEach(penguin => {
      drawPenguin(penguin);
    });
  }

  // Stars
  stars.forEach(star => {
    if (!star.collected) {
      drawStar(star.x, star.y);
    }
  });

  // Flying powerups
  flyingPowerups.forEach(powerup => {
    if (!powerup.collected) {
      drawFlyingPowerup(powerup.x, powerup.y);
    }
  });

  // Greyhounds
  greyhounds.forEach(dog => drawGreyhound(dog));

  // Bears (Level 3)
  bears.forEach(bear => drawBear(bear));

  // Pipes with snakes
  pipes.forEach(pipe => drawPipe(pipe));

  // Blanket Fort (goal)
  drawBlanketFort();

  // Emu (behind JimJam)
  drawEmu();

  // JimJam
  drawJimJam();

  // Restore context (end camera transform)
  ctx.restore();

  // Win message
  if (gameState === 'won') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('You Win!', canvas.width / 2, canvas.height / 2 - 20);

    ctx.fillStyle = '#fff';
    ctx.font = '24px Arial';
    ctx.fillText(`JimJam & Emu collected ${coins} stars!`, canvas.width / 2, canvas.height / 2 + 20);
    ctx.fillText('Fort, ocean, and mountains conquered!', canvas.width / 2, canvas.height / 2 + 55);
  }

  // Level complete message
  if (gameState === 'levelComplete') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#4ade80';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Level Complete!', canvas.width / 2, canvas.height / 2 - 20);

    ctx.fillStyle = '#fff';
    ctx.font = '24px Arial';
    ctx.fillText('Time to dive underwater!', canvas.width / 2, canvas.height / 2 + 20);
  }
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();
