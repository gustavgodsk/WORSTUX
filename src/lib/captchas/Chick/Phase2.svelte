<script lang="ts">
    import { onMount } from 'svelte';

    import { Chicken } from '../../../../chicken/Chicken.js';
    import { Fox } from '../../../../chicken/Fox.js';
    import { Feather } from '../../../../chicken/Feather.js';

    let { setTitle } = $props();
    let gazeX = $state(0);
    let gazeY = $state(0);

    // Base Game Canvas (Fox, Chickens, Background)
    let canvas: HTMLCanvasElement | null = null;
    let ctx: CanvasRenderingContext2D | null = null;

    // Top Layer Canvas (Lasers only, dynamically injected to bypass z-index traps)
    let laserCanvas: HTMLCanvasElement | null = null;
    let laserCtx: CanvasRenderingContext2D | null = null;

    const TITLE = 'Protect the chickens to complete the captcha';

    // State to hold the dynamic eye coordinates
    let currentEyes = [
        { x: window.innerWidth / 2 - 25, y: 0 },
        { x: window.innerWidth / 2 + 25, y: 0 }
    ];

    $effect(() => {
        window.webgazer.setGazeListener(async (data: any, elapsedTime: number) => {
            if (data) {
                gazeX = data.x;
                gazeY = data.y;
            }

            try {
                // Get the raw MediaPipe face mesh data
                const tracker = window.webgazer.getTracker();
                if (tracker && tracker.getPositions) {
                    const fmPositions = await tracker.getPositions();

                    if (fmPositions && fmPositions.length > 0) {
                        const whr = window.webgazer.getVideoPreviewToCameraResolutionRatio();
                        const previewWidth = window.webgazer.params.videoViewerWidth;

                        // Point 145 is the left eye, Point 374 is the right eye
                        currentEyes[0] = {
                            x: previewWidth - fmPositions[145][0] * whr[0],
                            y: fmPositions[145][1] * whr[1]
                        };

                        currentEyes[1] = {
                            x: previewWidth - fmPositions[374][0] * whr[0],
                            y: fmPositions[374][1] * whr[1]
                        };
                    }
                }
            } catch (e) {
                // Fails silently if face mesh isn't fully initialized yet
            }
        });

        return () => {
            window.webgazer.clearGazeListener();
            window.webgazer.end();
        };
    });

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
        return currentEyes.some((eye) => lineHitsRect(eye, fox.x, fox.y, fox.size));
    }

    function laserHitsChicken(chicken: Chicken): boolean {
        if (!canvas) return false;
        return currentEyes.some((eye) => lineHitsRect(eye, chicken.x, chicken.y, chicken.size));
    }

    // ---------------- DRAW LASERS ----------------
    function drawLasers() {
        if (!laserCtx || !laserCanvas) return;

        laserCtx.strokeStyle = 'rgba(255,0,0,0.8)';
        laserCtx.lineWidth = 2;

        // Draw lasers on the top-layer canvas
        for (const eye of currentEyes) {
            laserCtx.beginPath();
            laserCtx.moveTo(eye.x, eye.y);
            laserCtx.lineTo(gazeX, gazeY);
            laserCtx.stroke();
        }
    }

    // ---------------- LOOP ----------------
    function animate(time: number) {
        if (!ctx || !canvas || !laserCtx || !laserCanvas) return;

        // 🔥 THE FIX: Prevent huge deltaTime on the very first frame
        if (lastTime === 0) {
            lastTime = time;
        }

        const deltaTime = (time - lastTime) / 1000;
        lastTime = time;

        // Clear BOTH canvases
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        laserCtx.clearRect(0, 0, laserCanvas.width, laserCanvas.height);

        // feed gaze into system
        stateManager.mouseX = gazeX;
        stateManager.mouseY = gazeY;

        // ---------------- FOX ----------------
        stateManager.fox.update(deltaTime, stateManager);

        if (laserHitsFox()) {
            stateManager.fox.health = Math.max(0, stateManager.fox.health - 40 * deltaTime);
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

        stateManager.chickens = stateManager.chickens.filter((c) => !c.isDead);

        // ---------------- PARTICLES ----------------
        stateManager.particles.forEach((p) => {
            p.update();
            p.draw(ctx);
        });

        stateManager.particles = stateManager.particles.filter((p) => p.opacity > 0);

        // ---------------- LASERS ----------------
        drawLasers();

        requestAnimationFrame(animate);
    }

    // ---------------- INIT ----------------
    onMount(() => {
        setTitle(TITLE);

        if (!canvas) return;

        // 🔥 THE FIX: Programmatically create the laser canvas and attach it to the body
        laserCanvas = document.createElement('canvas');
        laserCanvas.className = 'pointer-events-none fixed inset-0 z-[99999]';
        document.body.appendChild(laserCanvas);

        ctx = canvas.getContext('2d');
        laserCtx = laserCanvas.getContext('2d');
        if (!ctx || !laserCtx) return;

        // Setup both canvas sizes
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        laserCanvas.width = window.innerWidth;
        laserCanvas.height = window.innerHeight;

        // Keep both canvases in sync if the window resizes
        const handleResize = () => {
            if (canvas && laserCanvas) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                laserCanvas.width = window.innerWidth;
                laserCanvas.height = window.innerHeight;
            }
        };
        window.addEventListener('resize', handleResize);

        // Set fallback eyes
        currentEyes = [
            { x: canvas.width / 2 - 25, y: 0 },
            { x: canvas.width / 2 + 25, y: 0 }
        ];

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

        stateManager.fox.targetX = foxStartX + 100;
        stateManager.fox.targetY = foxStartY + 50;

        // ---------------- INPUT ----------------
        window.addEventListener('mousemove', (e: MouseEvent) => {
            if (gazeX === 0 && gazeY === 0) {
                gazeX = e.clientX;
                gazeY = e.clientY;
            }
        });

        // ---------------- SPAWN CHICKENS ----------------
        for (let i = 0; i < 5; i++) {
            const x = Math.random() * (canvas.width - 100);
            const y = Math.random() * (canvas.height - 100);
            stateManager.chickens.push(new Chicken(x, y));
        }

        const spawnInterval = setInterval(() => {
            if (stateManager.chickens.length < 12) {
                const x = Math.random() * (canvas.width - 100);
                const y = Math.random() * (canvas.height - 100);
                stateManager.chickens.push(new Chicken(x, y));
            }
        }, 4000);

        requestAnimationFrame(animate);

        // CLEANUP
        return () => {
            window.removeEventListener('resize', handleResize);
            clearInterval(spawnInterval);

            // We must manually remove our dynamically created canvas when the component unmounts
            if (laserCanvas && laserCanvas.parentNode) {
                laserCanvas.parentNode.removeChild(laserCanvas);
            }
        };
    });
</script>

<div class="pointer-events-none fixed inset-0 z-[100000] flex justify-center pt-6">
    <h1
        class="text-4xl font-black tracking-wider text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]"
        style="-webkit-text-stroke: 1.5px black;"
    >
        {TITLE}
    </h1>
</div>

<canvas bind:this={canvas} class="fixed inset-0 z-0 bg-[#87c95a]"></canvas>
