<script>
    import { onMount } from 'svelte';

    let { onComplete, setTitle } = $props();

    let clickCount = $state(0);
    const REQUIRED_CLICKS = 9;

    $effect(() => {
        window.saveDataAcrossSessions = false;

        window.webgazer.begin();

        return () => {
            window.webgazer.removeMouseEventListeners();
        };
    });

    function handleScreenClick() {
        clickCount++;
        if (clickCount >= REQUIRED_CLICKS) {
            onComplete();
        }
    }

    const TITLE = 'PHASE 1 !!!';

    onMount(() => {
        setTitle(TITLE);
    });
</script>

<div>
    <p>phase 1</p>
</div>
