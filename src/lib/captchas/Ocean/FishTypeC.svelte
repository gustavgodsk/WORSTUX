<script lang="ts">
    // Replaced isSwimming with flipY to match the physics engine ecosystem
    let { rotation = 0, flipY = false } = $props();

    const SIZE = 4; // Overall scale multiplier
    const BASE_DIMENSION = 24 * SIZE; // 96px
</script>

<div
    class="pointer-events-none absolute origin-center"
    style="
        width: {BASE_DIMENSION}px; 
        height: {BASE_DIMENSION}px; 
        margin-top: -{BASE_DIMENSION / 2}px; 
        margin-left: -{BASE_DIMENSION / 2}px;
        transform: rotate({rotation}deg) scaleY({flipY ? -1 : 1});
    "
>
    <svg
        class="swimming master-squiggle h-full w-full drop-shadow-md"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
    >
        <defs>
            <radialGradient id="bodyGradient" cx="30%" cy="40%" r="70%">
                <stop offset="0%" stop-color="#FFD700" />
                <stop offset="100%" stop-color="#FFA500" />
            </radialGradient>
        </defs>

        <g id="fish-main">
            <path
                id="fish-body"
                d="M 10,50 C 15,25 60,10 85,35 L 85,65 C 60,90 15,75 10,50 Z"
                fill="url(#bodyGradient)"
            />

            <path
                d="M 35,21 C 30,35 30,65 35,79"
                stroke="white"
                stroke-width="4"
                fill="none"
                stroke-linecap="round"
            />
            <path
                d="M 60,18 C 55,35 55,65 60,82"
                stroke="white"
                stroke-width="4"
                fill="none"
                stroke-linecap="round"
            />

            <circle cx="22" cy="42" r="4" fill="white" />
            <circle cx="23" cy="42" r="2" fill="black" />

            <g id="fish-dorsal">
                <path
                    d="M 30,24 C 40,10 65,5 75,22 L 60,18 Z"
                    fill="#FFA500"
                    stroke="#CC8400"
                    stroke-width="1"
                />
            </g>

            <g id="fish-anal">
                <path
                    d="M 30,76 C 40,90 65,95 75,78 L 60,82 Z"
                    fill="#FFA500"
                    stroke="#CC8400"
                    stroke-width="1"
                />
            </g>

            <g id="fish-tail">
                <path
                    d="M 85,35 C 95,20 105,35 105,50 C 105,65 95,80 85,65 Z"
                    fill="#87CEEB"
                    stroke="#60A5C0"
                    stroke-width="1.5"
                />
            </g>

            <g id="fish-pectoral">
                <path
                    d="M 25,60 C 20,70 25,80 35,75 L 30,65 Z"
                    fill="#87CEEB"
                    stroke="#60A5C0"
                    stroke-width="1"
                />
            </g>
        </g>
    </svg>
</div>

<style>
    /* --- NEW: Master Orientation & Wobble --- */
    /* scaleX(-1) forces the fish to point RIGHT natively to match our math */
    @keyframes overall-wobble {
        0% {
            transform: scaleX(-1) rotate(-5deg);
        }
        50% {
            transform: scaleX(-1) rotate(5deg);
        }
        100% {
            transform: scaleX(-1) rotate(-5deg);
        }
    }
    .master-squiggle {
        animation: overall-wobble 0.6s ease-in-out infinite;
        transform-origin: center;
    }

    /* --- Your Original Independent Part Animations --- */
    @keyframes fin-flutter {
        0%,
        100% {
            transform: rotate(-5deg);
        }
        50% {
            transform: rotate(15deg);
        }
    }

    @keyframes tail-swing {
        0%,
        100% {
            transform: rotate(-10deg);
        }
        50% {
            transform: rotate(10deg);
        }
    }

    @keyframes dorsal-skew {
        0%,
        100% {
            transform: skewX(-2deg);
        }
        50% {
            transform: skewX(2deg);
        }
    }

    @keyframes body-undulate {
        0%,
        100% {
            transform: translateY(0%);
        }
        50% {
            transform: translateY(-1%);
        }
    }

    /* --- Target Specific Parts ONLY when 'swimming' class is present --- */
    .swimming #fish-main {
        animation: body-undulate 2s infinite ease-in-out;
    }

    .swimming #fish-pectoral {
        transform-origin: 25px 60px;
        animation: fin-flutter 0.3s infinite linear;
    }

    .swimming #fish-tail {
        transform-origin: 85px 50px;
        animation: tail-swing 0.6s infinite ease-in-out;
    }

    .swimming #fish-dorsal,
    .swimming #fish-anal {
        transform-origin: 50px 20px;
        animation: dorsal-skew 1s infinite ease-in-out;
    }
</style>
