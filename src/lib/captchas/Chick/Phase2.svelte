<script lang="ts">
    import { onMount } from 'svelte';

    let { setTitle } = $props();

    let gazeX = $state(0);
    let gazeY = $state(0);

    $effect(() => {
        // We ensure data is typed to bypass TS warnings
        window.webgazer.setGazeListener((data: any, elapsedTime: number) => {
            if (data) {
                gazeX = data.x;
                gazeY = data.y;
            }
        });

        return () => {
            window.webgazer.clearGazeListener();
            window.webgazer.end();
        };
    });

    const TITLE = 'PHASE 2 !!!';

    onMount(() => {
        setTitle(TITLE);
    });
</script>

<div class="relative h-screen w-screen overflow-hidden bg-gray-50">
    <div
        class="pointer-events-none absolute z-50 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500 shadow-lg"
        style="top: {gazeY}px; left: {gazeX}px"
    ></div>

    <div class="flex h-full items-center justify-center">
        <p class="text-2xl font-bold">Phase 2: Eye Tracking Active</p>
    </div>
</div>
