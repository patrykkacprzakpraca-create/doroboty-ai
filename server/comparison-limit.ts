const minute = 60_000;
const hour = 60 * minute;
const perMinute = 5;
const perHour = 30;

export function createComparisonLimit(now = () => performance.now()) {
  const starts: number[] = [];
  let active = false;

  return function acquire(): { retryAfter: number } | { release: () => void } {
    const time = now();
    while (starts.length && starts[0] <= time - hour) starts.shift();

    const minuteStart = starts.at(-perMinute);
    const minuteWait = minuteStart === undefined ? 0 : minuteStart + minute - time;
    const hourWait = starts.length < perHour ? 0 : starts[0] + hour - time;
    const wait = Math.max(minuteWait, hourWait, active ? 5000 : 0);
    if (wait > 0) return { retryAfter: Math.ceil(wait / 1000) };

    starts.push(time);
    active = true;
    return {
      release() {
        active = false;
      },
    };
  };
}
