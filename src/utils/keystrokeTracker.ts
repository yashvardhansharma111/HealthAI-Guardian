/**
 * Keystroke Dynamics Tracker
 * Tracks typing patterns for stress detection
 */

export interface KeystrokeEvent {
  key: string;
  timestamp: number;
  type: "keydown" | "keyup";
}

export interface KeystrokeFeatures {
  duration_ms: number;
  n_keydowns: number;
  n_keyups: number;
  chars_per_sec: number;
  dwell_mean_ms: number;
  dwell_std_ms: number;
  dwell_median_ms: number;
  dwell_p10_ms: number;
  dwell_p90_ms: number;
  dd_mean_ms: number;
  dd_std_ms: number;
  dd_median_ms: number;
  pauses_gt_200: number;
  pauses_gt_500: number;
  pauses_gt_1000: number;
  longest_pause_ms: number;
  backspace_count: number;
  cv_dwell: number;
  cv_dd: number;
  hist_bin_0: number;
  hist_bin_1: number;
  hist_bin_2: number;
  hist_bin_3: number;
  hist_bin_4: number;
  hist_bin_5: number;
  inter_entropy: number;
}

export class KeystrokeTracker {
  private events: KeystrokeEvent[] = [];
  private startTime: number = 0;
  private isTracking: boolean = false;

  start() {
    this.events = [];
    this.startTime = Date.now();
    this.isTracking = true;
  }

  stop() {
    this.isTracking = false;
  }

  recordKeyDown(key: string) {
    if (!this.isTracking) return;
    this.events.push({
      key,
      timestamp: Date.now(),
      type: "keydown",
    });
  }

  recordKeyUp(key: string) {
    if (!this.isTracking) return;
    this.events.push({
      key,
      timestamp: Date.now(),
      type: "keyup",
    });
  }

  getFeatures(): KeystrokeFeatures {
    if (this.events.length === 0) {
      return this.getEmptyFeatures();
    }

    const endTime = this.events[this.events.length - 1].timestamp;
    const duration_ms = endTime - this.startTime;

    // Separate keydowns and keyups
    const keydowns = this.events.filter((e) => e.type === "keydown");
    const keyups = this.events.filter((e) => e.type === "keyup");
    const n_keydowns = keydowns.length;
    const n_keyups = keyups.length;

    // Calculate characters per second
    const chars_per_sec = duration_ms > 0 ? (n_keydowns / duration_ms) * 1000 : 0;

    // Calculate dwell times (time between keydown and keyup for same key)
    const dwells: number[] = [];
    const keyMap = new Map<string, number>();

    for (const event of this.events) {
      if (event.type === "keydown") {
        keyMap.set(event.key, event.timestamp);
      } else if (event.type === "keyup") {
        const keydownTime = keyMap.get(event.key);
        if (keydownTime !== undefined) {
          const dwell = event.timestamp - keydownTime;
          if (dwell > 0 && dwell < 5000) {
            // Filter out unrealistic values
            dwells.push(dwell);
          }
          keyMap.delete(event.key);
        }
      }
    }

    // Calculate digraph times (time between keyup and next keydown)
    const digraphs: number[] = [];
    for (let i = 0; i < this.events.length - 1; i++) {
      const current = this.events[i];
      const next = this.events[i + 1];
      if (current.type === "keyup" && next.type === "keydown") {
        const digraph = next.timestamp - current.timestamp;
        if (digraph > 0 && digraph < 5000) {
          digraphs.push(digraph);
        }
      }
    }

    // Dwell statistics
    const dwell_mean_ms = this.mean(dwells);
    const dwell_std_ms = this.std(dwells, dwell_mean_ms);
    const dwell_median_ms = this.median(dwells);
    const dwell_p10_ms = this.percentile(dwells, 10);
    const dwell_p90_ms = this.percentile(dwells, 90);

    // Digraph statistics
    const dd_mean_ms = this.mean(digraphs);
    const dd_std_ms = this.std(digraphs, dd_mean_ms);
    const dd_median_ms = this.median(digraphs);

    // Pauses (digraphs > threshold)
    const pauses_gt_200 = digraphs.filter((d) => d > 200).length;
    const pauses_gt_500 = digraphs.filter((d) => d > 500).length;
    const pauses_gt_1000 = digraphs.filter((d) => d > 1000).length;
    const longest_pause_ms = digraphs.length > 0 ? Math.max(...digraphs) : 0;

    // Backspace count
    const backspace_count = keydowns.filter((e) => e.key === "Backspace").length;

    // Coefficient of variation
    const cv_dwell = dwell_mean_ms > 0 ? dwell_std_ms / dwell_mean_ms : 0;
    const cv_dd = dd_mean_ms > 0 ? dd_std_ms / dd_mean_ms : 0;

    // Histogram bins (dwell time distribution)
    const hist_bins = this.histogram(dwells, 6, 0, 1000);
    const hist_bin_0 = hist_bins[0] || 0;
    const hist_bin_1 = hist_bins[1] || 0;
    const hist_bin_2 = hist_bins[2] || 0;
    const hist_bin_3 = hist_bins[3] || 0;
    const hist_bin_4 = hist_bins[4] || 0;
    const hist_bin_5 = hist_bins[5] || 0;

    // Inter-key entropy (simplified)
    const inter_entropy = this.calculateEntropy(digraphs);

    return {
      duration_ms,
      n_keydowns,
      n_keyups,
      chars_per_sec,
      dwell_mean_ms,
      dwell_std_ms,
      dwell_median_ms,
      dwell_p10_ms,
      dwell_p90_ms,
      dd_mean_ms,
      dd_std_ms,
      dd_median_ms,
      pauses_gt_200,
      pauses_gt_500,
      pauses_gt_1000,
      longest_pause_ms,
      backspace_count,
      cv_dwell,
      cv_dd,
      hist_bin_0,
      hist_bin_1,
      hist_bin_2,
      hist_bin_3,
      hist_bin_4,
      hist_bin_5,
      inter_entropy,
    };
  }

