/**
 * One Euro Filter Implementation
 * Based on: Casiez, G., Roussel, N., & Vogel, D. (2012)
 * "1€ Filter: A simple speed-based low-pass filter for noisy input in interactive systems"
 * 
 * This filter reduces jitter in landmark tracking while maintaining responsiveness
 * to deliberate motion. Used for temporal smoothing of MediaPipe landmarks.
 */

class LowPassFilter {
    private y: number;
    private s: number;
    private initialized: boolean;

    constructor() {
        this.y = 0;
        this.s = 0;
        this.initialized = false;
    }

    filter(value: number, alpha: number): number {
        if (!this.initialized) {
            this.initialized = true;
            this.y = value;
        } else {
            this.y = alpha * value + (1 - alpha) * this.y;
        }
        return this.y;
    }

    filterWithAlpha(value: number, alpha: number): number {
        return this.filter(value, alpha);
    }

    hasLastRawValue(): boolean {
        return this.initialized;
    }

    lastRawValue(): number {
        return this.y;
    }
}

export class OneEuroFilter {
    private xFilter: LowPassFilter;
    private dxFilter: LowPassFilter;
    private minCutoff: number;
    private beta: number;
    private dCutoff: number;
    private lastTime: number;

    /**
     * @param minCutoff - Minimum cutoff frequency (Hz). Lower = more smoothing. Default: 1.0
     * @param beta - Speed coefficient. Higher = more responsive to fast movements. Default: 0.007
     * @param dCutoff - Cutoff frequency for derivative. Default: 1.0
     */
    constructor(minCutoff: number = 1.0, beta: number = 0.007, dCutoff: number = 1.0) {
        this.xFilter = new LowPassFilter();
        this.dxFilter = new LowPassFilter();
        this.minCutoff = minCutoff;
        this.beta = beta;
        this.dCutoff = dCutoff;
        this.lastTime = 0;
    }

    private alpha(cutoff: number, te: number): number {
        const tau = 1.0 / (2 * Math.PI * cutoff);
        return 1.0 / (1.0 + tau / te);
    }

    /**
     * Filter a single value
     * @param value - The raw input value
     * @param timestamp - Current timestamp in seconds (optional, uses performance.now() if not provided)
     */
    filter(value: number, timestamp?: number): number {
        const currentTime = timestamp !== undefined ? timestamp : performance.now() / 1000;

        // Calculate time elapsed
        const te = this.lastTime !== 0 ? currentTime - this.lastTime : 1.0 / 60.0; // Default to 60 FPS
        this.lastTime = currentTime;

        // Estimate derivative
        const dValue = this.xFilter.hasLastRawValue()
            ? (value - this.xFilter.lastRawValue()) / te
            : 0.0;

        const edValue = this.dxFilter.filterWithAlpha(
            dValue,
            this.alpha(this.dCutoff, te)
        );

        // Calculate adaptive cutoff frequency
        const cutoff = this.minCutoff + this.beta * Math.abs(edValue);

        // Filter the value
        return this.xFilter.filterWithAlpha(value, this.alpha(cutoff, te));
    }

    /**
     * Reset the filter state
     */
    reset(): void {
        this.xFilter = new LowPassFilter();
        this.dxFilter = new LowPassFilter();
        this.lastTime = 0;
    }
}

/**
 * Filter for 2D points (x, y coordinates)
 */
export class OneEuroFilter2D {
    private xFilter: OneEuroFilter;
    private yFilter: OneEuroFilter;

    constructor(minCutoff: number = 1.0, beta: number = 0.007, dCutoff: number = 1.0) {
        this.xFilter = new OneEuroFilter(minCutoff, beta, dCutoff);
        this.yFilter = new OneEuroFilter(minCutoff, beta, dCutoff);
    }

    /**
     * Filter a 2D point
     * @param point - Object with x and y properties
     * @param timestamp - Current timestamp in seconds (optional)
     */
    filter(point: { x: number; y: number }, timestamp?: number): { x: number; y: number } {
        return {
            x: this.xFilter.filter(point.x, timestamp),
            y: this.yFilter.filter(point.y, timestamp),
        };
    }

    /**
     * Reset both filters
     */
    reset(): void {
        this.xFilter.reset();
        this.yFilter.reset();
    }
}

/**
 * Filter for 3D points (x, y, z coordinates)
 */
export class OneEuroFilter3D {
    private xFilter: OneEuroFilter;
    private yFilter: OneEuroFilter;
    private zFilter: OneEuroFilter;

    constructor(minCutoff: number = 1.0, beta: number = 0.007, dCutoff: number = 1.0) {
        this.xFilter = new OneEuroFilter(minCutoff, beta, dCutoff);
        this.yFilter = new OneEuroFilter(minCutoff, beta, dCutoff);
        this.zFilter = new OneEuroFilter(minCutoff, beta, dCutoff);
    }

    /**
     * Filter a 3D point
     * @param point - Object with x, y, and z properties
     * @param timestamp - Current timestamp in seconds (optional)
     */
    filter(point: { x: number; y: number; z: number }, timestamp?: number): { x: number; y: number; z: number } {
        return {
            x: this.xFilter.filter(point.x, timestamp),
            y: this.yFilter.filter(point.y, timestamp),
            z: this.zFilter.filter(point.z, timestamp),
        };
    }

    /**
     * Reset all filters
     */
    reset(): void {
        this.xFilter.reset();
        this.yFilter.reset();
        this.zFilter.reset();
    }
}
