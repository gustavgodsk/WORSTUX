import Example from './Example/Example.svelte';
import Ocean from './Ocean/Ocean.svelte';
import Minecraft from './Minecraft/Minecraft.svelte'; // Or whatever your file is named
import CHICK from './Chick/Main.svelte'; // Or whatever your file is named

export enum CaptchaType {
    EXAMPLE = 'EXAMPLE',
    OCEAN = 'OCEAN',
    MINECRAFT = 'MINECRAFT',
    CHICK = 'CHICK'
}

export const captchaQueue = [
    //{ id: CaptchaType.EXAMPLE, component: Example },
    { id: CaptchaType.CHICK, component: CHICK },
    { id: CaptchaType.OCEAN, component: Ocean },
    { id: CaptchaType.MINECRAFT, component: Minecraft },
];
