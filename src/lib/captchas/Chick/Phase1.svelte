<script lang="ts">
    import { onMount } from 'svelte';
    import { Chicken, ChickenState } from './Chicken.js'; // Ensure the path matches your project structure

    let { onComplete, setTitle } = $props();

    const TITLE = 'Calibration Phase';

    let dots = $state([
        { id: 2, top: 10, left: 50, clicks: 0 },
        { id: 3, top: 10, left: 90, clicks: 0 },
        { id: 4, top: 50, left: 10, clicks: 0 },
        { id: 5, top: 50, left: 50, clicks: 0 },
        { id: 6, top: 50, left: 90, clicks: 0 },
        { id: 7, top: 90, left: 10, clicks: 0 },
        { id: 8, top: 90, left: 50, clicks: 0 },
        { id: 9, top: 90, left: 90, clicks: 0 }
    ]);

    const CLICKS_PER_DOT = 5;

    $effect(() => {
        window.saveDataAcrossSessions = false;
        window.webgazer.begin();

        return () => {
            window.webgazer.removeMouseEventListeners();
        };
    });

    onMount(() => {
        setTitle(TITLE);
    });

    function handleDotClick(index: number) {
        if (dots[index].clicks < CLICKS_PER_DOT) {
            dots[index].clicks++;
        }

        const isFullyCalibrated = dots.every((dot) => dot.clicks >= CLICKS_PER_DOT);

        if (isFullyCalibrated) {
            setTimeout(() => {
                onComplete();
            }, 800);
        }
    }

    // Action to draw the cracking egg
    function drawEgg(node: HTMLCanvasElement, clickCount: number) {
        const ctx = node.getContext('2d');
        if (!ctx) return;

        function render(clicks: number) {
            ctx.clearRect(0, 0, node.width, node.height);
            ctx.save();

            // Center the drawing in the 100x100 canvas
            ctx.translate(50, 50);

            // 1. Draw the Egg Shape
            ctx.fillStyle = '#faebd7';
            ctx.strokeStyle = '#c0b0a0';
            ctx.lineWidth = 2;

            ctx.beginPath();
            ctx.moveTo(0, 25);
            ctx.bezierCurveTo(25, 25, 20, -20, 0, -25);
            ctx.bezierCurveTo(-20, -20, -25, 25, 0, 25);
            ctx.fill();
            ctx.stroke();

            // 2. Draw Cracks based on clickCount
            if (clicks > 0) {
                ctx.strokeStyle = '#4a4a4a';
                ctx.lineWidth = 1.5;
                ctx.beginPath();

                if (clicks >= 1) {
                    ctx.moveTo(0, -25);
                    ctx.lineTo(5, -12);
                }
                if (clicks >= 2) {
                    ctx.lineTo(-4, 2);
                }
                if (clicks >= 3) {
                    ctx.lineTo(6, 12);
                    ctx.moveTo(-4, 2);
                    ctx.lineTo(-12, 8);
                }
                if (clicks >= 4) {
                    ctx.lineTo(-2, 22);
                    ctx.moveTo(6, 12);
                    ctx.lineTo(15, 16);
                }

                ctx.stroke();
            }

            ctx.restore();
        }

        render(clickCount);

        return {
            update(newClickCount: number) {
                render(newClickCount);
            }
        };
    }

    // Action to render a stationary hatched chicken using your existing class
    function drawHatchedChicken(node: HTMLCanvasElement) {
        const ctx = node.getContext('2d');
        if (!ctx) return;

        // Create the chicken at 0,0. Your chicken's draw method automatically
        // translates by (size / 2). For a size of 100, that puts it exactly at 50,50.
        const chicken = new Chicken(0, 0);
        chicken.state = ChickenState.IsStill; // Lock the state to standing still

        let animationFrameId: number;
        let lastTime = performance.now();

        function renderLoop(time: number) {
            const deltaTime = (time - lastTime) / 1000;
            lastTime = time;

            ctx.clearRect(0, 0, node.width, node.height);

            // Increment animTime to keep it technically "alive", but do NOT
            // call update() so we bypass the state manager and movement logic.
            chicken.animTime += deltaTime;

            chicken.draw(ctx);

            animationFrameId = requestAnimationFrame(renderLoop);
        }

        animationFrameId = requestAnimationFrame(renderLoop);

        return {
            destroy() {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }
</script>

<div class="relative h-screen w-screen overflow-hidden bg-gray-100">
    {#each dots as dot, index (dot.id)}
        <div
            class="absolute z-20 flex h-[100px] w-[100px] -translate-x-1/2 -translate-y-1/2 items-center justify-center transition-all duration-200"
            style="top: {dot.top}%; left: {dot.left}%;"
        >
            {#if dot.clicks < CLICKS_PER_DOT}
                <button
                    class="h-full w-full cursor-pointer rounded-full border-none bg-transparent transition-transform duration-200 outline-none hover:scale-105 active:scale-90"
                    onclick={() => handleDotClick(index)}
                    aria-label="Calibration egg {dot.id}"
                >
                    <canvas width="100" height="100" use:drawEgg={dot.clicks}></canvas>
                </button>
            {:else}
                <canvas
                    width="100"
                    height="100"
                    class="animate-in fade-in zoom-in drop-shadow-md duration-300"
                    use:drawHatchedChicken
                ></canvas>
            {/if}
        </div>
    {/each}
</div>
