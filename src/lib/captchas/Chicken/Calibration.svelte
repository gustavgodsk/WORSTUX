<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import type { CaptchaProps } from '../types';
	import { Chicken } from '../../../../chicken/Chicken';

	type Egg = { id: number; x: number; y: number };

	let { setTitle, onsuccess }: CaptchaProps = $props();

	let permissionGranted = $state(false);
	let gaze = $state({ x: 0, y: 0 });
	let calibrated = $state(new Set<number>());
	let chickens = $state<any[]>([]);
	let canvasEl = $state<HTMLCanvasElement | null>(null);

	let ctx: CanvasRenderingContext2D;

	const eggs: Egg[] = [
		{ id: 0, x: 0.2, y: 0.2 },
		{ id: 1, x: 0.8, y: 0.2 },
		{ id: 2, x: 0.5, y: 0.5 },
		{ id: 3, x: 0.2, y: 0.8 },
		{ id: 4, x: 0.8, y: 0.8 }
	];

	function handleEggClick(egg: Egg) {
		if (calibrated.has(egg.id)) return;

		calibrated = new Set(calibrated).add(egg.id);

		const x = egg.x * canvasEl!.width;
		const y = egg.y * canvasEl!.height;

		chickens = [...chickens, new Chicken(x, y)];

		if (calibrated.size === eggs.length) {
			setTimeout(() => onsuccess(), 800);
		}
	}
</script>

<canvas bind:this={canvasEl}></canvas>

{#each eggs as egg}
	{#if !calibrated.has(egg.id)}
		<button
			class="egg-hitbox"
			style="left:{egg.x * 100}%; top:{egg.y * 100}%"
			onclick={() => handleEggClick(egg)}
		></button>
	{/if}
{/each}