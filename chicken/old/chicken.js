// 1. Setup the Canvas
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);

// Make canvas fill the window
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.style.margin = '0';
document.body.style.overflow = 'hidden';
document.body.style.backgroundColor = '#87CEEB'; // Sky blue background

// 2. Define the Vector SVG Chicken
const chickenSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <path d="M 20 60 Q 5 50 25 35 Z" fill="#f0f0f0" />
  <line x1="40" y1="80" x2="35" y2="95" stroke="orange" stroke-width="4" stroke-linecap="round"/>
  <line x1="60" y1="80" x2="65" y2="95" stroke="orange" stroke-width="4" stroke-linecap="round"/>
  <circle cx="50" cy="60" r="30" fill="#ffffff" />
  <circle cx="70" cy="35" r="18" fill="#ffffff" />
  <polygon points="85,30 100,35 85,40" fill="orange" />
  <circle cx="75" cy="30" r="2.5" fill="black" />
  <path d="M 60 25 Q 65 10 75 18 Q 80 10 85 20 Z" fill="red" />
  <path d="M 75 50 Q 80 60 85 50 Z" fill="red" />
  <path d="M 35 55 Q 50 75 65 55 Z" fill="#e0e0e0" />
</svg>`;

// Convert SVG to an Image object for canvas rendering
const chickenImg = new Image();
const svgBlob = new Blob([chickenSvg], { type: 'image/svg+xml;charset=utf-8' });
const url = URL.createObjectURL(svgBlob);
chickenImg.src = url;

// 3. Game State & Variables
let isExploded = false;
let particles = [];

// Chicken dimensions and position (centered)
const chickenSize = 150;
const chickenX = canvas.width / 2 - chickenSize / 2;
const chickenY = canvas.height / 2 - chickenSize / 2;

// 4. Feather Particle Class
class Feather {
    constructor(x, y) {
        this.x = x;
        this.y = y;

        // Randomize explosion trajectory
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 15 + 5;

        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed - 10; // Upward bias for explosion

        this.gravity = 0.4; // Pulls feathers down
        this.drag = 0.92;   // Air resistance slows horizontal movement

        this.opacity = 1;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.3;

        this.width = Math.random() * 8 + 6;
        this.height = Math.random() * 20 + 15;
    }

    update() {
        // Apply physics
        this.vx *= this.drag;
        this.vy += this.gravity;

        this.x += this.vx;
        this.y += this.vy;

        this.rotation += this.rotationSpeed;

        // Fade out slowly once it starts falling
        if (this.vy > 0) {
            this.opacity -= 0.005;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = Math.max(0, this.opacity);

        // Draw feather shape
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(0, 0, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw feather quill (center line)
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, -this.height / 2);
        ctx.lineTo(0, this.height / 2);
        ctx.stroke();

        ctx.restore();
    }
}

// 5. Interaction: Click Detection
canvas.addEventListener('click', (e) => {
    if (isExploded) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Check if click is inside the chicken's bounding box
    if (mouseX >= chickenX && mouseX <= chickenX + chickenSize &&
        mouseY >= chickenY && mouseY <= chickenY + chickenSize) {

        isExploded = true;

        // Generate feathers from the center of the chicken
        const centerX = chickenX + chickenSize / 2;
        const centerY = chickenY + chickenSize / 2;

        for (let i = 0; i < 60; i++) {
            particles.push(new Feather(centerX, centerY));
        }
    }
});

// Handle window resizing
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// 6. Animation Loop
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!isExploded) {
        // Draw the intact chicken
        if (chickenImg.complete) {
            ctx.drawImage(chickenImg, chickenX, chickenY, chickenSize, chickenSize);
        }
    } else {
        // Update and draw feathers
        particles.forEach(p => p.update());
        particles.forEach(p => p.draw(ctx));

        // Remove feathers that have faded out to free up memory
        particles = particles.filter(p => p.opacity > 0);
    }

    requestAnimationFrame(animate);
}

// Start the animation loop
animate();
