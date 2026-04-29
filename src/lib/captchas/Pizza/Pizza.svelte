<script lang="ts">
    import { onMount } from 'svelte';
    import type { CaptchaProps } from '../types';

    let { setTitle }: CaptchaProps = $props();
    const TITLE = 'Eat all the pizza (there is a lot of it)';

    // --- Layout ---
    const CELL = 22;
    const COLS = 19;
    const ROWS = 19;
    const W = COLS * CELL;
    const H = ROWS * CELL;

    // Frames to cross one cell
    const PLAYER_FRAMES = 7;
    const GHOST_FRAMES  = 11;
    const SCARED_FRAMES = 18;
    const POWER_DURATION = 280; // frames scared
    // Ghosts release from house one by one
    const GHOST_RELEASE = [180, 360, 540, 720]; // frame each ghost exits

    // --- Maze definition (19×19). 0=wall 1=dot 2=open 3=power pellet 4=ghost-house-door 5=ghost-house-inside ---
    // prettier-ignore
    const MAZE_DEF = [
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,3,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,3,0],
        [0,1,0,0,1,0,0,0,1,0,1,0,0,0,1,0,0,1,0],
        [0,1,0,0,1,0,0,0,1,0,1,0,0,0,1,0,0,1,0],
        [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
        [0,1,0,0,1,0,1,0,0,0,0,0,1,0,1,0,0,1,0],
        [0,1,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,1,0],
        [0,0,0,0,1,0,0,0,2,0,2,0,0,0,1,0,0,0,0],
        [0,0,0,0,1,0,2,2,2,2,2,2,2,0,1,0,0,0,0],
        [0,0,0,0,1,0,2,5,5,4,5,5,2,0,1,0,0,0,0],
        [0,0,0,0,1,0,2,5,5,5,5,5,2,0,1,0,0,0,0],
        [0,0,0,0,1,0,2,2,2,2,2,2,2,0,1,0,0,0,0],
        [0,0,0,0,1,0,2,0,0,0,0,0,2,0,1,0,0,0,0],
        [0,1,1,1,1,1,1,1,1,2,1,1,1,1,1,1,1,1,0],
        [0,1,0,0,1,0,0,0,1,0,1,0,0,0,1,0,0,1,0],
        [0,3,1,0,1,1,1,1,1,1,1,1,1,1,1,0,1,3,0],
        [0,0,1,0,1,0,1,0,0,0,0,0,1,0,1,0,1,0,0],
        [0,1,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,1,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    ];

    type Dir = { r: number; c: number };
    const DIRS: Dir[] = [{ r:0,c:1 },{ r:0,c:-1 },{ r:-1,c:0 },{ r:1,c:0 }];

    function cellWalkable(row: number, col: number, forGhost = false): boolean {
        if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return false;
        const v = MAZE_DEF[row][col];
        if (v === 0) return false;
        if (v === 4) return forGhost; // door: only ghosts pass
        if (v === 5) return forGhost; // inside house
        return true;
    }

    type Entity = {
        // current grid cell
        row: number; col: number;
        // direction currently moving
        dr: number; dc: number;
        // queued next direction
        nextDr: number; nextDc: number;
        // interpolation progress 0→1 across current cell
        t: number;
        // pixel position (derived, for drawing)
        px: number; py: number;
        frames: number; // frames per cell
    };

    type Ghost = Entity & {
        id: number;
        scared: boolean;
        scaredTimer: number;
        released: boolean;
        // for house exit: move straight up to row 8
        exitMode: boolean;
    };

    type Dot = { row: number; col: number; big: boolean; eaten: boolean };

    let canvas: HTMLCanvasElement;
    let animId: number;
    let maze: number[][] = [];
    let dots: Dot[] = [];
    let player: Entity & { mouthAngle: number; mouthDir: 1|-1; invincible: number };
    let ghosts: Ghost[] = [];
    let gameState = $state<'start'|'playing'|'dead'|'win'>('start');
    let score      = $state(0);
    let lives      = $state(3);
    let totalPizza = $state(0);
    let eatenPizza = $state(0);
    let highScore  = $state(0);
    let frame      = 0;

    // --- Build maze + dots ---
    const PIZZA_COUNT = 35;

    function buildMaze() {
        maze = MAZE_DEF.map(row => [...row]);
        dots = [];
        // Collect all walkable dot positions (maze cells = 1 or 3)
        const allDotCells: { row: number; col: number; big: boolean }[] = [];
        for (let r = 0; r < ROWS; r++)
            for (let c = 0; c < COLS; c++) {
                if (maze[r][c] === 1) allDotCells.push({ row: r, col: c, big: false });
                if (maze[r][c] === 3) allDotCells.push({ row: r, col: c, big: true });
            }

        // Pick 35 random positions to be pizza (big=true), rest stay as small dots
        // Always keep the 4 corner power pellets (maze[r][c]===3) as pizza
        const pizzaIndices = new Set<number>();
        // seed with existing power pellets
        allDotCells.forEach((d, i) => { if (d.big) pizzaIndices.add(i); });
        // fill remaining pizza slots with random picks
        const nonPellet = allDotCells.map((_, i) => i).filter(i => !pizzaIndices.has(i));
        // shuffle
        for (let i = nonPellet.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [nonPellet[i], nonPellet[j]] = [nonPellet[j], nonPellet[i]];
        }
        const remaining = PIZZA_COUNT - pizzaIndices.size;
        nonPellet.slice(0, Math.max(0, remaining)).forEach(i => pizzaIndices.add(i));

        for (let i = 0; i < allDotCells.length; i++) {
            const { row, col } = allDotCells[i];
            dots.push({ row, col, big: pizzaIndices.has(i), eaten: false });
        }
        totalPizza = dots.length;
        eatenPizza = 0;
    }

    function entityPixel(e: Entity): { px: number; py: number } {
        const fromR = e.row, fromC = e.col;
        const toR = e.row + e.dr, toC = e.col + e.dc;
        const t = e.t;
        return {
            px: (fromC + e.dc * t) * CELL + CELL / 2,
            py: (fromR + e.dr * t) * CELL + CELL / 2,
        };
    }

    function findSpawnCell(prefR: number, prefC: number, forGhost = false): { row: number; col: number } {
        for (let radius = 0; radius < Math.max(ROWS, COLS); radius++)
            for (let dr = -radius; dr <= radius; dr++)
                for (let dc = -radius; dc <= radius; dc++) {
                    if (Math.abs(dr) !== radius && Math.abs(dc) !== radius) continue;
                    const r = prefR + dr, c = prefC + dc;
                    if (cellWalkable(r, c, forGhost)) return { row: r, col: c };
                }
        return { row: 1, col: 1 };
    }

    function makeEntity(row: number, col: number, frames: number): Entity {
        return { row, col, dr: 0, dc: 0, nextDr: 0, nextDc: 0, t: 0, px: col*CELL+CELL/2, py: row*CELL+CELL/2, frames };
    }

    function initGame() {
        buildMaze();
        score = 0; lives = 3; frame = 0;
        const sp = findSpawnCell(15, 9);
        player = { ...makeEntity(sp.row, sp.col, PLAYER_FRAMES), mouthAngle: 0.25, mouthDir: 1, invincible: 0, nextDr: 0, nextDc: 0 };

        // Ghosts start inside house
        const houseRows = [9, 10, 9, 10];
        const houseCols = [8, 8, 10, 10];
        ghosts = [0,1,2,3].map(i => ({
            ...makeEntity(houseRows[i], houseCols[i], GHOST_FRAMES),
            id: i,
            scared: false, scaredTimer: 0,
            released: false, exitMode: false,
            dr: 0, dc: i < 2 ? 1 : -1, nextDr: 0, nextDc: 0,
        }));
        gameState = 'playing';
    }

    // --- Grid-based movement ---
    // Advance entity one frame along its current cell-to-cell move
    function stepEntity(e: Entity, forGhost = false, allowQueued = true): void {
        // If stationary, try to start moving
        if (e.dr === 0 && e.dc === 0) {
            if (allowQueued && (e.nextDr !== 0 || e.nextDc !== 0)) {
                const nr = e.row + e.nextDr, nc = e.col + e.nextDc;
                if (cellWalkable(nr, nc, forGhost)) {
                    e.dr = e.nextDr; e.dc = e.nextDc;
                }
            }
            const pos = entityPixel(e);
            e.px = pos.px; e.py = pos.py;
            return;
        }

        e.t += 1 / e.frames;

        if (e.t >= 1) {
            // Arrived at next cell
            e.row += e.dr; e.col += e.dc;
            e.t = 0;

            // Tunnel wrap
            if (e.col < 0) e.col = COLS - 1;
            if (e.col >= COLS) e.col = 0;

            // Try queued direction
            if (allowQueued && (e.nextDr !== 0 || e.nextDc !== 0)) {
                const nr = e.row + e.nextDr, nc = e.col + e.nextDc;
                if (cellWalkable(nr, nc, forGhost)) {
                    e.dr = e.nextDr; e.dc = e.nextDc;
                }
            }
            // Can we continue in current direction?
            const nr = e.row + e.dr, nc = e.col + e.dc;
            if (!cellWalkable(nr, nc, forGhost)) {
                e.dr = 0; e.dc = 0;
            }
        }

        const pos = entityPixel(e);
        e.px = pos.px; e.py = pos.py;
    }

    function chooseGhostDir(g: Ghost): void {
        // At start of new cell, pick next direction
        if (g.t !== 0) return; // only decide when freshly arrived

        const options = DIRS.filter(d => {
            if (d.r === -g.dr && d.c === -g.dc) return false; // no reversing
            return cellWalkable(g.row + d.r, g.col + d.c, true);
        });
        if (options.length === 0) {
            // Dead end — reverse
            g.nextDr = -g.dr; g.nextDc = -g.dc;
            return;
        }

        let picked: Dir;
        if (g.scared) {
            picked = options[Math.floor(Math.random() * options.length)];
        } else {
            // Chase: prefer direction that reduces Manhattan distance to player
            picked = options.reduce((best, d) => {
                const bDist = Math.abs(player.row-(g.row+best.r)) + Math.abs(player.col-(g.col+best.c));
                const cDist = Math.abs(player.row-(g.row+d.r)) + Math.abs(player.col-(g.col+d.c));
                return cDist < bDist ? d : best;
            });
        }
        g.nextDr = picked.r; g.nextDc = picked.c;
    }

    function moveGhost(g: Ghost): void {
        if (!g.released) return;

        if (g.exitMode) {
            // Move toward exit row (row 8, col 9)
            const targetR = 8, targetC = 9;
            if (g.row === targetR && g.col === targetC) {
                g.exitMode = false;
                g.dr = 0; g.dc = -1; // head left once out
            } else {
                // Step toward target
                const dr = Math.sign(targetR - g.row);
                const dc = Math.sign(targetC - g.col);
                g.nextDr = dr !== 0 ? dr : 0;
                g.nextDc = dr !== 0 ? 0 : dc;
            }
        } else {
            chooseGhostDir(g);
        }

        stepEntity(g, true);

        if (g.scared) {
            g.scaredTimer--;
            if (g.scaredTimer <= 0) g.scared = false;
        }
    }

    function releaseGhosts(): void {
        ghosts.forEach((g, i) => {
            if (!g.released && frame >= GHOST_RELEASE[i]) {
                g.released = true;
                g.exitMode = true;
                g.dr = -1; g.dc = 0; // start moving up toward door
            }
        });
    }

    // --- Update ---
    function update(): void {
        if (gameState !== 'playing') return;
        frame++;

        // Invincibility countdown
        player.invincible = Math.max(0, player.invincible - 1);

        // Release ghosts on schedule
        releaseGhosts();

        // Mouth animation (only when moving)
        if (player.dr !== 0 || player.dc !== 0) {
            player.mouthAngle += 0.08 * player.mouthDir;
            if (player.mouthAngle > 0.38) player.mouthDir = -1;
            if (player.mouthAngle < 0.02) player.mouthDir = 1;
        }

        // Move player
        stepEntity(player);

        // Eat dots
        for (const d of dots) {
            if (d.eaten) continue;
            if (d.row === player.row && d.col === player.col) {
                d.eaten = true;
                eatenPizza++;
                score += d.big ? 50 : 10;
                if (d.big) ghosts.forEach(g => { if (g.released) { g.scared = true; g.scaredTimer = POWER_DURATION; } });
            }
        }

        // Move ghosts + collisions
        for (const g of ghosts) {
            moveGhost(g);
            if (!g.released) continue;

            // Collision with player (grid-cell based)
            const hit = g.row === player.row && g.col === player.col;
            if (hit) {
                if (g.scared) {
                    g.scared = false; g.scaredTimer = 0;
                    const sp = findSpawnCell(9, 9, true);
                    g.row = sp.row; g.col = sp.col;
                    g.t = 0; g.dr = 0; g.dc = 0;
                    g.released = false; g.exitMode = false;
                    // re-schedule this ghost to release later
                    const releaseDelay = 240;
                    GHOST_RELEASE[g.id] = frame + releaseDelay;
                    score += 200;
                } else if (player.invincible === 0) {
                    lives--;
                    player.invincible = 150;
                    if (lives <= 0) {
                        gameState = 'dead';
                        highScore = Math.max(highScore, score);
                    } else {
                        const sp = findSpawnCell(15, 9);
                        player.row = sp.row; player.col = sp.col;
                        player.dr = 0; player.dc = 0; player.t = 0;
                    }
                }
            }
        }

        if (dots.every(d => d.eaten)) {
            gameState = 'win';
            highScore = Math.max(highScore, score);
        }
    }

    // --- Draw ---
    function draw(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, W, H);

        // Walls
        for (let r = 0; r < ROWS; r++)
            for (let c = 0; c < COLS; c++) {
                if (maze[r][c] === 0) {
                    ctx.fillStyle = '#1a3a6b';
                    ctx.fillRect(c*CELL, r*CELL, CELL, CELL);
                    ctx.strokeStyle = '#2a5ca8';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(c*CELL+0.5, r*CELL+0.5, CELL-1, CELL-1);
                }
                // Ghost door visual
                if (maze[r][c] === 4) {
                    ctx.fillStyle = '#e8a020';
                    ctx.fillRect(c*CELL+2, r*CELL+CELL/2-2, CELL-4, 4);
                }
            }

        // Dots
        for (const d of dots) {
            if (d.eaten) continue;
            const x = d.col * CELL + CELL/2;
            const y = d.row * CELL + CELL/2;
            if (d.big) {
                ctx.font = '16px serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('🍕', x, y);
            } else {
                ctx.fillStyle = '#e8a020';
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, Math.PI*2);
                ctx.fill();
            }
        }

        // Ghosts
        if (ghosts.length > 0) {
            ctx.font = '18px serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            for (const g of ghosts) {
                if (!g.released) continue;
                if (g.scared) {
                    const flash = g.scaredTimer < 80 && Math.floor(g.scaredTimer / 10) % 2 === 0;
                    ctx.fillText(flash ? '👻' : '💙', g.px, g.py);
                } else {
                    ctx.fillText('👻', g.px, g.py);
                }
            }
        }

        // Player
        if (player && (player.invincible === 0 || Math.floor(player.invincible / 8) % 2 === 0)) {
            const angle = Math.atan2(player.dr, player.dc);
            const mouth = (player.dr === 0 && player.dc === 0) ? 0.25 : player.mouthAngle;
            ctx.save();
            ctx.translate(player.px, player.py);
            ctx.rotate(angle);
            const R = CELL * 0.46;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, R, mouth * Math.PI, (2 - mouth) * Math.PI);
            ctx.closePath();
            ctx.fillStyle = '#f5a623';
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, R * 0.72, mouth * Math.PI + 0.1, (2 - mouth) * Math.PI - 0.1);
            ctx.closePath();
            ctx.fillStyle = '#c0392b';
            ctx.fill();
            ctx.fillStyle = '#f9e79f';
            ctx.beginPath(); ctx.arc(-2, -3, 2.5, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(3,  2, 2,   0, Math.PI*2); ctx.fill();
            ctx.restore();
        }

        // HUD
        ctx.fillStyle = '#aaa';
        ctx.font = '11px monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText('SCORE', 4, 2);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px monospace';
        ctx.fillText(`${score}`, 4, 13);

        ctx.font = '11px monospace';
        ctx.fillStyle = '#aaa';
        ctx.textAlign = 'center';
        ctx.fillText(`🍕 ${eatenPizza}/${totalPizza}`, W/2, 2);

        ctx.textAlign = 'right';
        ctx.font = '13px serif';
        for (let i = 0; i < lives; i++) ctx.fillText('🍕', W - 4 - i*18, 2);
    }

    function drawOverlay(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = 'rgba(0,0,0,0.75)';
        ctx.fillRect(0, 0, W, H);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (gameState === 'start') {
            ctx.font = 'bold 24px monospace';
            ctx.fillStyle = '#f5a623';
            ctx.fillText('🍕 PIZ MAN 🍕', W/2, H/2 - 65);
            ctx.font = '13px monospace';
            ctx.fillStyle = '#ccc';
            ctx.fillText('50 people signed up.', W/2, H/2 - 22);
            ctx.fillText('3 showed up.', W/2, H/2 - 2);
            ctx.fillText('Eat ALL the pizza.', W/2, H/2 + 18);
            ctx.font = '11px monospace';
            ctx.fillStyle = '#777';
            ctx.fillText('WASD or arrow keys', W/2, H/2 + 48);
            ctx.font = 'bold 12px monospace';
            ctx.fillStyle = '#f5a623';
            ctx.fillText('[ PRESS ANY KEY ]', W/2, H/2 + 70);
        }

        if (gameState === 'win') {
            ctx.font = 'bold 22px monospace';
            ctx.fillStyle = '#2ecc71';
            ctx.fillText('ALL PIZZA EATEN!', W/2, H/2 - 45);
            ctx.font = '13px monospace';
            ctx.fillStyle = '#ccc';
            ctx.fillText(`Score: ${score}`, W/2, H/2 - 5);
            ctx.fillText(`Best: ${highScore}`, W/2, H/2 + 16);
            ctx.font = '11px monospace';
            ctx.fillStyle = '#777';
            ctx.fillText('No leftovers. Impressive.', W/2, H/2 + 42);
            ctx.font = 'bold 12px monospace';
            ctx.fillStyle = '#f5a623';
            ctx.fillText('[ PRESS ANY KEY ]', W/2, H/2 + 64);
        }

        if (gameState === 'dead') {
            ctx.font = 'bold 22px monospace';
            ctx.fillStyle = '#e74c3c';
            ctx.fillText('GAME OVER', W/2, H/2 - 45);
            ctx.font = '13px monospace';
            ctx.fillStyle = '#ccc';
            const pct = Math.round(eatenPizza / totalPizza * 100);
            ctx.fillText(`You ate ${pct}% of the pizza.`, W/2, H/2 - 5);
            ctx.fillText('The rest went cold.', W/2, H/2 + 16);
            ctx.fillText(`Score: ${score}`, W/2, H/2 + 36);
            ctx.font = 'bold 12px monospace';
            ctx.fillStyle = '#f5a623';
            ctx.fillText('[ PRESS ANY KEY ]', W/2, H/2 + 62);
        }
    }

    function loop(): void {
        if (!canvas) return;
        const ctx = canvas.getContext('2d')!;
        update();
        draw(ctx);
        if (gameState !== 'playing') drawOverlay(ctx);
        animId = requestAnimationFrame(loop);
    }

    // --- Input ---
    const KEY_DIR: Record<string, [number,number]> = {
        ArrowLeft:[0,-1], ArrowRight:[0,1], ArrowUp:[-1,0], ArrowDown:[1,0],
        a:[0,-1], d:[0,1], w:[-1,0], s:[1,0],
        A:[0,-1], D:[0,1], W:[-1,0], S:[1,0],
    };

    function onKey(e: KeyboardEvent): void {
        if (gameState !== 'playing') { initGame(); return; }
        const dir = KEY_DIR[e.key];
        if (dir) {
            player.nextDr = dir[0];
            player.nextDc = dir[1];
            e.preventDefault();
        }
    }

    onMount(() => {
        setTitle(TITLE);
        initGame(); // initializes maze, dots, player, ghosts — then show start overlay
        gameState = 'start'; // override back to start screen after init
        loop();
        window.addEventListener('keydown', onKey);
        return () => { cancelAnimationFrame(animId); window.removeEventListener('keydown', onKey); };
    });
