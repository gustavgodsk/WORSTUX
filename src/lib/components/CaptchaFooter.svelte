<script lang="ts">
    import type { Orchestrator } from '$lib/utils/orchestrator.svelte';

    interface Props {
        orchestrator: Orchestrator;
    }

    let { orchestrator }: Props = $props();
</script>

<div class="flex items-center justify-between border-t border-[#dfdfdf] bg-[#f9f9f9] px-4 py-3">
    <div class="flex gap-4 text-[#737373]">
        <button
            onclick={() => orchestrator.restartCurrent()}
            class="cursor-pointer transition-colors hover:text-[#333]"
            aria-label="Get a new challenge"
        >
            <svg
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
            </svg>
        </button>

        <button
            class="cursor-pointer transition-colors hover:text-[#333]"
            aria-label="Get an audio challenge"
        >
            <svg
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5 10v4a2 2 0 002 2h2.586l3.707 3.707A.996.996 0 0015 19V5a.996.996 0 00-1.707-.707L9.586 8H7a2 2 0 00-2 2z"
                />
            </svg>
        </button>

        <button class="cursor-help transition-colors hover:text-[#333]" aria-label="Help">
            <svg
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
            </svg>
        </button>
    </div>

    <button
        type="button"
        tabindex="-1"
        onclick={(e) => {
            orchestrator.skipCurrent();
            e.currentTarget.blur();
        }}
        class="rounded-xs bg-[#1A73E8] px-6 py-2.5 text-[14px] font-bold tracking-wide text-white uppercase transition-colors hover:bg-[#1557b0] focus:outline-none"
    >
        Give Up
    </button>
</div>
