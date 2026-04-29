export class Feather {
    constructor(x, y) {
        this.x = x;
        this.y = y;

        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 15 + 5;

        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed - 10;

        this.gravity = 0.4;
        this.drag = 0.92;

        this.opacity = 1;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.3;

        this.width = Math.random() * 8 + 6;
        this.height = Math.random() * 20 + 15;
    }

    update() {
        this.vx *= this.drag;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.rotation += this.rotationSpeed;
        if (this.vy > 0) this.opacity -= 0.005;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = Math.max(0, this.opacity);

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(0, 0, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, -this.height / 2);
        ctx.lineTo(0, this.height / 2);
        ctx.stroke();

        ctx.restore();
    }
}
