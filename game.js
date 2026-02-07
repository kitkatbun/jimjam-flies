const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const coinsDisplay = document.getElementById('coins');
const statusDisplay = document.getElementById('status');
const restartBtn = document.getElementById('restart');

// Game state
let gameState = 'playing'; // 'playing', 'won'
let coins = 0;

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

// Platforms - extended level (2200 pixels wide)
const LEVEL_WIDTH = 2200;
const platforms = [
  // Lava floor (extends across whole level)
  { x: 0, y: 350, width: LEVEL_WIDTH, height: 50, color: '#ff4500', isLava: true },
  // Floating couches spread across the level
  { x: 150, y: 280, width: 100, height: 20, color: '#6b4c9a' },
  { x: 350, y: 220, width: 120, height: 20, color: '#6b4c9a' },
  { x: 550, y: 260, width: 100, height: 20, color: '#6b4c9a' },
  { x: 750, y: 200, width: 130, height: 20, color: '#6b4c9a' },
  { x: 950, y: 250, width: 100, height: 20, color: '#6b4c9a' },
  { x: 1150, y: 190, width: 120, height: 20, color: '#6b4c9a' },
  { x: 1350, y: 240, width: 100, height: 20, color: '#6b4c9a' },
  { x: 1550, y: 180, width: 130, height: 20, color: '#6b4c9a' },
  { x: 1750, y: 220, width: 100, height: 20, color: '#6b4c9a' },
  { x: 1950, y: 280, width: 120, height: 20, color: '#6b4c9a' },
  // Final couch near flag
  { x: 2080, y: 320, width: 80, height: 30, color: '#6b4c9a' }
];

// Collectible stars - 5 spread across the level
let stars = [
  { x: 300, y: 250, collected: false },
  { x: 700, y: 180, collected: false },
  { x: 1100, y: 220, collected: false },
  { x: 1500, y: 100, collected: false },
  { x: 1900, y: 250, collected: false }
];

// Flag (goal) - at the end of the extended level
const flag = {
  x: 2100,
  y: 270,
  width: 10,
  height: 80
};

// Clouds for decoration - spread across the level
const clouds = [
  { x: 100, y: 50, size: 40 },
  { x: 300, y: 80, size: 50 },
  { x: 500, y: 40, size: 45 },
  { x: 750, y: 70, size: 35 },
  { x: 1000, y: 50, size: 45 },
  { x: 1250, y: 85, size: 40 },
  { x: 1500, y: 45, size: 50 },
  { x: 1750, y: 75, size: 38 },
  { x: 2000, y: 55, size: 42 }
];

// Flying powerups (wings!) - spread across the level
let flyingPowerups = [
  { x: 400, y: 180, collected: false },
  { x: 1200, y: 150, collected: false },
  { x: 1800, y: 180, collected: false }
];

// Greyhound enemies - spread across the longer level
let greyhounds = [
  { x: 250, y: 310, width: 50, height: 40, speed: 1.5, direction: 1, minX: 150, maxX: 450, alive: true, legPhase: 0 },
  { x: 700, y: 310, width: 50, height: 40, speed: 2, direction: -1, minX: 550, maxX: 850, alive: true, legPhase: 0 },
  { x: 1000, y: 310, width: 50, height: 40, speed: 1.8, direction: 1, minX: 900, maxX: 1200, alive: true, legPhase: 0 },
  { x: 1400, y: 310, width: 50, height: 40, speed: 2.2, direction: -1, minX: 1300, maxX: 1600, alive: true, legPhase: 0 },
  { x: 1800, y: 310, width: 50, height: 40, speed: 1.5, direction: 1, minX: 1700, maxX: 1950, alive: true, legPhase: 0 }
];

// Camera for scrolling
let camera = {
  x: 0
};

