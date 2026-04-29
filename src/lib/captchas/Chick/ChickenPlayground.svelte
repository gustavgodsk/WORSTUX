<script lang="ts">
    import type { Orchestrator } from '$lib/utils/orchestrator.svelte';
    import Phase1 from './Phase1.svelte';
    import Phase2 from './Phase2.svelte';

    interface Props {
        orchestrator: Orchestrator;
    }
    let currentPhase = $state('calibration');

    let { orchestrator }: Props = $props();

    function handleCalibrationComplete() {
        currentPhase = 'tracking';
    }
</script>

<div class="fixed inset-0 z-[100] overflow-hidden bg-[#87CEEB]">
    <Phase2 setTitle={orchestrator.setTitle} />
    <!-- {#if currentPhase === 'calibration'}
    <Phase1 onComplete={handleCalibrationComplete} setTitle={orchestrator.setTitle} />
    {:else if currentPhase === 'tracking'}
    {/if} -->
</div>