</script>

<div class="page-center">
    <div class="game-wrap">
        <canvas
            bind:this={canvas}
            width={W} height={H}
            style="display:block;width:100%;height:auto;"
            tabindex="0"
        ></canvas>
    </div>
</div>

<style>
    .page-center {
        display: flex;
        align-items: flex-start;
        justify-content: center;
        padding: 16px;
        box-sizing: border-box;
    }

    .game-wrap {
        display: flex;
        flex-direction: column;
        width: 418px;
        border: 2px solid #1a3a6b;
        border-radius: 6px;
        overflow: hidden;
        box-shadow: 0 0 40px rgba(74,144,217,0.2);
        background: #111;
    }
    .game-header {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        padding: 8px 14px;
        background: #0d0d0d;
        border-bottom: 1px solid #1a3a6b;
    }
    .game-title {
        font-family: monospace;
        font-size: 15px;
        font-weight: bold;
        color: #f5a623;
        letter-spacing: 0.05em;
    }
    .game-sub {
        font-family: monospace;
        font-size: 11px;
        color: #555;
        white-space: nowrap;
    }
    .game-footer {
        padding: 7px 14px;
        background: #0d0d0d;
        border-top: 1px solid #1a3a6b;
        text-align: center;
    }
    .hint {
        font-family: monospace;
        font-size: 11px;
        color: #444;
    }
    canvas { display: block; outline: none; }
</style>