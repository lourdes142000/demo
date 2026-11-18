const output = document.querySelector("#terminal-output");
const form = document.querySelector("#terminal-form");
const input = document.querySelector("#terminal-input");
const prompt = document.querySelector("#terminal-prompt");

const LAB_HOST = "192.168.1.5";
const TARGET_IP = "192.168.1.5";
const SOURCE_IP = "192.0.2.44";
const SSH_USER = "labuser";
const FAKE_PASSWORD = "weakpass123";
const HYDRA_SIM_COMMAND = `hydra-sim --target ${TARGET_IP} --port 22 --account ${SSH_USER}`;
const OPEN_PORTS = [
  { port: 22, service: "ssh" },
  { port: 80, service: "http" },
  { port: 443, service: "https" },
  { port: 8080, service: "http-alt" }
];

let scanComplete = false;
let credentialFound = false;
let sshConnected = false;
let awaitingPassword = false;
let sshPasswordFailures = 0;
let hydraSimulationRunning = false;
let runGeneration = 0;
let eventSequence = 0;

function appendLine(line = "") {
  output.textContent += `${output.textContent ? "\n" : ""}${line}`;
  output.scrollTop = output.scrollHeight;
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function recordEvent(event) {
  try {
    DemoEvents.publish({
      id: `event-${Date.now()}-${++eventSequence}`,
      timestamp: new Date().toISOString(),
      ...event
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The local SIEM feed could not be updated.";
    throw new Error(message);
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = input.value;
  input.value = "";

  if (awaitingPassword) {
    handlePassword(value);
    return;
  }

  const command = value.trim();
  if (!command) return;
  appendLine(`${prompt.textContent} ${command}`);
  if (command.length > 80) {
    appendLine("command too long");
    return;
  }

  if (command === "restart") {
    resetLab();
  } else if (command === "clear") {
    output.textContent = "";
  } else if (command === "help") {
    appendLine(`nmap ${TARGET_IP}`);
    appendLine(HYDRA_SIM_COMMAND);
    appendLine(`ssh ${SSH_USER}@${LAB_HOST}`);
    appendLine("restart · clear · help");
  } else if (sshConnected) {
    runMockShellCommand(command);
  } else if (command === `nmap ${TARGET_IP}`) {
    runNmap();
  } else if (command.startsWith("nmap ")) {
    appendLine(`[nmap] host not found in lab: ${command.slice(5)}`);
  } else if (command === HYDRA_SIM_COMMAND) {
    void startHydraSimulation();
  } else if (command === `ssh ${SSH_USER}@${TARGET_IP}`) {
    startSshLogin();
  } else {
    appendLine(`command not found: ${command}`);
  }
});

input.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  event.preventDefault();
  form.requestSubmit();
});

function runNmap() {
  appendLine(`Starting Nmap 7.94 ( ${LAB_HOST} )`);
  appendLine(`Nmap scan report for ${LAB_HOST} (${TARGET_IP})`);
  appendLine("PORT     STATE SERVICE");

  try {
    for (const { port, service } of OPEN_PORTS) {
      recordEvent({
        type: "port_probe",
        source: SOURCE_IP,
        target: LAB_HOST,
        targetIp: TARGET_IP,
        destinationPort: port,
        service,
        result: "OPEN",
        severity: "info",
        message: `TCP probe observed on ${port}/${service}`,
        logLine: `ids: TCP SYN ${SOURCE_IP} -> ${TARGET_IP}:${port}`
      });
      const portLabel = `${port}/tcp`.padEnd(9);
      appendLine(`${portLabel} open   ${service}`);
    }
    scanComplete = true;
    appendLine("Nmap done: 1 host up");
  } catch (error) {
    appendError(error);
  }
}

async function startHydraSimulation() {
  if (!scanComplete) {
    appendLine("[hydra-sim] run nmap first");
    return;
  }
  if (credentialFound) {
    appendLine("[hydra-sim] credential already found; use restart to reset");
    return;
  }
  if (hydraSimulationRunning) {
    appendLine("[hydra-sim] already running");
    return;
  }

  hydraSimulationRunning = true;
  const generation = ++runGeneration;
  appendLine(`[hydra-sim] simulating SSH authentication attempts against ${TARGET_IP}:22 for ${SSH_USER}`);

  try {
    for (let attempt = 1; attempt <= 5; attempt += 1) {
      await delay(500);
      if (generation !== runGeneration) return;
      const sourcePort = 50100 + attempt;
      const logLine = `sshd[1021]: Failed password for ${SSH_USER} from ${SOURCE_IP} port ${sourcePort} ssh2`;
      recordEvent({
        type: "ssh_auth_failure",
        source: SOURCE_IP,
        target: LAB_HOST,
        targetIp: TARGET_IP,
        destinationPort: 22,
        account: SSH_USER,
        result: "FAIL",
        severity: "medium",
        message: "Failed SSH password authentication",
        logLine
      });
      appendLine(logLine);
    }

    await delay(600);
    if (generation !== runGeneration) return;
    const sourcePort = 50106;
    const acceptedLog = `sshd[1021]: Accepted password for ${SSH_USER} from ${SOURCE_IP} port ${sourcePort} ssh2`;
    recordEvent({
      type: "ssh_auth_success",
      source: SOURCE_IP,
      target: LAB_HOST,
      targetIp: TARGET_IP,
      destinationPort: 22,
      account: SSH_USER,
      result: "ACCEPTED",
      severity: "high",
      message: "SSH password authentication accepted",
      logLine: acceptedLog
    });
    credentialFound = true;
    appendLine(acceptedLog);
    appendLine(`[hydra-sim] simulated credential: ${SSH_USER} / ${FAKE_PASSWORD}`);
  } catch (error) {
    appendError(error);
  } finally {
    if (generation === runGeneration) hydraSimulationRunning = false;
  }
}

function startSshLogin() {
  if (!scanComplete) {
    appendLine("[ssh] run nmap first");
    return;
  }
  if (!credentialFound) {
    appendLine(`[ssh] no simulated credential yet; run ${HYDRA_SIM_COMMAND}`);
    return;
  }

  awaitingPassword = true;
  sshPasswordFailures = 0;
  input.type = "password";
  prompt.textContent = `${SSH_USER}@${LAB_HOST}'s password:`;
}

function handlePassword(password) {
  input.type = "text";
  if (password === FAKE_PASSWORD) {
    awaitingPassword = false;
    sshConnected = true;
    const sourcePort = 50200;
    const acceptedLog = `sshd[1054]: Accepted password for ${SSH_USER} from ${SOURCE_IP} port ${sourcePort} ssh2`;
    const sessionLog = `sshd[1054]: pam_unix(sshd:session): session opened for user ${SSH_USER} by (uid=0)`;
    try {
      recordEvent({
        type: "ssh_auth_success",
        source: SOURCE_IP,
        target: LAB_HOST,
        targetIp: TARGET_IP,
        destinationPort: 22,
        account: SSH_USER,
        result: "ACCEPTED",
        severity: "high",
        message: "SSH password authentication accepted",
        logLine: acceptedLog
      });
      recordEvent({
        type: "ssh_session_open",
        source: SOURCE_IP,
        target: LAB_HOST,
        targetIp: TARGET_IP,
        destinationPort: 22,
        account: SSH_USER,
        result: "OPEN",
        severity: "info",
        message: "SSH session opened",
        logLine: sessionLog
      });
    } catch (error) {
      sshConnected = false;
      awaitingPassword = false;
      prompt.textContent = "attacker@attacker.local:~$";
      appendError(error);
      return;
    }
    prompt.textContent = `${SSH_USER}@${LAB_HOST}:~$`;
    appendLine(acceptedLog);
    appendLine(sessionLog);
    appendLine(`Last login from ${SOURCE_IP}`);
    return;
  }

  sshPasswordFailures += 1;
  const sourcePort = 50200 + sshPasswordFailures;
  const logLine = `sshd[1054]: Failed password for ${SSH_USER} from ${SOURCE_IP} port ${sourcePort} ssh2`;
  try {
    recordEvent({
      type: "ssh_auth_failure",
      source: SOURCE_IP,
      target: LAB_HOST,
      targetIp: TARGET_IP,
      destinationPort: 22,
      account: SSH_USER,
      result: "FAIL",
      severity: "medium",
      message: "Failed SSH password authentication",
      logLine
    });
  } catch (error) {
    appendError(error);
  }
  appendLine(logLine);
  appendLine("Permission denied");
  if (sshPasswordFailures >= 3) {
    awaitingPassword = false;
    prompt.textContent = "attacker@attacker.local:~$";
  } else {
    input.type = "password";
    prompt.textContent = `${SSH_USER}@${LAB_HOST}'s password:`;
  }
}

function runMockShellCommand(command) {
  if (command === "whoami") {
    appendLine(SSH_USER);
  } else if (command === "hostname") {
    appendLine(LAB_HOST);
  } else if (command === "pwd") {
    appendLine(`/home/${SSH_USER}`);
  } else if (command === "exit") {
    const logLine = `sshd[1054]: pam_unix(sshd:session): session closed for user ${SSH_USER}`;
    try {
      recordEvent({
        type: "ssh_session_close",
        source: SOURCE_IP,
        target: LAB_HOST,
        targetIp: TARGET_IP,
        destinationPort: 22,
        account: SSH_USER,
        result: "CLOSED",
        severity: "info",
        message: "SSH session closed",
        logLine
      });
    } catch (error) {
      appendError(error);
    }
    sshConnected = false;
    prompt.textContent = "attacker@attacker.local:~$";
    appendLine(logLine);
  } else {
    appendLine(`command not found: ${command}`);
  }
}

function resetLab() {
  runGeneration += 1;
  hydraSimulationRunning = false;
  scanComplete = false;
  credentialFound = false;
  sshConnected = false;
  awaitingPassword = false;
  sshPasswordFailures = 0;
  input.type = "text";
  prompt.textContent = "attacker@attacker.local:~$";
  try {
    DemoEvents.clear();
    output.textContent = "";
    appendLine("[restart] lab reset");
  } catch (error) {
    appendError(error);
  }
}

function appendError(error) {
  const message = error instanceof Error ? error.message : "The local event feed could not be updated.";
  appendLine(`[error] ${message}`);
}
