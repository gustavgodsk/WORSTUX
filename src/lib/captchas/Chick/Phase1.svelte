<script lang="ts">
    import { onMount } from 'svelte';

    let { onComplete, setTitle } = $props();

    const TITLE = 'Calibration Phase';

    let dots = $state([
        // { id: 1, top: 10, left: 10, clicks: 0 },
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

        // Use window.webgazer now
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
            }, 500);
        }
    }

    function getDotColor(clicks: number) {
        if (clicks === 0) return '#ef4444';
        if (clicks === 1) return '#f97316';
        if (clicks === 2) return '#eab308';
        if (clicks === 3) return '#84cc16';
        if (clicks === 4) return '#22c55e';
        return 'transparent';
    }
</script>

<div class="relative h-screen w-screen overflow-hidden bg-gray-100">
    <div
        class="pointer-events-none absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 text-center shadow-md"
    >
        <p class="font-bold">Look at the dots and click each one 5 times.</p>
        <p class="mt-2 text-gray-600">
            The dots will change color and disappear when fully calibrated.
        </p>
    </div>

    {#each dots as dot, index (dot.id)}
        {#if dot.clicks < CLICKS_PER_DOT}
            <button
                class="absolute z-20 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-2 border-white font-bold text-white shadow-md transition-all duration-200 active:scale-90"
                style="
                    top: {dot.top}%; 
                    left: {dot.left}%; 
                    background-color: {getDotColor(dot.clicks)};
                    text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
                "
                onclick={() => handleDotClick(index)}
                aria-label="Calibration point {dot.id}"
            >
                {CLICKS_PER_DOT - dot.clicks}
            </button>
        {/if}
    {/each}
</div>
