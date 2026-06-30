export function startEventExpireWorker(): () => void {
  const timer = setInterval(() => {
    // Event expiration is kept as an explicit worker hook for the MVP.
  }, 30_000);

  return () => clearInterval(timer);
}
