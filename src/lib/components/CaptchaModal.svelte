<script lang="ts">
    import type { Orchestrator } from '$lib/utils/orchestrator.svelte';
    import { fade } from 'svelte/transition';
    import TimeoutOverlay from './TimeoutOverlay.svelte';
    import CaptchaFooter from './CaptchaFooter.svelte';
    import { CaptchaType } from '$lib/captchas';

    interface Props {
        orchestrator: Orchestrator;
    }

    let { orchestrator }: Props = $props();

    const Component = $derived(orchestrator.CurrentCaptcha);

    $effect(() => {
        orchestrator.startTimer();
        return () => {
            if (orchestrator.timeLeft > 0) orchestrator.startTimer(0);
        };
    });
    let iframeRef: HTMLIFrameElement | null = $state(null);

    let needsFocusClick = $state(true);

    $effect(() => {
        if (orchestrator.currentId !== CaptchaType.MINECRAFT) {
            needsFocusClick = true;
        }
    });

    function forceGameFocus() {
        needsFocusClick = false;
        if (iframeRef) {
            iframeRef.focus();
            iframeRef.contentWindow?.focus();
        }
    }
</script>

<div
    class="fixed inset-0 z-50 flex h-screen w-screen items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
>
    <div
        class="relative flex h-160 max-h-screen w-200 max-w-screen flex-col overflow-hidden rounded-[3px] bg-white shadow-2xl"
    >
        <TimeoutOverlay {orchestrator} />

        <div class="h-1 w-full bg-gray-200">
            <div
                class="h-full"
                style="width: {orchestrator.timeLeftPercent *
                    100}%; background-color: {orchestrator.timerColor}"
            ></div>
        </div>

        <div class="flex w-full items-start justify-between bg-[#1A73E8] p-6 text-white shadow-sm">
            <div>
                <div class="py-2 text-[28px] leading-none font-bold tracking-wider">
                    {orchestrator.title || 'Security Check'}
                </div>
                <div class="text-[14px] leading-tight">To complete the captcha</div>
            </div>

            <div
                class="rounded bg-black/20 px-2 py-1 font-mono text-xl font-bold tabular-nums"
                class:text-red-300={orchestrator.timeLeft <= 10}
                class:animate-pulse={orchestrator.timeLeft <= 5}
            >
                {orchestrator.timeLeft}s
            </div>
        </div>

        <div class="relative flex flex-1 bg-white p-2">
            {#if !(orchestrator.isTimeOutModalOpen && orchestrator.currentId === CaptchaType.MINECRAFT)}
                <div
                    class="absolute inset-0 z-10 bg-black transition-opacity duration-300"
                    style="opacity: {orchestrator.currentId === CaptchaType.MINECRAFT ? '1' : '0'}; 
               pointer-events: {orchestrator.currentId === CaptchaType.MINECRAFT
                        ? 'auto'
                        : 'none'};"
                >
                    {#if orchestrator.currentId === CaptchaType.MINECRAFT && needsFocusClick}
                        <button
                            type="button"
                            onclick={forceGameFocus}
                            class="absolute inset-0 z-20 flex h-full w-full cursor-pointer flex-col items-center justify-center bg-black/85 p-6 text-center backdrop-blur-sm transition-colors hover:bg-black/95 focus:outline-none"
                        >
                            <h3
                                class="mb-2 animate-pulse font-mono text-2xl font-black tracking-widest text-red-500 uppercase"
                            >
                                Objective
                            </h3>
                            <p class="font-mono text-lg text-white">
                                Kill the ender dragon before time runs out.
                            </p>
                            <p class="mt-12 animate-bounce font-mono text-xs text-gray-500">
                                [ Click anywhere to begin ]
                            </p>
                        </button>
                    {/if}

                    <iframe
                        bind:this={iframeRef}
                        src="/minecraft.html"
                        title="Minecraft"
                        class="h-full w-full border-none"
                        allow="autoplay; fullscreen; keyboard"
                        scrolling="no"
                    ></iframe>
                </div>
            {/if}

            {#key orchestrator.restartKey}
                <div class="h-full w-full" in:fade>
                    <Component
                        onsuccess={() => orchestrator.handleSuccess()}
                        setTitle={orchestrator.setTitle}
                    />
                </div>
            {/key}
        </div>
        <CaptchaFooter {orchestrator} />
    </div>
</div>