// Pipes with snakes (waitUntil tracks when snake can pop back up)
let pipes = [
  { x: 280, y: 300, width: 50, height: 50, snakeOut: 0, snakeDirection: 1, snakeSpeed: 0.03, waitUntil: 0 },
  { x: 600, y: 300, width: 50, height: 50, snakeOut: 0.5, snakeDirection: 1, snakeSpeed: 0.04, waitUntil: 0 },
  { x: 1000, y: 300, width: 50, height: 50, snakeOut: 0.3, snakeDirection: 1, snakeSpeed: 0.035, waitUntil: 0 },
  { x: 1450, y: 300, width: 50, height: 50, snakeOut: 0.7, snakeDirection: 1, snakeSpeed: 0.045, waitUntil: 0 },
  { x: 1850, y: 300, width: 50, height: 50, snakeOut: 0.2, snakeDirection: 1, snakeSpeed: 0.03, waitUntil: 0 }
];

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
  jimjam.x = 50;
  jimjam.y = 300;
  jimjam.velocityX = 0;
  jimjam.velocityY = 0;
  emu.x = 20;
  emu.y = 280;
  coins = 0;
  gameState = 'playing';
  stars.forEach(star => star.collected = false);
  greyhounds.forEach(dog => {
    dog.alive = true;
    dog.x = dog.minX + 50;
  });
  flyingPowerups.forEach(p => p.collected = false);
  camera.x = 0;
  jimjam.isFlying = false;
  jimjam.flyingTime = 0;
  statusDisplay.textContent = '';
  coinsDisplay.textContent = 'Stars: 0';
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
    if (jimjam.x < platform.x + platform.width &&
        jimjam.x + jimjam.width > platform.x &&
        jimjam.y + jimjam.height > platform.y &&
        jimjam.y + jimjam.height < platform.y + platform.height + jimjam.velocityY + 1 &&
        jimjam.velocityY >= 0) {
      jimjam.y = platform.y - jimjam.height;
      jimjam.velocityY = 0;
      jimjam.isOnGround = true;
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

  // Check win condition (reach the flag)
  if (jimjam.x + jimjam.width > flag.x) {
    gameState = 'won';
    statusDisplay.textContent = `Woohoo! JimJam collected ${coins} stars!`;
  }
}

