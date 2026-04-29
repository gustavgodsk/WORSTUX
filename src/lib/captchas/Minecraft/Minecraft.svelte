<script lang="ts">
    import { onMount } from 'svelte';
    import type { CaptchaProps } from '../types';

    let { setTitle }: CaptchaProps = $props();

    onMount(() => {
        setTitle('Slay the Ender Dragon');
    });
</script>

<div class="flex h-75 w-full items-center justify-center bg-black">
    <p class="text-xs text-white">Game capturing focus...</p>
</div>
