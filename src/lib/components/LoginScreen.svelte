<script lang="ts">
    import type { Orchestrator } from '$lib/utils/orchestrator.svelte';
    import CaptchaButton from './CaptchaButton.svelte';
    import explodeGif from '$lib/assets/explode.gif';

    interface Props {
        orchestrator: Orchestrator;
    }

    let { orchestrator }: Props = $props();
    let loginAttempted = $state(false);
    let username = $state('clubpenguinguy642');
    let password = $state('correcthorsebatterystaplee');
    let attemptedPassword = $state('');
    let realPassword = 'ct08d50YxdYeoN2z9C';
    type ExplosionBurst = {
        id: number;
        x: number;
        y: number;
        rotate: number;
        scale: number;
    };

    let explosionBursts = $state<ExplosionBurst[]>([]);
    let explosionTimeouts = $state<ReturnType<typeof setTimeout>[]>([]);

    const createBurst = (seed: number): ExplosionBurst => {
        const rand = () => {
            const value = Math.sin(seed++) * 10000;
            return value - Math.floor(value);
        };
        return {
            id: Date.now() + seed,
            x: Math.round((rand() * 2 - 1) * 220),
            y: Math.round((rand() * 2 - 1) * 180),
            rotate: Math.round((rand() * 2 - 1) * 30),
            scale: Number((0.85 + rand() * 0.6).toFixed(2))
        };
    };

    const triggerUglyExplosion = () => {
        explosionTimeouts.forEach((timeoutId) => clearTimeout(timeoutId));
        explosionTimeouts = [];
        explosionBursts = [];

    const totalDuration = 5_000;
    const burstsPerGroup = 1;
    const groupInterval = 60;
    const withinGroupDelay = 0;
        const groups = Math.ceil(totalDuration / groupInterval);
        let burstIndex = 0;

        for (let group = 0; group < groups; group += 1) {
            for (let burst = 0; burst < burstsPerGroup; burst += 1) {
                const timeoutId = setTimeout(() => {
                    explosionBursts = [...explosionBursts, createBurst(Date.now() + burstIndex)];
                }, group * groupInterval + burst * withinGroupDelay);
                explosionTimeouts = [...explosionTimeouts, timeoutId];
                burstIndex += 1;
            }
        }

        const cleanupTimeout = setTimeout(() => {
            explosionBursts = [];
        }, totalDuration + 1200);
        explosionTimeouts = [...explosionTimeouts, cleanupTimeout];
    };
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-100 p-4">
    <main class="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-2xl">
        <h1 class="mb-6 text-3xl font-black tracking-tight text-gray-800">Login Page</h1>

        <form
            onsubmit={(e) => {
                e.preventDefault();
                attemptedPassword = password;
                loginAttempted = true;
                if (password === realPassword) {
                    triggerUglyExplosion();
                }
            }}
            class="space-y-4"
        >
            <div>
                <label class="mb-1 block text-xs font-bold text-gray-500 uppercase" for="user"
                    >Username</label
                >
                <input
                    id="user"
                    type="text"
                    class="w-full rounded border border-gray-300 bg-gray-50 p-3 outline-none focus:ring-2 focus:ring-blue-500"
                    bind:value={username}
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
                    bind:value={password}
                />
                {#if loginAttempted}
                    {#if attemptedPassword === realPassword}
                        <p class="mt-2 text-sm font-semibold text-red-600">
                            Wrong username.
                        </p>
                    {:else}
                        <p class="mt-2 text-sm font-semibold text-red-600">
                            Wrong password.
                        </p>
                        <p class="mt-2 text-sm font-semibold text-red-600">
                            Correct password for clubpenguinguy642 is: {realPassword}
                        </p>
                    {/if}
                {/if}
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

<div class="fixed inset-0 pointer-events-none z-50" aria-hidden="true">
    {#each explosionBursts as burst (burst.id)}
        <img
            src={explodeGif}
            alt=""
            class="absolute left-1/2 top-1/2 w-48 -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_0_12px_rgba(0,0,0,0.6)]"
            style={`transform: translate(calc(-50% + ${burst.x + 60}px), calc(-50% + ${burst.y}px)) rotate(${burst.rotate}deg) scale(${burst.scale}); filter: saturate(240%) contrast(160%);`}
        />
    {/each}
</div>
