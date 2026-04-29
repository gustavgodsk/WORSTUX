<script lang="ts">
    import { onMount } from 'svelte';
    import type { CaptchaProps } from '../types';

    let { setTitle }: CaptchaProps = $props();

    const TITLE = 'Example Captcha';

    onMount(() => {
        setTitle(TITLE);
    });
</script>

<div>
    <p>Here is my example captcha</p>
</div>
