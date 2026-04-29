import { Chicken } from './Chicken.js';
import { Fox } from './Fox.js';
import { Feather } from './Feather.js';

// 1. Setup Canvas
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// 2. State Manager Object
const stateManager = {
    canvas: canvas,
    chickens: [],
    fox: new Fox(100, 100),
    particles: [],

    // Track cursor off-screen initially
    mouseX: -100,
    mouseY: -100,

    explodeChicken: (chicken) => {
        chicken.isDead = true;
        const centerX = chicken.x + chicken.size / 2;
        const centerY = chicken.y + chicken.size / 2;
        for (let i = 0; i < 60; i++) {
            stateManager.particles.push(new Feather(centerX, centerY));
        }
    }
};

// Initial Spawns
stateManager.chickens.push(new Chicken(canvas.width / 2, canvas.height / 2));

setInterval(() => {
    if (stateManager.chickens.length < 15) {
        const x = Math.random() * (canvas.width - 100);
        const y = Math.random() * (canvas.height - 100);
        stateManager.chickens.push(new Chicken(x, y));
    }
}, 4000);

// 3. Interactions
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    for (let i = stateManager.chickens.length - 1; i >= 0; i--) {
        const c = stateManager.chickens[i];
        if (clickX >= c.x && clickX <= c.x + c.size &&
            clickY >= c.y && clickY <= c.y + c.size) {

            stateManager.explodeChicken(c);
            break;
        }
    }
});

// Track mouse position for the Fox hover effect
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    stateManager.mouseX = e.clientX - rect.left;
    stateManager.mouseY = e.clientY - rect.top;
});

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// 4. Game Loop
let lastTime = performance.now();

function animate(currentTime) {
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    stateManager.fox.update(deltaTime, stateManager);
    stateManager.fox.draw(ctx);

    stateManager.chickens.forEach(chicken => {
        chicken.update(deltaTime, stateManager);
        chicken.draw(ctx);
    });

    stateManager.chickens = stateManager.chickens.filter(c => !c.isDead);

    stateManager.particles.forEach(p => {
        p.update();
        p.draw(ctx);
    });

    stateManager.particles = stateManager.particles.filter(p => p.opacity > 0);

    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
