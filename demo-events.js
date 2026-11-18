(() => {
  const storageKey = "behind-firewall-ssh-lab-v2";
  const channel = "BroadcastChannel" in window
    ? new BroadcastChannel("behind-firewall-ssh-lab-v2")
    : null;

  function readEvents() {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return [];
    const events = JSON.parse(stored);
    if (!Array.isArray(events)) {
      throw new Error("The local demo event feed is not in the expected format. Clear the feed and try again.");
    }
    return events;
  }

  function publish(event) {
    const events = readEvents();
    events.push(event);
    localStorage.setItem(storageKey, JSON.stringify(events));
    channel?.postMessage("refresh");
  }

  function clear() {
    localStorage.setItem(storageKey, "[]");
    channel?.postMessage("refresh");
  }

  function subscribe(refresh) {
    const onMessage = () => refresh();
    const onStorage = (event) => {
      if (event.key === storageKey) refresh();
    };
    channel?.addEventListener("message", onMessage);
    window.addEventListener("storage", onStorage);
  }

  window.DemoEvents = { readEvents, publish, clear, subscribe };
})();
