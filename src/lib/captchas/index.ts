import Example from './Example/Example.svelte';
import Ocean from './Ocean/Ocean.svelte';
import Minecraft from './Minecraft/Minecraft.svelte'; // Or whatever your file is named
import Pizza from './Pizza/Pizza.svelte';

export enum CaptchaType {
    EXAMPLE = 'EXAMPLE',
    OCEAN = 'OCEAN',
    MINECRAFT = 'MINECRAFT',
    PIZZA = 'PIZZA'
}

export const captchaQueue = [
    { id: CaptchaType.EXAMPLE, component: Example },
    { id: CaptchaType.OCEAN, component: Ocean },
    { id: CaptchaType.MINECRAFT, component: Minecraft },
    { id: CaptchaType.PIZZA, component: Pizza }
];
