import { Animal } from './Animal.js';
import { Chicken } from './Chicken.js';

export class Egg extends Animal {
    constructor(x, y) {
        // Eggs are a bit smaller and don't move, so baseSpeed is 0
        super(x, y, 60, 60);
        this.clickCount = 0;
        this.maxClicks = 5;
        this.isHatched = false;

        // Optional: flag to let your stateManager know it should remove this object from the array
        this.markedForDeletion = false;
    }

    update(deltaTime, stateManager) {
        // Eggs don't move, so update just increments time if you ever want to add a wobble animation
        this.animTime += deltaTime;
    }

    // Call this method from your main canvas click event listener
    handleClick(mouseX, mouseY, stateManager) {
        if (this.isHatched) return false;

        // Calculate distance from mouse to the center of the egg
        const centerX = this.x + this.size / 2;
        const centerY = this.y + this.size / 2;
        const dist = Math.hypot(mouseX - centerX, mouseY - centerY);

        // Check if the click is within the egg's radius (approx 30px)
        if (dist < 30) {
            this.clickCount++;

            if (this.clickCount >= this.maxClicks) {
                this.hatch(stateManager);
            }
            return true; // Returns true so you know an egg was clicked
        }
        return false;
    }

    hatch(stateManager) {
        this.isHatched = true;
        this.markedForDeletion = true; // Mark to be removed from the draw/update array

        // Spawn a new chicken at the egg's exact coordinates
        // Assuming stateManager holds your list of animals in an array called `animals`
        if (stateManager && stateManager.animals) {
            stateManager.animals.push(new Chicken(this.x, this.y));
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.size / 2, this.y + this.size / 2);

        // 1. Draw the Egg Shape
        ctx.fillStyle = '#faebd7'; // AntiqueWhite egg color
        ctx.strokeStyle = '#c0b0a0'; // Slight outline
        ctx.lineWidth = 2;

        ctx.beginPath();
        // Use bezier curves to create an egg shape (wider at bottom, narrower at top)
        ctx.moveTo(0, 25);
        ctx.bezierCurveTo(25, 25, 20, -20, 0, -25);
        ctx.bezierCurveTo(-20, -20, -25, 25, 0, 25);
        ctx.fill();
        ctx.stroke();

        // 2. Draw Cracks based on clickCount
        if (this.clickCount > 0) {
            ctx.strokeStyle = '#4a4a4a'; // Dark grey for the crack
            ctx.lineWidth = 1.5;
            ctx.beginPath();

            // Click 1: Small crack from the top
            if (this.clickCount >= 1) {
                ctx.moveTo(0, -25);
                ctx.lineTo(5, -12);
            }
            // Click 2: Crack extends further down
            if (this.clickCount >= 2) {
                ctx.lineTo(-4, 2);
            }
            // Click 3: Crack zig-zags and a branch appears
            if (this.clickCount >= 3) {
                ctx.lineTo(6, 12);
                // Branch off
                ctx.moveTo(-4, 2);
                ctx.lineTo(-12, 8);
            }
            // Click 4: Deep cracks all the way to the bottom
            if (this.clickCount >= 4) {
                ctx.lineTo(-2, 22);
                // Another branch
                ctx.moveTo(6, 12);
                ctx.lineTo(15, 16);
            }

            ctx.stroke();
        }

        ctx.restore();
    }
}
