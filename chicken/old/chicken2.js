// 1. Setup the Canvas
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.style.margin = '0';
document.body.style.overflow = 'hidden';
document.body.style.backgroundColor = '#87CEEB';

// 2. Define the State Enum and Cycle
const ChickenState = {
    IsStill: 'IsStill',
    IsWalking: 'IsWalking',
    IsLooking: 'IsLooking',
    IsEating: 'IsEating'
};

const stateCycle = [
    ChickenState.IsStill,
    ChickenState.IsWalking,
    ChickenState.IsLooking,
    ChickenState.IsEating
];

// 3. Game State & Variables
let isExploded = false;
let particles = [];

// 4. Feather Particle Class (from previous version)
class Feather {
    constructor(x, y) {
        this.x = x;
        this.y = y;

        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 15 + 5;

        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed - 10;

        this.gravity = 0.4;
        this.drag = 0.92;

        this.opacity = 1;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.3;

        this.width = Math.random() * 8 + 6;
        this.height = Math.random() * 20 + 15;
    }

    update() {
        this.vx *= this.drag;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.rotation += this.rotationSpeed;
        if (this.vy > 0) this.opacity -= 0.005;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = Math.max(0, this.opacity);

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(0, 0, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, -this.height / 2);
        ctx.lineTo(0, this.height / 2);
        ctx.stroke();

        ctx.restore();
    }
}

// 5. Animated Chicken Class
class AnimatedChicken {
    constructor() {
        this.size = 150;
        this.scale = this.size / 100; // Base vector coordinate system is 100x100
        this.x = canvas.width / 2 - this.size / 2;
        this.y = canvas.height / 2 - this.size / 2;

        this.currentStateIndex = 0;
        this.state = stateCycle[this.currentStateIndex];
        this.stateTimer = 0;
        this.stateDuration = 3; // Seconds per state

        this.animTime = 0;
    }

    update(deltaTime) {
        this.animTime += deltaTime;
        this.stateTimer += deltaTime;

        // Cycle through states
        if (this.stateTimer > this.stateDuration) {
            this.stateTimer = 0;
            this.currentStateIndex = (this.currentStateIndex + 1) % stateCycle.length;
            this.state = stateCycle[this.currentStateIndex];
        }

        // Handle movement during IsWalking
        if (this.state === ChickenState.IsWalking) {
            this.x += 100 * deltaTime; // Move right at 100px per second

            // Wrap around screen
            if (this.x > canvas.width + 50) {
                this.x = -this.size;
            }
        }
    }

    draw(ctx) {
        let bodyRot = 0;
        let headRot = 0;
        let leg1Rot = 0;
        let leg2Rot = 0;

        // Calculate procedural animations based on state
        switch (this.state) {
            case ChickenState.IsStill:
                // No animation
                break;
            case ChickenState.IsWalking:
                // Scissor legs and slight head bob
                leg1Rot = Math.sin(this.animTime * 15) * 0.6;
                leg2Rot = Math.sin(this.animTime * 15 + Math.PI) * 0.6;
                headRot = Math.sin(this.animTime * 15) * 0.1;
                break;
            case ChickenState.IsLooking:
                // Smoothly look back and forth, slightly tilted
                headRot = Math.sin(this.animTime * 4) * 0.6;
                break;
            case ChickenState.IsEating:
                // Lean whole body forward, head down, and peck the ground
                bodyRot = Math.PI / 6;
                headRot = Math.PI / 4 + Math.abs(Math.sin(this.animTime * 20)) * 0.3;
                break;
        }

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(this.scale, this.scale);

        // --- DRAW LEGS ---
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'orange';

        // Leg 1 (Back Leg)
        ctx.save();
        ctx.translate(40, 80); // Leg 1 pivot
        ctx.rotate(leg1Rot);
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-5, 15); ctx.stroke();
        ctx.restore();

        // Leg 2 (Front Leg)
        ctx.save();
        ctx.translate(60, 80); // Leg 2 pivot
        ctx.rotate(leg2Rot);
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(5, 15); ctx.stroke();
        ctx.restore();

        // --- DRAW BODY GROUP ---
        ctx.save();
        ctx.translate(50, 60); // Body pivot point (center of belly)
        ctx.rotate(bodyRot);
        ctx.translate(-50, -60); // Translate back to draw relative to 0,0

        // Tail
        ctx.fillStyle = '#f0f0f0';
        ctx.beginPath(); ctx.moveTo(20, 60); ctx.quadraticCurveTo(5, 50, 25, 35); ctx.fill();

        // Body Main
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(50, 60, 30, 0, Math.PI * 2); ctx.fill();

        // Wing
        ctx.fillStyle = '#e0e0e0';
        ctx.beginPath(); ctx.moveTo(35, 55); ctx.quadraticCurveTo(50, 75, 65, 55); ctx.fill();

        // --- DRAW HEAD GROUP ---
        ctx.save();
        ctx.translate(65, 45); // Neck pivot point
        ctx.rotate(headRot);
        ctx.translate(-65, -45); // Translate back

        // Head Main
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(70, 35, 18, 0, Math.PI * 2); ctx.fill();

        // Beak
        ctx.fillStyle = 'orange';
        ctx.beginPath(); ctx.moveTo(85, 30); ctx.lineTo(100, 35); ctx.lineTo(85, 40); ctx.fill();

        // Eye
        ctx.fillStyle = 'black';
        ctx.beginPath(); ctx.arc(75, 30, 2.5, 0, Math.PI * 2); ctx.fill();

        // Comb
        ctx.fillStyle = 'red';
        ctx.beginPath(); ctx.moveTo(60, 25); ctx.quadraticCurveTo(65, 10, 75, 18); ctx.quadraticCurveTo(80, 10, 85, 20); ctx.fill();

        // Wattle
        ctx.beginPath(); ctx.moveTo(75, 50); ctx.quadraticCurveTo(80, 60, 85, 50); ctx.fill();

        ctx.restore(); // Restore Head Group
        ctx.restore(); // Restore Body Group
        ctx.restore(); // Restore Main Transform
    }
}

const chicken = new AnimatedChicken();

// 6. Interaction: Click Detection
canvas.addEventListener('click', (e) => {
    if (isExploded) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Hitbox detection
    if (mouseX >= chicken.x && mouseX <= chicken.x + chicken.size &&
        mouseY >= chicken.y && mouseY <= chicken.y + chicken.size) {

        isExploded = true;

        const centerX = chicken.x + chicken.size / 2;
        const centerY = chicken.y + chicken.size / 2;

        for (let i = 0; i < 80; i++) {
            particles.push(new Feather(centerX, centerY));
        }
    }
});

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// 7. Animation Loop with DeltaTime
let lastTime = performance.now();

function animate(currentTime) {
    // Calculate time passed since last frame (in seconds)
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!isExploded) {
        chicken.update(deltaTime);
        chicken.draw(ctx);

        // Debug/UX: Show current state text
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.font = '20px Arial';
        ctx.fillText(`State: ${chicken.state}`, 20, 40);

    } else {
        particles.forEach(p => p.update());
        particles.forEach(p => p.draw(ctx));
        particles = particles.filter(p => p.opacity > 0);
    }

    requestAnimationFrame(animate);
}

// Start the loop
requestAnimationFrame(animate);
