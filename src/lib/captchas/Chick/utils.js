export function getDistance(x1, y1, x2, y2) {
    return Math.hypot(x2 - x1, y2 - y1);
}

export function weightedRandom(options) {
    const totalWeight = options.reduce((sum, opt) => sum + opt.weight, 0);
    let random = Math.random() * totalWeight;

    for (const option of options) {
        if (random < option.weight) return option.state;
        random -= option.weight;
    }
    return options[0].state;
}
