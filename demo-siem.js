const errorStatus = document.querySelector("#siem-error");
const rows = document.querySelector("#event-rows");
const alertBox = document.querySelector("#detection-alert");
const chart = document.querySelector("#alert-chart");

document.querySelector("#clear-events").addEventListener("click", () => {
  try {
    DemoEvents.clear();
    renderEvents();
  } catch (error) {
    const message = error instanceof Error ? error.message : "The local event feed could not be cleared.";
    errorStatus.textContent = `Error: ${message}`;
  }
});

DemoEvents.subscribe(renderEvents);
renderEvents();

function renderEvents() {
  let events;
  try {
    events = DemoEvents.readEvents();
  } catch (error) {
    const message = error instanceof Error ? error.message : "The local event feed could not be read.";
    errorStatus.textContent = `Error: ${message}`;
    return;
  }

  errorStatus.textContent = "";
  const now = Date.now();
  const recent = events.filter((event) => {
    const timestamp = Date.parse(event.timestamp);
    return Number.isFinite(timestamp) && timestamp <= now && now - timestamp <= 60_000;
  });
  const alerts = detectAlerts(recent);
  renderAlertChart(events);
  document.querySelector("#event-count").textContent = `${events.length} ${events.length === 1 ? "event" : "events"}`;

  alertBox.className = alerts.length ? "alert-strip" : "alert-strip is-clear";
  alertBox.textContent = alerts.length ? alerts.join("\n") : "No alerts";

  rows.replaceChildren();
  if (!events.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 6;
    cell.className = "empty-state";
    cell.textContent = "No events";
    row.append(cell);
    rows.append(row);
    return;
  }

  [...events].reverse().forEach((event) => rows.append(createEventRow(event)));
}

function detectAlerts(events) {
  const portsBySource = groupBySource(events.filter((event) => event.type === "port_probe"));
  const failuresBySource = groupBySource(events.filter((event) => event.type === "ssh_auth_failure"));
  const alerts = [];

  for (const [source, sourceEvents] of portsBySource) {
    const ports = new Set(sourceEvents.map((event) => event.destinationPort));
    if (ports.size >= 4) alerts.push(`PORT SCAN · ${ports.size} ports probed by ${source}`);
  }
  for (const [source, sourceEvents] of failuresBySource) {
    if (sourceEvents.length >= 5) alerts.push(`SSH BRUTE-FORCE · ${sourceEvents.length} failed logins from ${source}`);
  }
  const successAfterFailure = events.some((event) =>
    event.type === "ssh_auth_success" &&
    events.some((prior) =>
      prior.type === "ssh_auth_failure" &&
      prior.source === event.source &&
      Date.parse(prior.timestamp) <= Date.parse(event.timestamp)
    )
  );
  if (successAfterFailure) alerts.push("SSH LOGIN · Successful authentication after failed attempts");
  return alerts;
}

