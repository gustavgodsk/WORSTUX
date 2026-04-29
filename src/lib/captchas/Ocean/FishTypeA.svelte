<script lang="ts">
    let { rotation = 0, flipY = false } = $props();
</script>

<div
    class="pointer-events-none absolute origin-center"
    style="transform: rotate({rotation}deg) scaleY({flipY
        ? -1
        : 1}); width: 50px; height: 30px; margin-top: -15px; margin-left: -25px;"
>
    <svg
        class="swimming h-full w-full drop-shadow-md"
        viewBox="0 0 100 60"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M 30 30 L 5 15 L 10 30 L 5 45 Z" fill="#FF7F50" />
        <path d="M 40 20 L 50 5 L 60 20 Z" fill="#FF6347" />
        <path d="M 40 40 L 50 55 L 60 40 Z" fill="#FF6347" />
        <ellipse cx="60" cy="30" rx="35" ry="15" fill="#FF4500" />
        <circle cx="80" cy="25" r="4" fill="white" />
        <circle cx="82" cy="25" r="2" fill="black" />
    </svg>
</div>

<style>
    @keyframes swimA {
        0% {
            transform: scaleY(0.95) skewY(-3deg);
        }
        50% {
            transform: scaleY(1.05) skewY(3deg);
        }
        100% {
            transform: scaleY(0.95) skewY(-3deg);
        }
    }
    .swimming {
        animation: swimA 0.4s ease-in-out infinite;
        transform-origin: left center;
    }
</style>
