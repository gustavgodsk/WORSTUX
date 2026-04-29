// src/lib/captchas/Ocean/state.svelte.ts

export type GlobalLetter = {
    id: number;
    text: string;
    globalX: number;
    globalY: number;
    isDragged: boolean;
    isGone: boolean;
    // NEW: Retain the visual distortion
    font: string;
    cssTransform: string;
};

export type FishEntity = {
    id: number;
    type: 1 | 2 | 3; // NEW: Added type 3 support
    x: number;
    y: number;
    rotation: number;
    flipY: boolean;
    speed: number;

    isInputThief: boolean;
    targetInputIndex: number | null;

    targetLetterId: number | null;
    targetText: string;
    targetX: number;
    targetY: number;
    // NEW: So the fish knows what the text looks like when it grabs it
    targetFont: string;
    targetTransform: string;

    exitX: number;
    exitY: number;
    hasLetter: boolean;
    isReturning: boolean;
};

class OceanState {
    letters = $state<GlobalLetter[]>([]);
    fishes = $state<FishEntity[]>([]);
    heistedLetterIds = $state<number[]>([]);
    inputCode = $state('');

    get activeLetters() { return this.letters.filter(l => !l.isGone); }
    get activeFishes() { return this.fishes; }

    addLetter(letter: GlobalLetter) { this.letters.push(letter); }
    addFish(fish: FishEntity) { this.fishes.push(fish); }

    updateLetterPos(id: number, x: number, y: number) {
        const letter = this.letters.find(l => l.id === id);
        if (letter) {
            letter.globalX = x;
            letter.globalY = y;
        }
    }

    setLetterDragged(id: number, dragged: boolean) {
        const letter = this.letters.find(l => l.id === id);
        if (letter) {
            letter.isDragged = dragged;
            if (dragged) {
                const holdingFish = this.fishes.find(f => f.targetLetterId === id && f.hasLetter);
                if (holdingFish) {
                    holdingFish.hasLetter = false;
                    holdingFish.targetLetterId = null;
                    holdingFish.isReturning = true;
                }
            }
        }
    }

    markLetterGone(id: number) {
        const letter = this.letters.find(l => l.id === id);
        if (letter) letter.isGone = true;
    }

    removeFish(id: number) {
        this.fishes = this.fishes.filter(f => f.id !== id);
    }

    // UPDATED to accept font and transform
    grabLetter(id: number, text: string, x: number, y: number, font: string, cssTransform: string) {
        if (!this.heistedLetterIds.includes(id)) {
            this.heistedLetterIds.push(id);
        }
        this.letters.push({
            id, text, globalX: x, globalY: y, isDragged: false, isGone: false, font, cssTransform
        });
    }

    stealFromInput(fishId: number, x: number, y: number, index: number) {
        if (this.inputCode.length === 0) return;
        const safeIndex = Math.max(0, Math.min(index, this.inputCode.length - 1));
        const stolenChar = this.inputCode[safeIndex];
        this.inputCode = this.inputCode.slice(0, safeIndex) + this.inputCode.slice(safeIndex + 1);

        const newLetterId = Date.now() + Math.random();

        // Input letters are normal font when stolen
        this.letters.push({
            id: newLetterId,
            text: stolenChar,
            globalX: x,
            globalY: y,
            isDragged: false,
            isGone: false,
            font: "16px monospace",
            cssTransform: "rotate(0deg)"
        });

        const fish = this.fishes.find(f => f.id === fishId);
        if (fish) {
            fish.hasLetter = true;
            fish.targetLetterId = newLetterId;
        }
    }

    reset() {
        this.letters = [];
        this.fishes = [];
        this.heistedLetterIds = [];
        this.inputCode = '';
    }
}

export const oceanState = new OceanState();