  private getEmptyFeatures(): KeystrokeFeatures {
    return {
      duration_ms: 0,
      n_keydowns: 0,
      n_keyups: 0,
      chars_per_sec: 0,
      dwell_mean_ms: 0,
      dwell_std_ms: 0,
      dwell_median_ms: 0,
      dwell_p10_ms: 0,
      dwell_p90_ms: 0,
      dd_mean_ms: 0,
      dd_std_ms: 0,
      dd_median_ms: 0,
      pauses_gt_200: 0,
      pauses_gt_500: 0,
      pauses_gt_1000: 0,
      longest_pause_ms: 0,
      backspace_count: 0,
      cv_dwell: 0,
      cv_dd: 0,
      hist_bin_0: 0,
      hist_bin_1: 0,
      hist_bin_2: 0,
      hist_bin_3: 0,
      hist_bin_4: 0,
      hist_bin_5: 0,
      inter_entropy: 0,
    };
  }

  private mean(arr: number[]): number {
    if (arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }

  private std(arr: number[], mean: number): number {
    if (arr.length === 0) return 0;
    const variance = arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / arr.length;
    return Math.sqrt(variance);
  }

  private median(arr: number[]): number {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  }

  private percentile(arr: number[], p: number): number {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const index = Math.floor((p / 100) * sorted.length);
    return sorted[Math.min(index, sorted.length - 1)];
  }

  private histogram(arr: number[], bins: number, min: number, max: number): number[] {
    const binSize = (max - min) / bins;
    const hist = new Array(bins).fill(0);
    for (const val of arr) {
      if (val >= min && val < max) {
        const binIndex = Math.min(Math.floor((val - min) / binSize), bins - 1);
        hist[binIndex]++;
      }
    }
    return hist;
  }

  private calculateEntropy(arr: number[]): number {
    if (arr.length === 0) return 0;
    // Simplified entropy calculation
    const bins = 10;
    const min = Math.min(...arr);
    const max = Math.max(...arr);
    if (max === min) return 0;
    const hist = this.histogram(arr, bins, min, max);
    const total = hist.reduce((a, b) => a + b, 0);
    if (total === 0) return 0;
    const probs = hist.map((h) => h / total).filter((p) => p > 0);
    return -probs.reduce((sum, p) => sum + p * Math.log2(p), 0);
  }

  reset() {
    this.events = [];
    this.startTime = 0;
    this.isTracking = false;
  }
}

