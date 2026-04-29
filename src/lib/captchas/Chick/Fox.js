import { Animal } from './Animal.js';
import { getDistance } from './utils.js';

export class Fox extends Animal {
    constructor(x, y) {
        super(x, y, 120, 140);
        this.isHunting = false;

        // New Health properties
        this.maxHealth = 100;
        this.health = this.maxHealth;
    }

    update(deltaTime, stateManager) {
        this.animTime += deltaTime;

        // --- Health Drain on Hover ---
        const isHovered = (
            stateManager.mouseX >= this.x && stateManager.mouseX <= this.x + this.size &&
            stateManager.mouseY >= this.y && stateManager.mouseY <= this.y + this.size
        );

        if (isHovered) {
            this.health = Math.max(0, this.health - 15 * deltaTime); // Lose 15 HP/sec
        }

        const chickens = stateManager.chickens;

        if (chickens.length === 0) {
            this.isHunting = false;
            if (this.moveTowardsTarget(deltaTime)) {
                this.targetX = this.x + (Math.random() - 0.5) * 400;
                this.targetY = this.y + (Math.random() - 0.5) * 400;
                this.clampTargetToCanvas(stateManager.canvas);
            }
            return;
        }

        this.isHunting = true;
        let closestChicken = null;
        let minDistance = Infinity;

        for (const chicken of chickens) {
            const dist = getDistance(this.x, this.y, chicken.x, chicken.y);
            if (dist < minDistance) {
                minDistance = dist;
                closestChicken = chicken;
            }
        }

        if (closestChicken) {
            this.targetX = closestChicken.x;
            this.targetY = closestChicken.y;
            this.moveTowardsTarget(deltaTime);

            if (minDistance < 40) {
                stateManager.explodeChicken(closestChicken);
                // The fox ate the chicken! Regain some health.
                this.health = Math.min(this.maxHealth, this.health + 30);
            }
        }
    }

    draw(ctx) {
        // --- Draw Health Bar ---
        const barWidth = 60;
        const barHeight = 8;
        const healthRatio = this.health / this.maxHealth;
        const barX = this.x + this.size / 2 - barWidth / 2;
        const barY = this.y + 15;

        // Background (Dark Grey for empty health)
        ctx.fillStyle = '#444444';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        // Foreground (Red for current health)
        ctx.fillStyle = '#ff4444';
        ctx.fillRect(barX, barY, barWidth * healthRatio, barHeight);

        // Border
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth, barHeight);

        // --- Draw Fox Vectors ---
        const isMoving = this.x !== this.targetX || this.y !== this.targetY;
        const leg1Rot = isMoving ? Math.sin(this.animTime * 15) * 0.6 : 0;
        const leg2Rot = isMoving ? Math.sin(this.animTime * 15 + Math.PI) * 0.6 : 0;
        const tailRot = Math.sin(this.animTime * 5) * 0.2;

        ctx.save();
        ctx.translate(this.x + this.size / 2, this.y + this.size / 2);
        ctx.scale(this.direction * this.scale, this.scale);
        ctx.translate(-50, -50);

        // Legs
        ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.strokeStyle = '#222';
        ctx.save(); ctx.translate(30, 70); ctx.rotate(leg1Rot); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-5, 20); ctx.stroke(); ctx.restore();
        ctx.save(); ctx.translate(70, 70); ctx.rotate(leg2Rot); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(5, 20); ctx.stroke(); ctx.restore();

        // Tail
        ctx.save(); ctx.translate(20, 50); ctx.rotate(tailRot);
        ctx.fillStyle = '#D84B20'; ctx.beginPath(); ctx.ellipse(-15, 5, 25, 10, -Math.PI / 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(-35, 15, 8, 5, -Math.PI / 6, 0, Math.PI * 2); ctx.fill();
        ctx.restore();

        // Body
        ctx.fillStyle = '#D84B20';
        ctx.beginPath(); ctx.ellipse(50, 50, 35, 20, 0, 0, Math.PI * 2); ctx.fill();

        // Head
        ctx.beginPath(); ctx.moveTo(70, 40); ctx.lineTo(95, 45); ctx.lineTo(70, 60); ctx.fill();

        // Ears
        ctx.fillStyle = '#111';
        ctx.beginPath(); ctx.moveTo(70, 40); ctx.lineTo(65, 25); ctx.lineTo(80, 35); ctx.fill();

        // Eye & Nose
        ctx.fillStyle = 'black';
        ctx.beginPath(); ctx.arc(80, 45, 2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(95, 45, 3, 0, Math.PI * 2); ctx.fill();

        ctx.restore();
    }
}
