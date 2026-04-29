<script lang="ts">
    import { onMount } from 'svelte';
    import { oceanState } from './state.svelte';
    import FishTypeA from './FishTypeA.svelte';
    import FishTypeB from './FishTypeB.svelte';
    import FishTypeC from './FishTypeC.svelte';
    import type { Orchestrator } from '$lib/utils/orchestrator.svelte';

    interface Props {
        orchestrator: Orchestrator;
    }

    let { orchestrator }: Props = $props();

    let windowWidth = $state(1000);
    let windowHeight = $state(800);

    let draggedLetterId = $state<number | null>(null);
    let audioRef: HTMLAudioElement | null = null;

    // FIX: Track exactly where on the letter the user clicked
    let dragOffsetX = $state(0);
    let dragOffsetY = $state(0);

    function handlePointerDown(e: PointerEvent, id: number) {
        draggedLetterId = id;
        oceanState.setLetterDragged(id, true);

        // Calculate the offset so the letter doesn't snap down
        const letter = oceanState.letters.find((l) => l.id === id);
        if (letter) {
            dragOffsetX = e.clientX - letter.globalX;
            dragOffsetY = e.clientY - letter.globalY;
        }

        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }

    function handlePointerMove(e: PointerEvent) {
        if (draggedLetterId !== null) {
            // Apply the offset during the drag
            oceanState.updateLetterPos(
                draggedLetterId,
                e.clientX - dragOffsetX,
                e.clientY - dragOffsetY
            );
        }
    }

    function handlePointerUp() {
        if (draggedLetterId !== null) {
            oceanState.setLetterDragged(draggedLetterId, false);
            draggedLetterId = null;
        }
    }

    onMount(() => {
        if (audioRef) {
            audioRef.volume = 0.4;
            // Browsers block autoplay unless the user has interacted with the page.
            // Luckily, they had to click buttons to get here, so this will work!
            audioRef.play().catch((e) => console.log('Autoplay prevented by browser:', e));
        }

        let frame: number;

        function animate() {
            oceanState.fishes.forEach((fish) => {
                let targetX = fish.exitX;
                let targetY = fish.exitY;

                if (!fish.isReturning) {
                    targetX = fish.targetX;
                    targetY = fish.targetY;
                    const distToTarget = Math.hypot(targetX - fish.x, targetY - fish.y);

                    if (distToTarget < 20) {
                        if (fish.isInputThief) {
                            oceanState.stealFromInput(
                                fish.id,
                                fish.x,
                                fish.y,
                                fish.targetInputIndex!
                            );
                            fish.isReturning = true;
                        } else if (fish.targetLetterId !== null) {
                            if (!oceanState.heistedLetterIds.includes(fish.targetLetterId)) {
                                // Pass the font and transform from the fish
                                oceanState.grabLetter(
                                    fish.targetLetterId,
                                    fish.targetText,
                                    fish.targetX,
                                    fish.targetY,
                                    fish.targetFont,
                                    fish.targetTransform
                                );
                            }
                            fish.hasLetter = true;
                            fish.isReturning = true;
                        }
                    }
                }

                const dx = targetX - fish.x;
                const dy = targetY - fish.y;
                const dist = Math.hypot(dx, dy);

                if (dist > 5) {
                    fish.x += (dx / dist) * fish.speed;
                    fish.y += (dy / dist) * fish.speed;

                    const angle = Math.atan2(dy, dx);
                    fish.rotation = angle * (180 / Math.PI);
                    fish.flipY = Math.abs(fish.rotation) > 90;
                } else if (fish.isReturning) {
                    if (fish.hasLetter && fish.targetLetterId !== null) {
                        oceanState.markLetterGone(fish.targetLetterId);
                    }
                    oceanState.removeFish(fish.id);
                }

                if (fish.hasLetter && fish.targetLetterId !== null) {
                    const carriedLetter = oceanState.letters.find(
                        (l) => l.id === fish.targetLetterId
                    );
                    if (carriedLetter && !carriedLetter.isDragged) {
                        const mouthOffset = 20;
                        const mx = fish.x + Math.cos((fish.rotation * Math.PI) / 180) * mouthOffset;
                        const my = fish.y + Math.sin((fish.rotation * Math.PI) / 180) * mouthOffset;
                        oceanState.updateLetterPos(carriedLetter.id, mx, my);
                    }
                }
            });

            oceanState.letters.forEach((letter) => {
                if (!letter.isDragged) {
                    const isCarried = oceanState.fishes.some(
                        (f) => f.hasLetter && f.targetLetterId === letter.id
                    );
                    if (!isCarried) {
                        const sandLevel = windowHeight - 60;
                        if (letter.globalY < sandLevel) {
                            letter.globalY += 1.5;
                        }
                    }
                }
            });

            frame = requestAnimationFrame(animate);
        }
        frame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frame);
    });
