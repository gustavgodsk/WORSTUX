<script lang="ts">
    import type { Orchestrator } from '$lib/utils/orchestrator.svelte';

    let { orchestrator }: { orchestrator: Orchestrator } = $props();
</script>

{#if orchestrator.isTimeOutModalOpen}
    <div
        class="absolute inset-0 z-200 flex flex-col items-center justify-center bg-red-900/95 p-6 text-center text-white backdrop-blur-sm"
    >
        <div class="mb-4 text-5xl">⏱️</div>
        <h2 class="mb-2 text-2xl font-bold">You did not complete the Captcha in time</h2>
        <p class="mb-6 text-sm text-red-200">Please complete a Captcha to prove you are human</p>

        <div class="flex w-full max-w-50 flex-col gap-3">
            <button
                onclick={() => orchestrator.skipCurrent()}
                class="rounded-xs bg-[#1A73E8] px-4 py-2 font-bold text-white transition-colors hover:bg-[#1557b0]"
            >
                Try a different Captcha
            </button>
            <button
                onclick={() => orchestrator.restartCurrent()}
                class="mt-2 text-xs text-red-300 transition-colors hover:text-white hover:underline"
            >
                Retry Current
            </button>
        </div>
    </div>
{/if}
