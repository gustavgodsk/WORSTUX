<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import type { CaptchaProps } from '$lib/captchas/types';
    import { oceanState } from './state.svelte';
    import {
        prepareRichInline,
        walkRichInlineLineRanges,
        materializeRichInlineLineRange
    } from '@chenglou/pretext/rich-inline';

    let { onsuccess, setTitle }: CaptchaProps = $props();

    const uid = crypto.randomUUID().split('-');
    const SECRET_CODE = (uid[0] + uid[1] + uid[2] + uid[3]).toUpperCase();

    let fishIdCounter = 0;
    let inputRef: HTMLInputElement | null = null;

    type LocalLetter = {
        id: number;
        text: string;
        x: number;
        y: number;
        isTargeted: boolean;
        font: string;
        cssTransform: string;
    };
    let localLetters = $state<LocalLetter[]>([]);
    let containerRef: HTMLDivElement | null = null;

    // Terrible fonts for our Squiggly Captcha
    const UGLY_FONTS = [
        'Impact',
        'Georgia',
        'Courier New',
        'Comic Sans MS',
        'Times New Roman',
        'Papyrus', // The king of "fake-fancy" ugly
        'Brush Script MT', // The "1980s dry cleaner" look
        'Chalkboard SE', // For when Comic Sans isn't childish enough
        'Copperplate', // The "I'm trying too hard to look like a steakhouse" font
        'Bradley Hand', // The "forced personality" handwriting font
        'Luminari', // Extremely medieval and hard to read
        'Trattatello', // Pure visual clutter
        'Marker Felt' // Aggressive teacher-on-a-whiteboard vibes
    ];

    onMount(() => {
        setTitle('Write down what you see');
        oceanState.reset();

        const maxWidth = 600;
        const lineHeight = 28;

        const rawChars = [...SECRET_CODE];

        // Assign chaotic styling to each letter
        const items = rawChars.map((char) => {
            const fontName = UGLY_FONTS[Math.floor(Math.random() * UGLY_FONTS.length)];
            const fontSize = Math.floor(Math.random() * 50) + 16; // 24px - 40px
            const rot = Math.random() * 80 - 40; // -40deg to 40deg
            const skew = Math.random() * 40 - 20;
            const translateY = Math.random() * 20 - 10;

            return {
                text: char,
                font: `bold ${fontSize}px ${fontName}, sans-serif`,
                cssTransform: `rotate(${rot}deg) skewX(${skew}deg) translateY(${translateY}px)`
            };
        });

        const prepared = prepareRichInline(items);

        let idCounter = 0;
        let initialLetters: LocalLetter[] = [];

        // Start lower down to center the text in the box
        let currentY = 50;

        walkRichInlineLineRanges(prepared, maxWidth, (range) => {
            const line = materializeRichInlineLineRange(prepared, range);
            // Start further right to center it
            let currentX = 80;
            for (const frag of line.fragments) {
                currentX += frag.gapBefore;

                // Tie the fragment back to the original item to get our custom styling
                const originalItem = items[frag.itemIndex];

                initialLetters.push({
                    id: idCounter++,
                    text: frag.text,
                    x: currentX,
                    y: currentY,
                    isTargeted: false,
                    font: originalItem.font,
                    cssTransform: originalItem.cssTransform
                });
                currentX += frag.occupiedWidth;
            }
            currentY += lineHeight;
        });

        localLetters = initialLetters;

        const spawnInterval = setInterval(() => {
            if (!containerRef) return;

            const spawnLeft = Math.random() > 0.5;
            const margin = 100;
            const spawnX = spawnLeft ? -margin : window.innerWidth + margin;
            const spawnY = Math.random() * window.innerHeight;
            const exitX = spawnLeft ? window.innerWidth + margin : -margin;
            const exitY = Math.random() * window.innerHeight;

            // 1 | 2 | 3 for our new fish
            const fishType = (Math.floor(Math.random() * 3) + 1) as 1 | 2 | 3;
            let speed = 1.5;
            if (fishType === 1) speed = 4.5;
            if (fishType === 2) speed = 3;

            const isThief = Math.random() < 0.3 && oceanState.inputCode.length > 0 && inputRef;

            if (isThief && inputRef) {
                const rect = inputRef.getBoundingClientRect();
                const styles = window.getComputedStyle(inputRef);
                const targetIndex = Math.floor(Math.random() * oceanState.inputCode.length);
                const targetChar = oceanState.inputCode[targetIndex];

                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                let textWidthBefore = 0;

                if (context) {
                    context.font = `${styles.fontWeight} ${styles.fontSize} ${styles.fontFamily}`;
                    textWidthBefore = context.measureText(
                        oceanState.inputCode.slice(0, targetIndex)
                    ).width;
                }

                const paddingLeft = parseFloat(styles.paddingLeft) || 0;
                const targetX = rect.left + paddingLeft + textWidthBefore + 4;
                const targetY = rect.top + rect.height / 2;

                oceanState.addFish({
                    id: fishIdCounter++,
                    type: fishType,
                    x: spawnX,
                    y: spawnY,
                    rotation: 0,
                    flipY: false,
                    speed,
                    isInputThief: true,
                    targetInputIndex: targetIndex,
                    targetLetterId: null,
                    targetText: targetChar,
                    targetX,
                    targetY,
                    targetFont: '',
                    targetTransform: '',
                    exitX,
                    exitY,
                    hasLetter: false,
                    isReturning: false
                });
            } else {
                const remaining = localLetters.filter((l) => !l.isTargeted && l.text.trim() !== '');
                if (remaining.length > 0) {
                    const randomLetter = remaining[Math.floor(Math.random() * remaining.length)];
                    randomLetter.isTargeted = true;

                    const spanRef = containerRef.querySelector(`[data-id="${randomLetter.id}"]`);
                    if (spanRef) {
                        const rect = spanRef.getBoundingClientRect();
                        oceanState.addFish({
                            id: fishIdCounter++,
                            type: fishType,
                            x: spawnX,
                            y: spawnY,
                            rotation: 0,
                            flipY: false,
                            speed,
                            isInputThief: false,
                            targetInputIndex: null,
                            targetLetterId: randomLetter.id,
                            targetText: randomLetter.text,
                            targetX: rect.left,
                            targetY: rect.top,
                            targetFont: randomLetter.font,
                            targetTransform: randomLetter.cssTransform,
                            exitX,
                            exitY,
                            hasLetter: false,
                            isReturning: false
                        });
                    }
                }
            }
        }, 1200);

        return () => clearInterval(spawnInterval);
    });

    onDestroy(() => oceanState.reset());

    function checkCode() {
        if (oceanState.inputCode === SECRET_CODE) onsuccess();
    }
