// Returns true when a code should be accepted. Seeing the same code again inside the window
// (e.g. the camera still pointed at it) is ignored and extends the window.
export function createDeduper(windowMs: number) {
  let lastCode: string | null = null;
  let lastTime = -Infinity;
  return (code: string, timeMs: number): boolean => {
    const duplicate = code === lastCode && timeMs - lastTime < windowMs;
    lastCode = code;
    lastTime = timeMs;
    return !duplicate;
  };
}
