const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');
const scoreElement = document.getElementById('scoreValue');
const highScoreElement = document.getElementById('highScoreValue');
const finalScoreElement = document.getElementById('finalScore');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const flapSound = document.getElementById('flapSound');
const scoreSound = document.getElementById('scoreSound');
const gameOverSound = document.getElementById('gameOverSound');

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
let score = 0;
let highScore = localStorage.getItem('flappyHighScore') || 0;
let animationFrameId;
let lastPipeTime = 0;
let birdFlapAngle = 0;
let isFlapping = false;

highScoreElement.textContent = highScore;

const bird = {
    x: 50,
    y: canvas.height / 2,
    velocity: 0,
    width: 34,
    height: 24,
    color: '#FFD700',
    wingAngle: 0
};

let pipes = [];
let clouds = [];
let stars = [];

// Initialize game
function init() {
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    bird.wingAngle = 0;
    pipes = [];
    score = 0;
    scoreElement.textContent = score;
    gameOver = false;
    gameStarted = false;
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
        bottomY: gapY + PIPE_GAP
    });
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

// Draw background elements
function drawBackground() {
    // Sky gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGradient.addColorStop(0, '#87CEEB');
    skyGradient.addColorStop(1, '#E0F6FF');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw stars (for night mode)
    ctx.fillStyle = 'white';
    stars.forEach(star => {
        ctx.globalAlpha = star.opacity;
        ctx.fillRect(star.x, star.y, star.size, star.size);
    });
    ctx.globalAlpha = 1;
    
    // Draw clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    clouds.forEach(cloud => {
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, cloud.width * 0.3, 0, Math.PI * 2);
        ctx.arc(cloud.x + cloud.width * 0.3, cloud.y - cloud.width * 0.1, cloud.width * 0.25, 0, Math.PI * 2);
        ctx.arc(cloud.x + cloud.width * 0.6, cloud.y, cloud.width * 0.3, 0, Math.PI * 2);
        ctx.arc(cloud.x + cloud.width * 0.4, cloud.y + cloud.width * 0.1, cloud.width * 0.2, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // Ground
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, canvas.height - 20, canvas.width, 20);
    ctx.fillStyle = '#5D2906';
    ctx.fillRect(0, canvas.height - 5, canvas.width, 5);
}

// Check collision
function checkCollision(pipe) {
    const birdRight = bird.x + bird.width;
    const birdBottom = bird.y + bird.height;
    const pipeRight = pipe.x + pipe.width;
    
    // Check if bird is within pipe's x-range
    if (birdRight > pipe.x && bird.x < pipeRight) {
        // Check if bird is above top pipe or below bottom pipe
        if (bird.y < pipe.topHeight || birdBottom > pipe.bottomY) {
            return true;
        }
    }
    
    return false;
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
        pipe.x -= PIPE_SPEED;
        
        // Check collision
        if (checkCollision(pipe)) {
            endGame();
        }
        
        // Update score
        if (!pipe.passed && pipe.x + pipe.width < bird.x) {
            pipe.passed = true;
            score++;
            scoreElement.textContent = score;
            scoreSound.currentTime = 0;
            scoreSound.play();
        }
        
        // Remove off-screen pipes
        if (pipe.x + pipe.width < 0) {
            pipes.splice(index, 1);
        }
    });
    
    // Check if bird is off screen
    if (bird.y + bird.height > canvas.height - 20 || bird.y < 0) {
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
    
    // Draw bird
    drawBird();
    
    // Draw score
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 120, 60);
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.fillText(`Score: ${score}`, 20, 40);
    ctx.fillText(`High: ${highScore}`, 20, 70);
}

// Game loop
function gameLoop() {
    if (!gameStarted || gameOver) return;
    
    update();
    draw();
    
    animationFrameId = requestAnimationFrame(gameLoop);
}

// Start game
function startGame() {
    init();
    gameStarted = true;
    gameOver = false;
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    lastPipeTime = Date.now();
    gameLoop();
}

// End game
function endGame() {
    gameOver = true;
    gameOverSound.play();
    
    // Update high score
    if (score > highScore) {
        highScore = score;
        highScoreElement.textContent = highScore;
        localStorage.setItem('flappyHighScore', highScore);
    }
    
    finalScoreElement.textContent = score;
    gameOverScreen.classList.remove('hidden');
    cancelAnimationFrame(animationFrameId);
}

// Flap action
function flap() {
    if (!gameStarted || gameOver) return;
    
    bird.velocity = FLAP_SPEED;
    isFlapping = true;
    flapSound.currentTime = 0;
    flapSound.play();
    
    setTimeout(() => {
        isFlapping = false;
    }, 200);
}

// Event listeners
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);

document.addEventListener('keydown', (e) => {
    if ((e.code === 'Space' || e.key === 'ArrowUp') && gameStarted && !gameOver) {
        flap();
        e.preventDefault();
    } else if (e.code === 'Space' && !gameStarted) {
        startGame();
    }
});

canvas.addEventListener('click', () => {
    if (gameStarted && !gameOver) {
        flap();
    } else if (!gameStarted) {
        startGame();
    }
});

// Touch support for mobile
canvas.addEventListener('touchstart', (e) => {
    if (gameStarted && !gameOver) {
        flap();
    } else if (!gameStarted) {
        startGame();
    }
    e.preventDefault();
});

// Initialize game
init();