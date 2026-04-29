<script lang="ts">
    let { orchestrator } = $props();
</script>

<div class="py-4">
    <button
        type="button"
        onclick={() => orchestrator.trigger()}
        disabled={orchestrator.isVerified || orchestrator.isSpinning}
        class="flex h-19.5 w-full cursor-pointer items-center justify-between rounded-[3px] border border-[#d3d3d3] bg-[#f9f9f9] px-3 text-left font-sans shadow-[0_0_4px_1px_rgba(0,0,0,0.08)] transition-all disabled:cursor-default"
    >
        <div class="flex items-center gap-3">
            {#if orchestrator.isVerified}
                <div class="flex h-7 w-7 items-center justify-center">
                    <svg
                        class="h-8 w-8 text-[#009E5F]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2.5"
                    >
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
            {:else if orchestrator.isSpinning}
                <div class="flex h-7 w-7 items-center justify-center">
                    <div
                        class="h-6 w-6 animate-spin rounded-full border-[3px] border-[#e0e0e0] border-t-[#4A90E2]"
                    ></div>
                </div>
            {:else}
                <div
                    class="h-7 w-7 rounded-xs border-2 border-[#c1c1c1] bg-white transition-colors hover:border-[#b2b2b2] hover:shadow-[0_0_2px_1px_rgba(0,0,0,0.1)]"
                ></div>
            {/if}
            <span class="text-[14px] font-normal text-[#222]">I'm not a robot</span>
        </div>

        <div class="flex flex-col items-center justify-center pt-1">
            <img
                src="https://www.gstatic.com/recaptcha/api2/logo_48.png"
                alt="reCAPTCHA logo"
                class="h-8 w-8 opacity-90"
            />
            <div class="mt-0.5 flex flex-col items-center text-[10px] leading-3 text-[#555]">
                <span class="font-normal tracking-wide">reCAPTCHA</span>
                <div class="flex gap-1 text-[8px] opacity-80">
                    <span class="hover:underline">Privacy</span>
                    <span>-</span>
                    <span class="hover:underline">Terms</span>
                </div>
            </div>
        </div>
    </button>
</div>
