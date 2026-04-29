// types.ts
export type CaptchaProps = {
    onsuccess: () => void;
    setTitle: (title: string) => void;
};

// A letter that has been ripped out of the DOM box onto the global layer
export type HeistedLetter = {
    id: number;
    text: string;
    globalX: number; // position fixed relative to viewport
    globalY: number;
    rotation: number;
    isGone: boolean; // Has it reached the colony?
};