function renderAlertChart(events) {
  const now = Date.now();
  const timedEvents = events
    .map((event) => ({ event, time: Date.parse(event.timestamp) }))
    .filter(({ time }) => Number.isFinite(time) && time <= now)
    .sort((left, right) => left.time - right.time);
  let samples;

  if (!timedEvents.length) {
    samples = [{ time: now - 60_000, count: 0 }, { time: now, count: 0 }];
  } else {
    const firstTime = timedEvents[0].time;
    samples = [{ time: firstTime - 1000, count: 0 }];
    timedEvents.forEach(({ time }, index) => {
      const activeEvents = timedEvents
        .slice(0, index + 1)
        .filter((entry) => time - entry.time <= 60_000)
        .map((entry) => entry.event);
      samples.push({ time, count: detectAlerts(activeEvents).length });
    });
    const lastTime = timedEvents[timedEvents.length - 1].time;
    const endTime = now - lastTime <= 60_000 ? now : lastTime + 1000;
    const activeEvents = timedEvents
      .filter((entry) => endTime - entry.time <= 60_000)
      .map((entry) => entry.event);
    samples.push({ time: endTime, count: detectAlerts(activeEvents).length });
  }

  const maxCount = Math.max(3, ...samples.map((sample) => sample.count));
  const left = 68;
  const right = 940;
  const top = 24;
  const bottom = 190;
  const startTime = samples[0].time;
  const endTime = Math.max(samples[samples.length - 1].time, startTime + 1);
  const x = (time) => left + ((time - startTime) / (endTime - startTime)) * (right - left);
  const y = (count) => bottom - (count / maxCount) * (bottom - top);
  const svgNode = (name, attributes, text = "") => {
    const node = document.createElementNS("http://www.w3.org/2000/svg", name);
    Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, String(value)));
    if (text) node.textContent = text;
    return node;
  };

  chart.replaceChildren();
  chart.append(svgNode("title", {}, "Active alerts over time"));
  chart.append(svgNode("desc", {}, "The vertical axis shows the number of active alert categories. The horizontal axis shows event time."));

  for (let tick = 0; tick <= maxCount; tick += 1) {
    const tickY = y(tick);
    chart.append(svgNode("line", { x1: left, y1: tickY, x2: right, y2: tickY, class: "chart-gridline" }));
    chart.append(svgNode("text", { x: left - 12, y: tickY + 4, "text-anchor": "end", class: "chart-tick" }, String(tick)));
  }

  const points = samples.map((sample) => `${x(sample.time).toFixed(2)},${y(sample.count).toFixed(2)}`);
  const areaPath = `M ${x(samples[0].time).toFixed(2)} ${bottom} L ${points.join(" L ")} L ${x(samples[samples.length - 1].time).toFixed(2)} ${bottom} Z`;
  const linePath = `M ${points.join(" L ")}`;
  chart.append(svgNode("path", { d: areaPath, class: "chart-area" }));
  chart.append(svgNode("path", { d: linePath, class: "chart-line" }));

  [0, 0.5, 1].forEach((position) => {
    const tickTime = startTime + (endTime - startTime) * position;
    chart.append(svgNode("text", {
      x: left + (right - left) * position,
      y: 212,
      "text-anchor": position === 0 ? "start" : position === 1 ? "end" : "middle",
      class: "chart-tick"
    }, formatAxisTime(tickTime)));
  });
  chart.append(svgNode("text", { x: (left + right) / 2, y: 240, "text-anchor": "middle", class: "chart-axis-label" }, "Time"));
  chart.append(svgNode("text", {
    x: 16,
    y: (top + bottom) / 2,
    transform: `rotate(-90 16 ${(top + bottom) / 2})`,
    "text-anchor": "middle",
    class: "chart-axis-label"
  }, "Alerts"));
}

function groupBySource(events) {
  const groups = new Map();
  for (const event of events) {
    if (!event.source) continue;
    const sourceEvents = groups.get(event.source) || [];
    sourceEvents.push(event);
    groups.set(event.source, sourceEvents);
  }
  return groups;
}

function createEventRow(event) {
  const row = document.createElement("tr");
  const eventNames = {
    port_probe: "PORT_PROBE",
    ssh_auth_failure: "SSH_AUTH_FAILURE",
    ssh_auth_success: "SSH_AUTH_SUCCESS",
    ssh_session_open: "SSH_SESSION_OPEN",
    ssh_session_close: "SSH_SESSION_CLOSE"
  };
  const resultClass = event.type === "ssh_auth_failure"
    ? "result-fail"
    : event.type === "ssh_auth_success" || event.type === "ssh_session_open"
      ? "result-success"
      : "";
  const values = [
    formatTime(event.timestamp),
    eventNames[event.type] || event.type || "UNKNOWN",
    event.source || "—",
    `${event.target || "—"}${event.destinationPort ? `:${event.destinationPort}` : ""}`,
    event.result || "—"
  ];

  values.forEach((value, index) => {
    const cell = document.createElement("td");
    cell.textContent = value;
    if (index === 4) cell.className = resultClass;
    row.append(cell);
  });

  const detailsCell = document.createElement("td");
  const details = document.createElement("details");
  const summary = document.createElement("summary");
  summary.textContent = "Details";
  const list = document.createElement("dl");
  [
    ["Event ID", event.id],
    ["Time", event.timestamp],
    ["Source", event.source],
    ["Destination", event.targetIp || event.target],
    ["Port", event.destinationPort],
    ["Service", event.service],
    ["Account", event.account],
    ["Result", event.result],
    ["Severity", event.severity],
    ["Log", event.logLine || event.message]
  ].forEach(([label, value]) => {
    if (value === undefined || value === null || value === "") return;
    const term = document.createElement("dt");
    term.textContent = label;
    const description = document.createElement("dd");
    description.textContent = String(value);
    list.append(term, description);
  });
  details.append(summary, list);
  detailsCell.append(details);
  row.append(detailsCell);
  return row;
}

function formatTime(value) {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? new Date(timestamp).toLocaleTimeString() : "—";
}

function formatAxisTime(value) {
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}