</script>

<svelte:window
    bind:innerWidth={windowWidth}
    bind:innerHeight={windowHeight}
    onpointermove={handlePointerMove}
    onpointerup={handlePointerUp}
/>

<div
    class="pointer-events-none fixed inset-0 z-[100] overflow-hidden bg-gradient-to-b from-cyan-900/30 to-blue-900/60 backdrop-blur-[1px]"
>
    <audio bind:this={audioRef} src="/ocean.mp3" loop class="hidden"></audio>
    <div class="pointer-events-none absolute inset-0 overflow-hidden opacity-50">
        {#each Array(15) as _, i}
            <div
                class="bubble"
                style="left: {Math.random() * 100}%; animation-delay: {Math.random() *
                    5}s; animation-duration: {4 + Math.random() * 6}s;"
            ></div>
        {/each}
    </div>
    <div
        class="absolute bottom-0 h-[8vh] w-full bg-gradient-to-t from-[#c2b280] to-[#e0cda9]/80 shadow-[inset_0_20px_20px_rgba(0,0,0,0.1)]"
    ></div>

    {#each Array(6) as _, i}
        <svg
            class="seaweed absolute bottom-2 h-32 w-12 opacity-80"
            style="left: {10 + i * 18}%; animation-delay: {i * 0.5}s"
            viewBox="0 0 50 150"
        >
            <path
                d="M 25 150 Q 0 100 25 50 T 25 0"
                fill="none"
                stroke="#2E8B57"
                stroke-width="8"
                stroke-linecap="round"
            />
        </svg>
        <div
            class="crab absolute bottom-4 opacity-90"
            style="left: {5 + i * 16}%; animation-delay: {i}s"
        >
            <div class="text-2xl text-red-500 drop-shadow-md">🦀</div>
        </div>
    {/each}

    {#each oceanState.activeFishes as fish (fish.id)}
        <div class="pointer-events-none absolute" style="left: {fish.x}px; top: {fish.y}px;">
            {#if fish.type === 1}
                <FishTypeA rotation={fish.rotation} flipY={fish.flipY} />
            {:else if fish.type === 2}
                <FishTypeB rotation={fish.rotation} flipY={fish.flipY} />
            {:else}
                <FishTypeC rotation={fish.rotation} flipY={fish.flipY} />
            {/if}
        </div>
    {/each}

    {#each oceanState.activeLetters as letter (letter.id)}
        <span
            class="absolute -m-3 cursor-grab p-3 whitespace-pre text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] select-none active:cursor-grabbing"
            style="top: {letter.globalY}px; left: {letter.globalX}px; pointer-events: auto; z-index: {letter.isDragged
                ? 50
                : 10}; font: {letter.font}; transform: {letter.cssTransform};"
            onpointerdown={(e) => handlePointerDown(e, letter.id)}
        >
            {letter.text}
        </span>
    {/each}
</div>

<style>
    @keyframes sway {
        0% {
            transform: skewX(-10deg);
        }
        100% {
            transform: skewX(10deg);
        }
    }
    .seaweed {
        transform-origin: bottom center;
        animation: sway 3s ease-in-out infinite alternate;
    }

    @keyframes scuttle {
        0% {
            transform: translateX(0);
        }
        50% {
            transform: translateX(40px);
        }
        100% {
            transform: translateX(0);
        }
    }
    .crab {
        animation: scuttle 8s linear infinite;
    }
    @keyframes rise {
        0% {
            bottom: -20px;
            transform: translateX(0);
            opacity: 0;
        }
        50% {
            opacity: 1;
            transform: translateX(-15px);
        }
        100% {
            bottom: 100%;
            transform: translateX(-30px);
            opacity: 0;
        }
    }
    .bubble {
        position: absolute;
        bottom: -20px;
        width: 12px;
        height: 12px;
        background-color: rgba(255, 255, 255, 0.15);
        border-radius: 50%;
        border: 1px solid rgba(255, 255, 255, 0.4);
        animation: rise infinite ease-in;
    }
</style>