function drawCloud(x, y, size) {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.beginPath();
  ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
  ctx.arc(x + size * 0.4, y - size * 0.1, size * 0.4, 0, Math.PI * 2);
  ctx.arc(x + size * 0.8, y, size * 0.5, 0, Math.PI * 2);
  ctx.arc(x + size * 0.4, y + size * 0.2, size * 0.35, 0, Math.PI * 2);
  ctx.fill();
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

  // Back blanket (draped over)
  ctx.fillStyle = '#6b4c9a'; // Purple blanket
  ctx.beginPath();
  ctx.moveTo(x, y + 100);
  ctx.lineTo(x + 10, y + 20);
  ctx.lineTo(x + 50, y);
  ctx.lineTo(x + 90, y + 20);
  ctx.lineTo(x + 100, y + 100);
  ctx.closePath();
  ctx.fill();

  // Blanket pattern - stars
  ctx.fillStyle = '#9d7cc7';
  for (let i = 0; i < 5; i++) {
    const sx = x + 20 + (i % 3) * 25;
    const sy = y + 30 + Math.floor(i / 3) * 30;
    ctx.beginPath();
    ctx.arc(sx, sy, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Fort opening (dark inside)
  ctx.fillStyle = '#1a1a2e';
  ctx.beginPath();
  ctx.moveTo(x + 25, y + 100);
  ctx.lineTo(x + 35, y + 45);
  ctx.lineTo(x + 65, y + 45);
  ctx.lineTo(x + 75, y + 100);
  ctx.closePath();
  ctx.fill();

  // Cozy glow from inside
  const glow = ctx.createRadialGradient(x + 50, y + 80, 5, x + 50, y + 80, 30);
  glow.addColorStop(0, 'rgba(255, 200, 100, 0.4)');
  glow.addColorStop(1, 'rgba(255, 200, 100, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(x + 25, y + 45, 50, 55);

  // Pillows at entrance
  ctx.fillStyle = '#ff6b6b'; // Red pillow
  ctx.beginPath();
  ctx.ellipse(x + 20, y + 95, 15, 10, -0.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#4ade80'; // Green pillow
  ctx.beginPath();
  ctx.ellipse(x + 80, y + 95, 12, 8, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Fairy lights on top!
  const colors = ['#ff6b6b', '#fbbf24', '#4ade80', '#60a5fa', '#f472b6'];
  for (let i = 0; i < 5; i++) {
    const lx = x + 15 + i * 18;
    const ly = y + 15 + Math.sin(i * 0.8) * 10;
    // Wire
    if (i < 4) {
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(lx, ly);
      ctx.lineTo(lx + 18, y + 15 + Math.sin((i + 1) * 0.8) * 10);
      ctx.stroke();
    }
    // Light bulb
    ctx.fillStyle = colors[i];
    ctx.beginPath();
    ctx.arc(lx, ly, 4 + Math.sin(Date.now() / 200 + i) * 1, 0, Math.PI * 2);
    ctx.fill();
    // Glow
    ctx.fillStyle = colors[i] + '40';
    ctx.beginPath();
    ctx.arc(lx, ly, 8, 0, Math.PI * 2);
    ctx.fill();
  }

  // "FORT" sign
  ctx.fillStyle = '#8B4513';
  ctx.fillRect(x + 35, y - 5, 30, 15);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 10px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('FORT', x + 50, y + 6);
}

function draw() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Sky gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#87CEEB');
  gradient.addColorStop(0.7, '#b0e0e6');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Save context and apply camera transform
  ctx.save();
  ctx.translate(-camera.x, 0);

  // Clouds (parallax - move slower)
  clouds.forEach(cloud => drawCloud(cloud.x - camera.x * 0.3 + camera.x, cloud.y, cloud.size));

  // Platforms
  platforms.forEach(platform => {
    if (platform.y === 350) {
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
    } else {
      // Floating COUCH!
      const couchColor = '#6b4c9a'; // Purple couch

      // Couch base/seat
      ctx.fillStyle = couchColor;
      ctx.fillRect(platform.x, platform.y, platform.width, platform.height);

      // Couch back
      ctx.fillStyle = '#5a3d89';
      ctx.fillRect(platform.x, platform.y - 12, platform.width, 14);

      // Armrests
      ctx.fillStyle = '#7d5cb0';
      ctx.fillRect(platform.x - 8, platform.y - 8, 12, platform.height + 8);
      ctx.fillRect(platform.x + platform.width - 4, platform.y - 8, 12, platform.height + 8);

      // Cushion lines
      ctx.strokeStyle = '#4a3570';
      ctx.lineWidth = 2;
      const cushionWidth = platform.width / 3;
      ctx.beginPath();
      ctx.moveTo(platform.x + cushionWidth, platform.y + 2);
      ctx.lineTo(platform.x + cushionWidth, platform.y + platform.height - 2);
      ctx.moveTo(platform.x + cushionWidth * 2, platform.y + 2);
      ctx.lineTo(platform.x + cushionWidth * 2, platform.y + platform.height - 2);
      ctx.stroke();

      // Couch legs
      ctx.fillStyle = '#3d2a54';
      ctx.fillRect(platform.x + 5, platform.y + platform.height, 6, 8);
      ctx.fillRect(platform.x + platform.width - 11, platform.y + platform.height, 6, 8);
    }
  });

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
    ctx.fillText('Blanket Fort!', canvas.width / 2, canvas.height / 2 - 20);

    ctx.fillStyle = '#fff';
    ctx.font = '24px Arial';
    ctx.fillText(`JimJam & Emu are cozy with ${coins} stars!`, canvas.width / 2, canvas.height / 2 + 20);
    ctx.fillText('Snacks, no wet noses, perfect fort! Play again?', canvas.width / 2, canvas.height / 2 + 55);
  }
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();
