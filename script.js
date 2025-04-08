const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');
const shareButton = document.getElementById('shareButton');
const resumeButton = document.getElementById('resumeButton');
const quitButton = document.getElementById('quitButton');
const settingsButton = document.getElementById('settingsButton');
const settingsMenu = document.getElementById('settingsMenu');
const musicToggle = document.getElementById('musicToggle');
const soundToggle = document.getElementById('soundToggle');
const themeSelect = document.getElementById('themeSelect');
const scoreElement = document.getElementById('scoreValue');
const highScoreElement = document.getElementById('highScoreValue');
const finalScoreElement = document.getElementById('finalScore');
const highScoreMessage = document.getElementById('highScoreMessage');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const pauseScreen = document.getElementById('pauseScreen');
const flapSound = document.getElementById('flapSound');
const scoreSound = document.getElementById('scoreSound');
const gameOverSound = document.getElementById('gameOverSound');
const powerupSound = document.getElementById('powerupSound');
const backgroundMusic = document.getElementById('backgroundMusic');

// Set canvas size
function resizeCanvas() {
    const maxWidth = Math.min(400, window.innerWidth - 40);
    const maxHeight = Math.min(600, window.innerHeight - 40);
    const ratio = maxHeight / maxWidth;
    
    canvas.width = maxWidth;
    canvas.height = maxWidth * ratio;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Game constants
const GRAVITY = 0.5;
const FLAP_SPEED = -8;
const PIPE_SPEED = 2;
const PIPE_SPACING = 150;
const PIPE_WIDTH = 80;
const PIPE_GAP = 180;
const PIPE_FREQUENCY = 1500; // ms

// Game state
let gameStarted = false;
let gameOver = false;
let gamePaused = false;
let score = 0;
let highScore = localStorage.getItem('flappyHighScore') || 0;
let animationFrameId;
let lastPipeTime = 0;
let birdFlapAngle = 0;
let isFlapping = false;
let currentTheme = 'day';
let soundEnabled = true;
let musicEnabled = true;

// Powerup state
let activePowerups = [];
let powerupChance = 0.1; // 10% chance per pipe

highScoreElement.textContent = highScore;

const bird = {
    x: 50,
    y: canvas.height / 2,
    velocity: 0,
    width: 34,
    height: 24,
    color: '#FFD700',
    wingAngle: 0,
    invincible: false
};

let pipes = [];
let clouds = [];
let stars = [];
let powerups = [];

// Powerup types
const POWERUP_TYPES = [
    {
        type: 'invincibility',
        icon: '🛡️',
        color: '#3498db',
        duration: 5000,
        effect: () => {
            bird.invincible = true;
            bird.color = '#3498db';
            setTimeout(() => {
                bird.invincible = false;
                bird.color = '#FFD700';
            }, 5000);
        }
    },
    {
        type: 'slowMotion',
        icon: '🐌',
        color: '#9b59b6',
        duration: 5000,
        effect: () => {
            const originalSpeed = PIPE_SPEED;
            pipes.forEach(pipe => pipe.speedModifier = 0.5);
            setTimeout(() => {
                pipes.forEach(pipe => pipe.speedModifier = 1);
            }, 5000);
        }
    },
    {
        type: 'doublePoints',
        icon: '✖️2',
        color: '#e67e22',
        duration: 10000,
        effect: () => {
            activePowerups.push({
                type: 'doublePoints',
                endTime: Date.now() + 10000
            });
            setTimeout(() => {
                activePowerups = activePowerups.filter(p => p.type !== 'doublePoints');
            }, 10000);
        }
    }
];

// Initialize game
function init() {
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    bird.wingAngle = 0;
    bird.invincible = false;
    bird.color = '#FFD700';
    pipes = [];
    powerups = [];
    activePowerups = [];
    score = 0;
    scoreElement.textContent = score;
    gameOver = false;
    gameStarted = false;
    gamePaused = false;
    lastPipeTime = 0;
    
    // Create initial clouds
    clouds = [];
    for (let i = 0; i < 5; i++) {
        clouds.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height * 0.3,
            width: 60 + Math.random() * 40,
            speed: 0.2 + Math.random() * 0.5
        });
    }
    
    // Create stars for night mode
    stars = [];
    for (let i = 0; i < 30; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height * 0.3,
            size: Math.random() * 2 + 1,
            opacity: Math.random() * 0.8 + 0.2
        });
    }
}

