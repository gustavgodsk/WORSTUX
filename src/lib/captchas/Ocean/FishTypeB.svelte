<script lang="ts">
    let { rotation = 0, flipY = false } = $props();
</script>

<div
    class="pointer-events-none absolute origin-center"
    style="transform: rotate({rotation}deg) scaleY({flipY
        ? -1
        : 1}); width: 60px; height: 45px; margin-top: -22px; margin-left: -30px;"
>
    <svg
        class="swimming h-full w-full drop-shadow-md"
        viewBox="0 0 100 80"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M 35 40 L 5 20 L 15 40 L 5 60 Z" fill="#1E90FF" />
        <path d="M 50 50 L 30 65 L 60 55 Z" fill="#00BFFF" />
        <ellipse cx="60" cy="40" rx="30" ry="25" fill="#4169E1" />
        <circle cx="75" cy="30" r="5" fill="white" />
        <circle cx="77" cy="30" r="2.5" fill="black" />
        <ellipse cx="90" cy="45" rx="5" ry="3" fill="#87CEFA" />
    </svg>
</div>

<style>
    @keyframes swimB {
        0% {
            transform: scaleX(0.95);
        }
        50% {
            transform: scaleX(1.05);
        }
        100% {
            transform: scaleX(0.95);
        }
    }
    .swimming {
        animation: swimB 0.8s ease-in-out infinite;
        transform-origin: center;
    }
</style>
