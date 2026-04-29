<script lang="ts">
    import { onMount } from 'svelte';

    let { setTitle } = $props();

    let gazeX = $state(0);
    let gazeY = $state(0);

    $effect(() => {
        window.webgazer.setGazeListener((data, elapsedTime) => {
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

<div>
    <p>phase 2</p>
</div>
