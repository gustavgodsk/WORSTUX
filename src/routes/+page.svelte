<script lang="ts">
    import { createCaptchaOrchestrator } from '$lib/utils/orchestrator.svelte';
    import { captchaQueue, CaptchaType } from '$lib/captchas/index';
    import LoginScreen from '$lib/components/LoginScreen.svelte';
    import OceanPlayground from '$lib/captchas/Ocean/OceanPlayground.svelte';
    import CaptchaModal from '$lib/components/CaptchaModal.svelte';
    import { fade } from 'svelte/transition';
    import ChickenPlayground from '$lib/captchas/Chick/ChickenPlayground.svelte';

    const orchestrator = createCaptchaOrchestrator(captchaQueue);
</script>

<div class="relative min-h-screen min-w-screen">
    <LoginScreen {orchestrator} />

    {#if orchestrator.currentId === CaptchaType.OCEAN && !orchestrator.isTimeOutModalOpen && orchestrator.isOpen}
        <OceanPlayground {orchestrator} />
    {/if}

    {#if orchestrator.currentId === CaptchaType.CHICK && !orchestrator.isTimeOutModalOpen && orchestrator.isOpen}
        <ChickenPlayground {orchestrator} />
    {/if}

    {#if orchestrator.isOpen}
        <div in:fade>
            <CaptchaModal {orchestrator} />
        </div>
    {/if}
</div>
