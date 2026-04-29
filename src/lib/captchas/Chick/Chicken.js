import { Animal } from './Animal.js';
import { getDistance, weightedRandom } from './utils.js';

const FLEE_RADIUS = 150;
const FLEEING_SPEEDUP = 3;
const FLEEING_TIMER = 2;

export const ChickenState = {
    IsStill: 'IsStill',
    IsWalking: 'IsWalking',
    IsLooking: 'IsLooking',
    IsEating: 'IsEating',
    IsFleeing: 'IsFleeing'
};

export class Chicken extends Animal {
    constructor(x, y) {
        super(x, y, 100, 80);
        this.state = ChickenState.IsLooking;
        this.stateTimer = 0;
        this.stateDuration = 2;
    }

    advanceState(canvas) {
        this.stateTimer = 0;
        this.stateDuration = Math.random() * 2 + 1;

        if (this.state === ChickenState.IsWalking || this.state === ChickenState.IsFleeing) {
            this.state = weightedRandom([
                { state: ChickenState.IsStill, weight: 1 },
                { state: ChickenState.IsLooking, weight: 2 },
                { state: ChickenState.IsEating, weight: 3 }
            ]);
            this.currentSpeed = this.baseSpeed;
        } else {
            this.state = weightedRandom([
                { state: ChickenState.IsWalking, weight: 6 },
                { state: ChickenState.IsStill, weight: 1 },
                { state: ChickenState.IsLooking, weight: 1 },
                { state: ChickenState.IsEating, weight: 1 }
            ]);
        }

        if (this.state === ChickenState.IsWalking) {
            this.targetX = this.x + (Math.random() - 0.5) * 400;
            this.targetY = this.y + (Math.random() - 0.5) * 400;
            this.clampTargetToCanvas(canvas);
        }
    }

    update(deltaTime, stateManager) {
        this.animTime += deltaTime;

        // NEW: Track how long the chicken has been fleeing
        if (this.state === ChickenState.IsFleeing) {
            this.fleeTimer = (this.fleeTimer || 0) + deltaTime;
        }

        // --- Fleeing Logic ---
        const fox = stateManager.fox;
        const distToFox = getDistance(this.x, this.y, fox.x, fox.y);
        const fleeRadius = FLEE_RADIUS;

        // Trigger fleeing if the fox gets too close
        if (distToFox < fleeRadius && this.state !== ChickenState.IsFleeing) {
            this.state = ChickenState.IsFleeing;
            this.fleeTimer = 0; // NEW: Start the clock when the panic begins
            this.currentSpeed = this.baseSpeed * FLEEING_SPEEDUP;

            const dx = this.x - fox.x;
            const dy = this.y - fox.y;
            this.targetX = this.x + dx;
            this.targetY = this.y + dy;
            this.clampTargetToCanvas(stateManager.canvas);
        }
        // Stop fleeing if safe AND at least 0.5 seconds have passed
        else if (this.state === ChickenState.IsFleeing && distToFox >= fleeRadius && this.fleeTimer >= FLEEING_TIMER) {
            this.advanceState(stateManager.canvas); // Safe! Return to normal
        }

        // --- Movement & State Resolution ---
        if (this.state === ChickenState.IsWalking || this.state === ChickenState.IsFleeing) {
            const reachedTarget = this.moveTowardsTarget(deltaTime);

            if (reachedTarget) {
                if (this.state === ChickenState.IsFleeing) {
                    // Also ensure the timer condition is met when reaching a flee waypoint
                    if (distToFox >= fleeRadius && this.fleeTimer >= FLEEING_TIMER) {
                        this.advanceState(stateManager.canvas); // Safe! Return to normal
                    } else {
                        // Still in danger (or too soon to stop), pick a new flee point
                        const dx = this.x - fox.x;
                        const dy = this.y - fox.y;
                        this.targetX = this.x + dx;
                        this.targetY = this.y + dy;
                        this.clampTargetToCanvas(stateManager.canvas);
                    }
                } else {
                    this.advanceState(stateManager.canvas);
                }
            }
        } else {
            // Keep your existing state timer for idle/eating animations
            this.stateTimer += deltaTime;
            if (this.stateTimer > this.stateDuration) {
                this.advanceState(stateManager.canvas);
            }
        }
    }

    draw(ctx) {
        let bodyRot = 0, headRot = 0, leg1Rot = 0, leg2Rot = 0;

        switch (this.state) {
            case ChickenState.IsFleeing:
            case ChickenState.IsWalking:
                const speedMult = this.state === ChickenState.IsFleeing ? 30 : 15;
                leg1Rot = Math.sin(this.animTime * speedMult) * 0.6;
                leg2Rot = Math.sin(this.animTime * speedMult + Math.PI) * 0.6;
                headRot = Math.sin(this.animTime * speedMult) * 0.1;
                bodyRot = this.state === ChickenState.IsFleeing ? 0.2 : 0;
                break;
            case ChickenState.IsLooking:
                headRot = Math.sin(this.animTime * 4) * 0.6;
                break;
            case ChickenState.IsEating:
                bodyRot = Math.PI / 6;
                headRot = Math.PI / 4 + Math.abs(Math.sin(this.animTime * 20)) * 0.3;
                break;
        }

        ctx.save();
        ctx.translate(this.x + this.size / 2, this.y + this.size / 2);
        ctx.scale(this.direction * this.scale, this.scale);
        ctx.translate(-50, -50);

        // Legs
        ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.strokeStyle = 'orange';
        ctx.save(); ctx.translate(40, 80); ctx.rotate(leg1Rot); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-5, 15); ctx.stroke(); ctx.restore();
        ctx.save(); ctx.translate(60, 80); ctx.rotate(leg2Rot); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(5, 15); ctx.stroke(); ctx.restore();

        // Body
        ctx.save(); ctx.translate(50, 60); ctx.rotate(bodyRot); ctx.translate(-50, -60);
        ctx.fillStyle = '#f0f0f0'; ctx.beginPath(); ctx.moveTo(20, 60); ctx.quadraticCurveTo(5, 50, 25, 35); ctx.fill();
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(50, 60, 30, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#e0e0e0'; ctx.beginPath(); ctx.moveTo(35, 55); ctx.quadraticCurveTo(50, 75, 65, 55); ctx.fill();

        // Head
        ctx.save(); ctx.translate(65, 45); ctx.rotate(headRot); ctx.translate(-65, -45);
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(70, 35, 18, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'orange'; ctx.beginPath(); ctx.moveTo(85, 30); ctx.lineTo(100, 35); ctx.lineTo(85, 40); ctx.fill();
        ctx.fillStyle = 'black'; ctx.beginPath(); ctx.arc(75, 30, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'red'; ctx.beginPath(); ctx.moveTo(60, 25); ctx.quadraticCurveTo(65, 10, 75, 18); ctx.quadraticCurveTo(80, 10, 85, 20); ctx.fill();
        ctx.beginPath(); ctx.moveTo(75, 50); ctx.quadraticCurveTo(80, 60, 85, 50); ctx.fill();
        ctx.restore(); ctx.restore(); ctx.restore();
    }
}
