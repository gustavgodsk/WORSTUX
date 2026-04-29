<script lang="ts">
import { onMount } from 'svelte';

import { Chicken } from '../../../../chicken/Chicken.js';
import { Fox } from '../../../../chicken/Fox.js';
import { Feather } from '../../../../chicken/Feather.js';

let { setTitle } = $props();

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;

let gazeX = $state(0);
let gazeY = $state(0);

const TITLE = 'PHASE 2 !!!';

// ---------------- STATE ----------------
type StateManager = {
    canvas: HTMLCanvasElement;
    chickens: Chicken[];
    fox: Fox;
    particles: Feather[];
    mouseX: number;
    mouseY: number;
    explodeChicken: (chicken: Chicken) => void;
};

let stateManager: StateManager;

let lastTime = 0;

// ---------------- LASER HELPERS ----------------
function lineHitsRect(
    eye: { x: number; y: number },
    tx: number,
    ty: number,
    size: number
): boolean {
    const steps = 25;

    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = eye.x + (gazeX - eye.x) * t;
        const y = eye.y + (gazeY - eye.y) * t;

        if (x >= tx && x <= tx + size && y >= ty && y <= ty + size) {
            return true;
        }
    }

    return false;
}

function laserHitsFox(): boolean {
    if (!canvas) return false;

    const fox = stateManager.fox;

    const eyes = [
        { x: canvas.width / 2 - 25, y: 0 },
        { x: canvas.width / 2 + 25, y: 0 }
    ];

    return eyes.some((eye) =>
        lineHitsRect(eye, fox.x, fox.y, fox.size)
    );
}

function laserHitsChicken(chicken: Chicken): boolean {
    if (!canvas) return false;

    const eyes = [
        { x: canvas.width / 2 - 25, y: 0 },
        { x: canvas.width / 2 + 25, y: 0 }
    ];

    return eyes.some((eye) =>
        lineHitsRect(eye, chicken.x, chicken.y, chicken.size)
    );
}

// ---------------- DRAW LASERS ----------------
function drawLasers() {
    if (!ctx || !canvas) return;

    const eyes = [
        { x: canvas.width / 2 - 25, y: 0 },
        { x: canvas.width / 2 + 25, y: 0 }
    ];

    ctx.strokeStyle = 'rgba(255,0,0,0.8)';
    ctx.lineWidth = 2;

    for (const eye of eyes) {
        ctx.beginPath();
        ctx.moveTo(eye.x, eye.y);
        ctx.lineTo(gazeX, gazeY);
        ctx.stroke();
    }
}

// ---------------- LOOP ----------------
function animate(time: number) {
    if (!ctx || !canvas) return;

    const deltaTime = (time - lastTime) / 1000;
    lastTime = time;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // feed gaze into system
    stateManager.mouseX = gazeX;
    stateManager.mouseY = gazeY;

    // ---------------- FOX ----------------
    stateManager.fox.update(deltaTime, stateManager);

    if (laserHitsFox()) {
        stateManager.fox.health = Math.max(
            0,
            stateManager.fox.health - 40 * deltaTime
        );
    }

    stateManager.fox.draw(ctx);

    // ---------------- CHICKENS ----------------
    stateManager.chickens.forEach((c) => {
        c.update(deltaTime, stateManager);

        // 🔥 laser kills chickens
        if (!c.isDead && laserHitsChicken(c)) {
            stateManager.explodeChicken(c);
        }

        c.draw(ctx);
    });

    stateManager.chickens = stateManager.chickens.filter(c => !c.isDead);

    // ---------------- PARTICLES ----------------
    stateManager.particles.forEach(p => {
        p.update();
        p.draw(ctx);
    });

    stateManager.particles = stateManager.particles.filter(
        p => p.opacity > 0
    );

    // ---------------- LASERS ----------------
    drawLasers();

    requestAnimationFrame(animate);
}

// ---------------- INIT ----------------
onMount(() => {
    setTitle(TITLE);

    if (!canvas) return;

    ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // ---------------- STATE INIT ----------------
    const foxStartX = canvas.width / 2;
    const foxStartY = canvas.height / 2;

    stateManager = {
        canvas,
        chickens: [],
        fox: new Fox(foxStartX, foxStartY),
        particles: [],
        mouseX: -100,
        mouseY: -100,

        explodeChicken: (chicken: Chicken) => {
            chicken.isDead = true;

            const cx = chicken.x + chicken.size / 2;
            const cy = chicken.y + chicken.size / 2;

            for (let i = 0; i < 40; i++) {
                stateManager.particles.push(new Feather(cx, cy));
            }
        }
    };

    // 👉 ensure fox starts moving immediately
    stateManager.fox.targetX = foxStartX + 100;
    stateManager.fox.targetY = foxStartY + 50;

    // ---------------- INPUT ----------------
    window.addEventListener('mousemove', (e: MouseEvent) => {
        gazeX = e.clientX;
        gazeY = e.clientY;
    });

    // ---------------- SPAWN CHICKENS ----------------
    for (let i = 0; i < 5; i++) {
        const x = Math.random() * (canvas.width - 100);
        const y = Math.random() * (canvas.height - 100);
        stateManager.chickens.push(new Chicken(x, y));
    }

    // continuous spawn
    setInterval(() => {
        if (stateManager.chickens.length < 12) {
            const x = Math.random() * (canvas.width - 100);
            const y = Math.random() * (canvas.height - 100);
            stateManager.chickens.push(new Chicken(x, y));
        }
    }, 4000);

    requestAnimationFrame(animate);
});
</script>

<canvas bind:this={canvas} class="fixed inset-0"></canvas>

<style>
canvas {
    background: #87c95a;
}
</style>