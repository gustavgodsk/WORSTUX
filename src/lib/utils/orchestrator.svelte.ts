import type { Component } from 'svelte';

type CaptchaItem = { id: string; component: Component<any> };

export type Orchestrator = ReturnType<typeof createCaptchaOrchestrator>;

export function createCaptchaOrchestrator(captchaQueue: CaptchaItem[]) {
    let isOpen = $state(false);
    let isSpinning = $state(false);
    let currentIndex = $state(0);
    let isVerified = $state(false);
    let title = $state('');

    let restartKey = $state(0);
    let timeLeft = $state(0);
    let isTimeOutModalOpen = $state(false);
    let timerInterval: ReturnType<typeof setInterval> | null = null;

    let CurrentCaptcha = $derived(captchaQueue[currentIndex].component);
    let currentId = $derived(captchaQueue[currentIndex].id);

    const SPINNING_TIME = 1000;
    const DEFAULT_TIME = 30 * 60;
    let startTime = $state(DEFAULT_TIME);

    let timeLeftPercent = $derived(timeLeft / startTime);

    let timerColor = $derived(() => {
        if (timeLeftPercent < 0.30) return "#ff2600";
        if (timeLeftPercent < 0.70) return "#ffa500";
        return "#2eff00";
    });

    function stopTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }

    return {
        get isOpen() { return isOpen; },
        get isSpinning() { return isSpinning; },
        get isVerified() { return isVerified; },
        get CurrentCaptcha() { return CurrentCaptcha; },
        get currentId() { return currentId; }, // NEW: Expose the active ID
        get progress() { return `${currentIndex + 1} / ${captchaQueue.length}`; },
        get currentIndex() { return currentIndex; },
        get totalCaptchas() { return captchaQueue.length; },
        get title() { return title; },

        get restartKey() { return restartKey; },
        get timeLeft(): number { return Math.floor((timeLeft / 60)); },
        get timeLeftPercent() { return timeLeftPercent; },
        get isTimeOutModalOpen() { return isTimeOutModalOpen; },
        get timerColor() { return timerColor(); },

        trigger() {
            isSpinning = true;
            setTimeout(() => {
                isSpinning = false;
                isOpen = true;
            }, SPINNING_TIME);
        },

        setTitle(newTitle: string) { title = newTitle; },
        closeModal() { isOpen = false; stopTimer(); },

        startTimer(seconds: number = DEFAULT_TIME) {
            stopTimer();
            timeLeft = seconds;
            startTime = seconds;
            timerInterval = setInterval(() => {
                timeLeft--;
                if (timeLeft <= 0) this.handleTimeOut();
            }, 1000 / 60);
        },

        handleTimeOut() {
            stopTimer();
            isTimeOutModalOpen = true;
        },

        restartCurrent() {
            restartKey++;
            isTimeOutModalOpen = false;
            this.startTimer(DEFAULT_TIME);
        },

        skipCurrent() {
            isTimeOutModalOpen = false;
            this.handleSuccess();
        },

        handleSuccess() {
            stopTimer();
            if (currentIndex < captchaQueue.length - 1) {
                currentIndex++;
                restartKey++;
                this.startTimer(DEFAULT_TIME);
            } else {
                isVerified = true;
                isOpen = false;
            }
        }
    };
}
