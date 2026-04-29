<script lang="ts">
    import type { Orchestrator } from '$lib/utils/orchestrator.svelte';
    import CaptchaButton from './CaptchaButton.svelte';

    interface Props {
        orchestrator: Orchestrator;
    }

    let { orchestrator }: Props = $props();
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-100 p-4">
    <main class="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-2xl">
        <h1 class="mb-6 text-3xl font-black tracking-tight text-gray-800">Login Page</h1>

        <form onsubmit={(e) => e.preventDefault()} class="space-y-4">
            <div>
                <label class="mb-1 block text-xs font-bold text-gray-500 uppercase" for="user"
                    >Username</label
                >
                <input
                    id="user"
                    type="text"
                    class="w-full rounded border border-gray-300 bg-gray-50 p-3 outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div>
                <label class="mb-1 block text-xs font-bold text-gray-500 uppercase" for="pass"
                    >Password</label
                >
                <input
                    id="pass"
                    type="password"
                    class="w-full rounded border border-gray-300 bg-gray-50 p-3 outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <CaptchaButton {orchestrator} />

            <button
                type="submit"
                disabled={!orchestrator.isVerified}
                class="w-full cursor-pointer rounded-lg bg-black py-4 font-bold text-white transition-all hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
            >
                Login
            </button>
        </form>
    </main>
</div>