</script>

<div class="flex w-full flex-col gap-4">
    <div
        bind:this={containerRef}
        class="relative h-[150px] w-full cursor-crosshair overflow-hidden rounded-[2px] border border-gray-300 bg-gray-100 shadow-inner"
    >
        <svg class="pointer-events-none absolute inset-0 h-full w-full opacity-40">
            {#each Array(12) as _}
                <line
                    x1={Math.random() * 100 + '%'}
                    y1={Math.random() * 100 + '%'}
                    x2={Math.random() * 100 + '%'}
                    y2={Math.random() * 100 + '%'}
                    stroke="rgba(0,0,0,0.5)"
                    stroke-width={Math.random() * 3 + 1}
                />
            {/each}
        </svg>

        {#each localLetters as letter (letter.id)}
            <span
                data-id={letter.id}
                class="pointer-events-none absolute whitespace-pre text-gray-800 transition-opacity"
                style="top: {letter.y}px; left: {letter.x}px; font: {letter.font}; transform: {letter.cssTransform};"
                class:opacity-0={oceanState.heistedLetterIds.includes(letter.id)}
            >
                {letter.text}
            </span>
        {/each}
    </div>

    <div class="relative z-[101] flex flex-col gap-2 border border-gray-200 bg-gray-50 p-2">
        <label for="code" class="text-xs font-bold tracking-widest text-gray-500 uppercase">
            Type the text from the image
        </label>
        <div class="flex gap-2">
            <input
                id="code"
                type="text"
                bind:this={inputRef}
                bind:value={oceanState.inputCode}
                class="flex-1 border border-gray-300 p-2 text-sm outline-none focus:ring-2 focus:ring-cyan-600"
                placeholder="Type here..."
                autocomplete="off"
            />
            <button
                onclick={checkCode}
                class="rounded-[2px] bg-[#1A73E8] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-blue-800"
            >
                Verify
            </button>
        </div>
    </div>
</div>
