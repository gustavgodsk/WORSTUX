export class Animal {
    constructor(x, y, size, baseSpeed) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.scale = size / 100;

        this.targetX = x;
        this.targetY = y;
        this.baseSpeed = baseSpeed;
        this.currentSpeed = baseSpeed;
        this.direction = 1; // 1 for right, -1 for left

        this.animTime = 0;
        this.isDead = false; // Used to mark for deletion
    }

    moveTowardsTarget(deltaTime) {
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.hypot(dx, dy);

        if (distance < 5) {
            this.x = this.targetX;
            this.y = this.targetY;
            return true; // Reached target
        } else {
            this.x += (dx / distance) * this.currentSpeed * deltaTime;
            this.y += (dy / distance) * this.currentSpeed * deltaTime;
            this.direction = dx > 0 ? 1 : -1;
            return false; // Still moving
        }
    }

    clampTargetToCanvas(canvas) {
        const padding = 20;
        this.targetX = Math.max(padding, Math.min(this.targetX, canvas.width - this.size - padding));
        this.targetY = Math.max(padding, Math.min(this.targetY, canvas.height - this.size - padding));
    }

    // Abstract methods to be overridden
    update(deltaTime, stateManager) { }
    draw(ctx) { }
}