// Create new pipe
function createPipe() {
    const minGapY = 50;
    const maxGapY = canvas.height - PIPE_GAP - minGapY;
    const gapY = Math.random() * (maxGapY - minGapY) + minGapY;
    
    pipes.push({
        x: canvas.width,
        gapY: gapY,
        passed: false,
        width: PIPE_WIDTH,
        color: '#27ae60',
        topHeight: gapY,
        bottomY: gapY + PIPE_GAP,
        speedModifier: 1
    });
    
    // Randomly create powerup
    if (Math.random() < powerupChance) {
        const powerupType = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
        
        powerups.push({
            x: canvas.width + PIPE_WIDTH / 2,
            y: gapY + PIPE_GAP / 2,
            type: powerupType.type,
            icon: powerupType.icon,
            color: powerupType.color,
            width: 30,
            height: 30,
            collected: false,
            effect: powerupType.effect
        });
    }
}

// Draw bird with animation
function drawBird() {
    // Body
    ctx.save();
    ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
    ctx.rotate(bird.velocity * 0.05);
    
    // Body
    ctx.fillStyle = bird.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, bird.width / 2, bird.height / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Beak
    ctx.fillStyle = '#FFA500';
    ctx.beginPath();
    ctx.moveTo(bird.width / 2, 0);
    ctx.lineTo(bird.width / 2 + 10, -5);
    ctx.lineTo(bird.width / 2 + 10, 5);
    ctx.closePath();
    ctx.fill();
    
    // Eye
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(bird.width / 4, -bird.height / 6, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Wing
    ctx.fillStyle = '#FFC600';
    ctx.beginPath();
    const wingAngle = isFlapping ? Math.sin(Date.now() * 0.02) * 0.5 : 0;
    ctx.ellipse(-bird.width / 4, 0, bird.width / 3, bird.height / 3, wingAngle, 0, Math.PI * 2);
    ctx.fill();
    
    // Invincibility effect
    if (bird.invincible) {
        ctx.strokeStyle = 'rgba(52, 152, 219, 0.5)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, bird.width * 0.7, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    ctx.restore();
}

// Draw pipes with better design
function drawPipes() {
    pipes.forEach(pipe => {
        // Pipe color
        const pipeColor = ctx.createLinearGradient(pipe.x, 0, pipe.x + pipe.width, 0);
        pipeColor.addColorStop(0, '#2ecc71');
        pipeColor.addColorStop(1, '#27ae60');
        
        // Upper pipe
        ctx.fillStyle = pipeColor;
        ctx.fillRect(pipe.x, 0, pipe.width, pipe.topHeight);
        
        // Upper pipe cap
        ctx.fillStyle = '#16a085';
        ctx.fillRect(pipe.x - 5, pipe.topHeight - 20, pipe.width + 10, 20);
        
        // Lower pipe
        ctx.fillStyle = pipeColor;
        ctx.fillRect(pipe.x, pipe.bottomY, pipe.width, canvas.height - pipe.bottomY);
        
        // Lower pipe cap
        ctx.fillStyle = '#16a085';
        ctx.fillRect(pipe.x - 5, pipe.bottomY, pipe.width + 10, 20);
    });
}

// Draw powerups
function drawPowerups() {
    powerups.forEach(powerup => {
        if (powerup.collected) return;
        
        ctx.save();
        ctx.fillStyle = powerup.color;
        ctx.beginPath();
        ctx.arc(powerup.x, powerup.y, powerup.width / 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'white';
        ctx.font = '18px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(powerup.icon, powerup.x, powerup.y);
        
        ctx.restore();
    });
}

// Draw background elements
function drawBackground() {
    // Sky gradient based on theme
    let skyGradient;
    
    if (currentTheme === 'day') {
        skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        skyGradient.addColorStop(0, '#87CEEB');
        skyGradient.addColorStop(1, '#E0F6FF');
    } else if (currentTheme === 'night') {
        skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        skyGradient.addColorStop(0, '#1a1a2e');
        skyGradient.addColorStop(1, '#16213e');
    } else if (currentTheme === 'retro') {
        skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        skyGradient.addColorStop(0, '#4a4a4a');
        skyGradient.addColorStop(1, '#858585');
    }
    
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw stars (for night mode)
    if (currentTheme === 'night') {
        ctx.fillStyle = 'white';
        stars.forEach(star => {
            ctx.globalAlpha = star.opacity;
            ctx.fillRect(star.x, star.y, star.size, star.size);
        });
        ctx.globalAlpha = 1;
    }
    
    // Draw clouds
    ctx.fillStyle = currentTheme === 'retro' ? 'rgba(200, 200, 200, 0.8)' : 'rgba(255, 255, 255, 0.8)';
    clouds.forEach(cloud => {
        if (currentTheme !== 'night') {
            ctx.beginPath();
            ctx.arc(cloud.x, cloud.y, cloud.width * 0.3, 0, Math.PI * 2);
            ctx.arc(cloud.x + cloud.width * 0.3, cloud.y - cloud.width * 0.1, cloud.width * 0.25, 0, Math.PI * 2);
            ctx.arc(cloud.x + cloud.width * 0.6, cloud.y, cloud.width * 0.3, 0, Math.PI * 2);
            ctx.arc(cloud.x + cloud.width * 0.4, cloud.y + cloud.width * 0.1, cloud.width * 0.2, 0, Math.PI * 2);
            ctx.fill();
        }
    });
    
    // Ground
    let groundColor = '#8B4513';
    let groundTopColor = '#5D2906';
    
    if (currentTheme === 'night') {
        groundColor = '#2c3e50';
        groundTopColor = '#1a202c';
    } else if (currentTheme === 'retro') {
        groundColor = '#6a6a6a';
        groundTopColor = '#4a4a4a';
    }
    
    ctx.fillStyle = groundColor;
    ctx.fillRect(0, canvas.height - 20, canvas.width, 20);
    ctx.fillStyle = groundTopColor;
    ctx.fillRect(0, canvas.height - 5, canvas.width, 5);
}

// Check collision
function checkCollision(pipe) {
    if (bird.invincible) return false;
    
    // Create a slightly smaller hitbox than the visual bird
    // This gives a more forgiving collision that matches the visual appearance better
    const collisionMargin = 5;
    const birdRight = bird.x + (bird.width / 2) - collisionMargin;
    const birdLeft = bird.x - (bird.width / 2) + collisionMargin;
    const birdTop = bird.y - (bird.height / 2) + collisionMargin;
    const birdBottom = bird.y + (bird.height / 2) - collisionMargin;
    
    const pipeRight = pipe.x + pipe.width;
    const pipeLeft = pipe.x;
    
    // Check if bird is within pipe's x-range
    if (birdRight > pipeLeft && birdLeft < pipeRight) {
        // Check if bird is above top pipe or below bottom pipe
        if (birdTop < pipe.topHeight || birdBottom > pipe.bottomY) {
            return true;
        }
    }
    
    // Additional check for very fast movements
    // If the bird moved significantly since last frame, do an extra collision check
    if (Math.abs(bird.velocity) > 8) {
        // Check a point along the bird's path
        const midX = bird.x - (bird.velocity * 0.5);
        const midY = bird.y - (bird.velocity * 0.5);
        
        const midRight = midX + (bird.width / 2) - collisionMargin;
        const midLeft = midX - (bird.width / 2) + collisionMargin;
        const midTop = midY - (bird.height / 2) + collisionMargin;
        const midBottom = midY + (bird.height / 2) - collisionMargin;
        
        if (midRight > pipeLeft && midLeft < pipeRight) {
            if (midTop < pipe.topHeight || midBottom > pipe.bottomY) {
                return true;
            }
        }
    }
    
    return false;
}

// Check powerup collection
function checkPowerupCollection(powerup) {
    if (powerup.collected) return false;
    
    const birdRight = bird.x + bird.width / 2;
    const birdLeft = bird.x - bird.width / 2;
    const birdTop = bird.y - bird.height / 2;
    const birdBottom = bird.y + bird.height / 2;
    
    const powerupRight = powerup.x + powerup.width / 2;
    const powerupLeft = powerup.x - powerup.width / 2;
    const powerupTop = powerup.y - powerup.height / 2;
    const powerupBottom = powerup.y + powerup.height / 2;
    
    // Check collision
    if (birdRight > powerupLeft && 
        birdLeft < powerupRight && 
        birdBottom > powerupTop && 
        birdTop < powerupBottom) {
        return true;
    }
    
    return false;
}

// Animate powerups
function animatePowerups() {
    powerups.forEach(powerup => {
        if (!powerup.collected) {
            // Add floating animation
            powerup.y += Math.sin(Date.now() * 0.003) * 0.5;
        }
    });
}

// Update game objects
function update() {
    // Update bird
    bird.velocity += GRAVITY;
    bird.y += bird.velocity;
    
    // Update clouds
    clouds.forEach(cloud => {
        cloud.x -= cloud.speed;
        if (cloud.x + cloud.width < 0) {
            cloud.x = canvas.width + cloud.width;
            cloud.y = Math.random() * canvas.height * 0.3;
        }
    });
    
    // Create new pipes
    const currentTime = Date.now();
    if (currentTime - lastPipeTime > PIPE_FREQUENCY && gameStarted && !gameOver) {
        createPipe();
        lastPipeTime = currentTime;
    }
    
    // Update pipes
    pipes.forEach((pipe, index) => {
        pipe.x -= PIPE_SPEED * pipe.speedModifier;
        
        // Check collision
        if (checkCollision(pipe)) {
            endGame();
        }
        
        // Update score
        if (!pipe.passed && pipe.x + pipe.width < bird.x) {
            pipe.passed = true;
            
            // Check for double points powerup
            let pointsMultiplier = 1;
            if (activePowerups.find(p => p.type === 'doublePoints')) {
                pointsMultiplier = 2;
            }
            
            score += (1 * pointsMultiplier);
            scoreElement.textContent = score;
            
            if (soundEnabled) {
                scoreSound.currentTime = 0;
                scoreSound.play();
            }
        }
        
        // Remove off-screen pipes
        if (pipe.x + pipe.width < 0) {
            pipes.splice(index, 1);
        }
    });
    
    // Update powerups
    powerups.forEach((powerup, index) => {
        powerup.x -= PIPE_SPEED;
        
        // Check collection
        if (checkPowerupCollection(powerup)) {
            powerup.collected = true;
            powerup.effect();
            
            if (soundEnabled) {
                powerupSound.currentTime = 0;
                powerupSound.play();
            }
            
            // Remove collected powerup
            powerups.splice(index, 1);
        }
        
        // Remove off-screen powerups
        if (powerup.x + powerup.width < 0) {
            powerups.splice(index, 1);
        }
    });
    
    // Check if bird is off screen
    if (bird.y + bird.height / 2 > canvas.height - 20 || bird.y - bird.height / 2 < 0) {
        endGame();
    }
}

// Draw everything
function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    drawBackground();
    
    // Draw pipes
    drawPipes();
    
    // Draw powerups
    drawPowerups();
    
    // Draw bird
    drawBird();
    
    // Draw active powerups indicator
    if (activePowerups.length > 0) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(10, 80, 120, 30 * activePowerups.length);
        
        activePowerups.forEach((powerup, index) => {
            const remainingTime = Math.max(0, (powerup.endTime - Date.now()) / 1000).toFixed(1);
            const powerupInfo = POWERUP_TYPES.find(p => p.type === powerup.type);
            
            ctx.fillStyle = 'white';
            ctx.font = '16px Arial';
            ctx.fillText(`${powerupInfo.icon} ${remainingTime}s`, 20, 100 + (index * 30));
        });
    }
}

// Game loop
function gameLoop() {
    if (!gameStarted || gameOver || gamePaused) return;
    
    update();
    animatePowerups();
    draw();
    
    animationFrameId = requestAnimationFrame(gameLoop);
}

// Start game
function startGame() {
    init();
    gameStarted = true;
    gameOver = false;
    gamePaused = false;
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    pauseScreen.classList.add('hidden');
    lastPipeTime = Date.now();
    
    if (musicEnabled) {
        backgroundMusic.currentTime = 0;
        backgroundMusic.play();
    }
    
    gameLoop();
}

// End game
function endGame() {
    gameOver = true;
    
    if (soundEnabled) {
        gameOverSound.play();
    }
    
    backgroundMusic.pause();
    
    // Update high score
    if (score > highScore) {
        highScore = score;
        highScoreElement.textContent = highScore;
        localStorage.setItem('flappyHighScore', highScore);
        highScoreMessage.textContent = "New High Score!";
    } else {
        highScoreMessage.textContent = "";
    }
    
    finalScoreElement.textContent = score;
    gameOverScreen.classList.remove('hidden');
    cancelAnimationFrame(animationFrameId);
}

// Pause game
function pauseGame() {
    if (!gameStarted || gameOver) return;
    
    gamePaused = true;
    pauseScreen.classList.remove('hidden');
    backgroundMusic.pause();
    cancelAnimationFrame(animationFrameId);
}

// Resume game
function resumeGame() {
    gamePaused = false;
    pauseScreen.classList.add('hidden');
    
    if (musicEnabled) {
        backgroundMusic.play();
    }
    
    gameLoop();
}

// Quit game
function quitGame() {
    gamePaused = false;
    gameStarted = false;
    pauseScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
    backgroundMusic.pause();
}

// Flap action
function flap() {
    if (!gameStarted || gameOver || gamePaused) return;
    
    bird.velocity = FLAP_SPEED;
    isFlapping = true;
    
    if (soundEnabled) {
        flapSound.currentTime = 0;
        flapSound.play();
    }
    
    setTimeout(() => {
        isFlapping = false;
    }, 200);
}

// Share score
function shareScore() {
    if (navigator.share) {
        navigator.share({
            title: 'Flappy Bird Enhanced',
            text: `I scored ${score} points in Flappy Bird Enhanced! Can you beat my score?`
        }).catch(console.error);
    } else {
        alert(`I scored ${score} points in Flappy Bird Enhanced!`);
    }
}

// Toggle settings menu
function toggleSettings() {
    settingsMenu.classList.toggle('hidden');
}

// Load preferences from localStorage if available
function loadPreferences() {
    if (localStorage.getItem('flappyTheme')) {
        currentTheme = localStorage.getItem('flappyTheme');
        themeSelect.value = currentTheme;
    }
    
    if (localStorage.getItem('flappyMusic') !== null) {
        musicEnabled = localStorage.getItem('flappyMusic') === 'true';
        musicToggle.checked = musicEnabled;
    }
    
    if (localStorage.getItem('flappySound') !== null) {
        soundEnabled = localStorage.getItem('flappySound') === 'true';
        soundToggle.checked = soundEnabled;
    }
}

// Save preferences to localStorage
function savePreferences() {
    localStorage.setItem('flappyTheme', currentTheme);
    localStorage.setItem('flappyMusic', musicEnabled.toString());
    localStorage.setItem('flappySound', soundEnabled.toString());
}

// Update theme
function updateTheme() {
    currentTheme = themeSelect.value;
    savePreferences();
}

// Toggle music
function toggleMusic() {
    musicEnabled = musicToggle.checked;
    
    if (musicEnabled && gameStarted && !gameOver && !gamePaused) {
        backgroundMusic.play();
    } else {
        backgroundMusic.pause();
    }
    
    savePreferences();
}

// Toggle sound effects
function toggleSound() {
    soundEnabled = soundToggle.checked;
    savePreferences();
}

// Event listeners
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);
shareButton.addEventListener('click', shareScore);
resumeButton.addEventListener('click', resumeGame);
quitButton.addEventListener('click', quitGame);
settingsButton.addEventListener('click', toggleSettings);
themeSelect.addEventListener('change', updateTheme);
musicToggle.addEventListener('change', toggleMusic);
soundToggle.addEventListener('change', toggleSound);

document.addEventListener('keydown', (e) => {
    if ((e.code === 'Space' || e.key === 'ArrowUp') && gameStarted && !gameOver && !gamePaused) {
        flap();
        e.preventDefault();
    } else if (e.code === 'Space' && !gameStarted) {
        startGame();
        e.preventDefault();
    } else if (e.code === 'Escape' && gameStarted && !gameOver) {
        if (gamePaused) {
            resumeGame();
        } else {
            pauseGame();
        }
        e.preventDefault();
    }
});

canvas.addEventListener('click', () => {
    if (gameStarted && !gameOver && !gamePaused) {
        flap();
    } else if (!gameStarted) {
        startGame();
    }
});

// Touch support for mobile
canvas.addEventListener('touchstart', (e) => {
    if (gameStarted && !gameOver && !gamePaused) {
        flap();
    } else if (!gameStarted) {
        startGame();
    }
    e.preventDefault();
});

// Handle visibility change to pause game when tab/window not active
document.addEventListener('visibilitychange', () => {
    if (document.hidden && gameStarted && !gameOver && !gamePaused) {
        pauseGame();
    }
});

// Initialize game
init();

// Load preferences on startup
loadPreferences();