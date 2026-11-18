const answerFingerprint = "va|patch+reachability|finding-b+finding-c+finding-a|attacker-ip+failed-count-5+ssh-destination-port-22|report-elements|same-method-same-scope";

const missions = [
  {
    tag: "01 / FOUNDATIONS",
    title: "Name the engagement",
    scenarioLabel: "ENGAGEMENT BRIEF",
    scenario: "Northstar has several approved servers and applications. The team wants a broad list of known weaknesses, a manual check that scanner results are accurate, and a ranked plan for what to fix. They are not being asked to prove a complete attack or test whether defenders notice a simulated adversary.",
    question: "Which assessment type best matches the team's scope and goal?",
    type: "radio",
    correct: ["va"],
    answers: [
      { id: "va", title: "Vulnerability assessment", detail: "Review many approved assets, validate possible weaknesses, and prioritize fixes." },
      { id: "pentest", title: "Penetration test", detail: "Safely test selected weaknesses to show whether they can be exploited and what the impact would be." },
      { id: "redteam", title: "Red team", detail: "Simulate an adversary pursuing a goal while defenders' detection and response are observed." }
    ],
    explanation: "A vulnerability assessment identifies and prioritizes weaknesses. A pentest demonstrates exploitability; a red team tests whether an objective can be reached and detected."
  },
  {
    tag: "02 / VALIDATION",
    title: "Treat the alert as a lead",
    scenarioLabel: "SCANNER OUTPUT · NORTHSTAR-WEB-02",
    scenario: "A scanner says Northstar's public web server may have a security problem because of its version number. The scanner is not sure. Sometimes a fix is installed even when the displayed version does not change.",
    question: "What two things should you check before reporting this as a real problem?",
    hint: "Select two.",
    type: "checkbox",
    correct: ["patch", "reachability"],
    answers: [
      { id: "patch", title: "Check whether the security fix is already installed", detail: "Ask the system owner or check trusted update records." },
      { id: "reachability", title: "Check whether the affected service or feature is available to users", detail: "A version number alone does not prove that the system is at risk." },
      { id: "report", title: "Report it as critical right away", detail: "First confirm that the scanner is correct." },
      { id: "exploit", title: "Try an exploit immediately", detail: "Only test with written permission and agreed safety rules." }
    ],
    explanation: "A version number alone does not prove a system is vulnerable. First check whether the fix is installed and whether the affected service is available to users. Only do further testing with written permission."
  },
  {
    tag: "03 / PRIORITIZATION",
    title: "Put risk in context",
    scenarioLabel: "NORTHSTAR FINDINGS",
    scenario: "Northstar found five problems but cannot fix them all at once. Choose three to fix first. Think about whether people on the internet can reach the system, whether attackers are already using the problem, and how much harm it could cause.",
    question: "Move your top three problems to the right and rank them: first, second, and third.",
    hint: "Drag items or use Add and the Up/Down buttons. The first item is the one to fix first.",
    type: "rank",
    correct: ["finding-b", "finding-c", "finding-a"],
    answers: [
      { id: "finding-a", title: "A · Run code on a test server", detail: "Someone who can reach the server could run commands. It has a very high score (CVSS 9.8), but it is isolated and holds no data." },
      { id: "finding-b", title: "B · Bypass the customer portal login", detail: "Attackers can get past the portal's login. The portal is online, and attackers are already using this problem." },
      { id: "finding-c", title: "C · Default administrator password", detail: "The management page is open to internet users and still uses its default password." },
      { id: "finding-d", title: "D · Old encryption on an internal printer", detail: "The printer is only reachable inside Northstar's network. CVSS score: 5.3." },
      { id: "finding-e", title: "E · Detailed error messages", detail: "A public website reveals technical information in errors, but there is no evidence attackers are using them to get access." }
    ],
    explanation: "Fix B first because it is online and attackers are already using it. Fix C next because the online management page uses a default password. A is serious, but its server is isolated and holds no data. New business information could change this order."
  },
  {
    tag: "04 / DEFENDER VIEW",
    title: "Read the other side",
    scenarioLabel: "ATTACKER ↔ DEFENDER",
    scenario: "A defender is reviewing the prepared logs from the Northstar SSH activity. Use the records below to identify who connected, how many logins failed, and which port the SSH service uses.",
    question: "Answer these three questions using the log excerpt.",
    type: "quiz",
    questions: [
      {
        id: "attacker-ip",
        prompt: "What is the attacker's IP address?",
        answers: [
          { id: "attacker", title: "192.0.2.44" },
          { id: "target", title: "192.168.1.5" },
          { id: "other", title: "192.0.2.10" }
        ]
      },
      {
        id: "failed-count",
        prompt: "How many failed SSH login attempts are shown?",
        answers: [
          { id: "four", title: "4" },
          { id: "five", title: "5" },
          { id: "six", title: "6" }
        ]
      },
      {
        id: "ssh-port",
        prompt: "Which port is the SSH service using?",
        answers: [
          { id: "22", title: "22" },
          { id: "80", title: "80" },
          { id: "50106", title: "50106" }
        ]
      }
    ],
    correct: {
      "attacker-ip": "attacker",
      "failed-count": "five",
      "ssh-port": "22"
    },
    logEvidence: `network: TCP SYN 192.0.2.44 -> 192.168.1.5:22
sshd[1021]: Failed password for labuser from 192.0.2.44 port 50101 ssh2
sshd[1021]: Failed password for labuser from 192.0.2.44 port 50102 ssh2
sshd[1021]: Failed password for labuser from 192.0.2.44 port 50103 ssh2
sshd[1021]: Failed password for labuser from 192.0.2.44 port 50104 ssh2
sshd[1021]: Failed password for labuser from 192.0.2.44 port 50105 ssh2
sshd[1021]: Accepted password for labuser from 192.0.2.44 port 50106 ssh2
sshd[1021]: pam_unix(sshd:session): session opened for user labuser by (uid=0)`,
    explanation: "The attacker source is 192.0.2.44. The logs show five failed SSH attempts. The network record shows the SSH service destination port is 22; port numbers in the sshd lines are the client's temporary source ports."
  },
  {
    tag: "05 / REPORTING",
    title: "Make the finding actionable",
    scenarioLabel: "REPORT DRAFT",
    scenario: "A draft report says, “SQL injection found. Critical. Fix it.” The application owner cannot tell which application or page is affected, how the issue was confirmed, what could happen, or how to fix it. The draft includes none of that information.",
    question: "Which details should the final report include so the owner can understand, verify, prioritize, and fix the issue?",
    hint: "Select the five useful report details.",
    type: "checkbox",
    correct: ["asset", "impact", "evidence", "steps", "fix"],
    answers: [
      { id: "asset", title: "A clear title and affected application or page", detail: "Identify exactly where the issue was found so the right owner can act." },
      { id: "impact", title: "The likely impact and why the severity rating fits", detail: "Explain what could happen and how exposure affects the priority." },
      { id: "evidence", title: "Relevant evidence", detail: "Include enough safely handled evidence to support the finding." },
      { id: "steps", title: "Safe reproduction steps", detail: "Give the owner clear steps to confirm the issue within the approved scope." },
      { id: "fix", title: "A practical fix and retest guidance", detail: "Recommend how to address the issue and how to confirm the fix worked." },
      { id: "blame", title: "Name the person who introduced it", detail: "Personal blame does not help validate or remediate a finding." }
    ],
    explanation: "A strong finding includes the affected asset, impact, evidence, reproducible steps, a realistic fix, and severity with rationale. Handle evidence and personal data carefully."
  },
  {
    tag: "06 / RETEST",
    title: "Close the loop",
    scenarioLabel: "REMEDIATION UPDATE",
    scenario: "The service owner says they installed a patch and asks you to close the finding. You have not checked the service since the change. The original assessment scope and rules are still in effect.",
    question: "What should you do before marking the finding resolved?",
    type: "radio",
    correct: ["retest"],
    answers: [
      { id: "close", title: "Close it based on the owner's update", detail: "A report that a patch was installed is useful, but it does not confirm the issue is fixed." },
      { id: "retest", title: "Retest the affected service within the original scope", detail: "Use the same safe check, record whether the issue is resolved, and note any remaining risk." },
      { id: "rescan", title: "Scan every company asset without coordinating", detail: "This goes beyond the agreed scope and does not specifically verify the reported fix." }
    ],
    explanation: "Retest within the agreed scope using the same method, confirm the weakness is resolved, and document the outcome. A retest feeds into the next assessment cycle."
  }
];

const content = document.querySelector("#mission-content");
const checkpointList = document.querySelector("#checkpoint-list");
const progressCount = document.querySelector("#progress-count");
let currentMission = 0;
const completedMissions = new Set();
const savedResponses = new Map();
const incorrectAttempts = new Map();
const revealedAnswers = new Set();

renderMission();

function renderCheckpoints() {
  checkpointList.innerHTML = missions.map((mission, index) => {
    const isCurrent = index === currentMission;
    const isDone = completedMissions.has(index);
    const state = isDone ? "is-done" : isCurrent ? "is-current" : "";
    const label = mission.tag.split("/ ")[1].toLowerCase();
    const marker = isDone ? "✓" : String(index + 1).padStart(2, "0");
    return `<li class="${state}"><span class="checkpoint-icon">${marker}</span>${label}</li>`;
  }).join("");
  progressCount.textContent = `${completedMissions.size} / ${missions.length} complete`;
}

function renderMission() {
  renderCheckpoints();
  const mission = missions[currentMission];
  const options = (mission.answers || []).map((answer) => `
    <label class="answer-option">
      <input type="${mission.type}" name="mission-answer" value="${answer.id}">
      <span class="choice-copy"><strong>${answer.title}</strong><small>${answer.detail}</small></span>
    </label>`).join("");
  const answerContent = mission.type === "rank"
    ? renderRankExercise(mission)
    : mission.type === "match"
      ? renderMatchExercise(mission)
      : mission.type === "quiz"
        ? renderQuizExercise(mission)
      : `<fieldset class="answer-list"><legend class="visually-hidden">Answer choices</legend>${options}</fieldset>`;

  content.innerHTML = `
    <div class="mission-heading"><span class="mission-tag">${mission.tag}</span><span>CHECKPOINT ${String(currentMission + 1).padStart(2, "0")} / ${String(missions.length).padStart(2, "0")}</span></div>
    <h2>${mission.title}</h2>
    <div class="scenario"><span class="scenario-label">${mission.scenarioLabel}</span>${mission.scenario}</div>
    <form id="mission-form">
      <p class="question-label">${mission.question}${mission.hint ? `<span class="question-hint">${mission.hint}</span>` : ""}</p>
      ${answerContent}
      <div class="mission-actions">
        <button id="check-answer" class="button button-primary" type="submit">Check answer</button>
        <button id="show-answer" class="button button-secondary" type="button" ${((incorrectAttempts.get(currentMission) || 0) < 1) ? "hidden" : ""}>Show answer</button>
        <p id="answer-feedback" class="answer-feedback" aria-live="polite"></p>
      </div>
      <p id="feedback-detail" class="feedback-detail" hidden></p>
      <p id="answer-reveal" class="answer-reveal" aria-live="polite" hidden></p>
      <div class="mission-actions mission-navigation">
        <button id="previous-mission" class="button button-secondary mission-arrow" type="button" aria-label="Previous question" title="Previous question" ${currentMission === 0 ? "hidden" : ""}><span aria-hidden="true">←</span></button>
        <button id="next-mission" class="button button-secondary mission-arrow" type="button" aria-label="${currentMission === missions.length - 1 ? "Complete activity" : "Next question"}" title="${currentMission === missions.length - 1 ? "Complete activity" : "Next question"}"><span aria-hidden="true">→</span></button>
      </div>
    </form>`;

  document.querySelector("#mission-form").addEventListener("submit", checkAnswer);
  document.querySelector("#show-answer").addEventListener("click", () => revealAnswer(mission));
  document.querySelector("#previous-mission").addEventListener("click", previousMission);
  document.querySelector("#next-mission").addEventListener("click", advanceMission);
  restoreCurrentResponse(mission);
  if (revealedAnswers.has(currentMission)) revealAnswer(mission);
  if (completedMissions.has(currentMission)) lockCompletedMission(mission);
}

function renderRankExercise(mission) {
  const items = mission.answers.map((answer) => `
    <li class="rank-item" draggable="true" data-rank-id="${answer.id}">
      <div class="rank-copy"><strong>${answer.title}</strong><small>${answer.detail}</small></div>
      <div class="rank-controls"></div>
    </li>`).join("");
  return `
    <div class="rank-columns" id="rank-lists">
      <section class="rank-zone">
        <h3>Findings</h3>
        <ul class="rank-list" id="rank-pool" data-rank-zone="pool">${items}</ul>
      </section>
      <section class="rank-zone">
        <h3>Your top three <span>Highest priority first</span></h3>
        <ol class="rank-list priority-list" id="priority-list" data-rank-zone="priority"></ol>
      </section>
    </div>
    <p id="rank-count" class="rank-count" role="status">0 / 3 selected</p>`;
}

function renderMatchExercise(mission) {
  const rows = mission.matches.map((match) => `
    <label class="match-row">
      <span class="match-action">${match.title}</span>
      <select data-match-id="${match.id}" aria-label="Signal for ${match.title}">
        <option value="">Choose a signal</option>
        ${mission.matchOptions.map((option) => `<option value="${option.id}">${option.title}</option>`).join("")}
      </select>
    </label>`).join("");
  return `<div class="match-list">${rows}</div>`;
}

function renderQuizExercise(mission) {
  const questions = mission.questions.map((question) => `
    <fieldset class="quiz-question">
      <legend>${question.prompt}</legend>
      <div class="quiz-options">
        ${question.answers.map((answer) => `
          <label class="answer-option">
            <input type="radio" name="quiz-${question.id}" value="${answer.id}" data-quiz-id="${question.id}">
            <span class="choice-copy"><strong>${answer.title}</strong></span>
          </label>`).join("")}
      </div>
    </fieldset>`).join("");
  return `
    <div class="quiz-questions">${questions}</div>
    <section class="evidence-logs" aria-labelledby="evidence-logs-title">
      <h3 id="evidence-logs-title">Log excerpt</h3>
      <p>Use these prepared logs to answer the questions. The network record shows the service port; the port in each SSH log is the client's temporary port.</p>
      <pre>${mission.logEvidence}</pre>
    </section>`;
}

function setupRankExercise(savedOrder = []) {
  const lists = document.querySelector("#rank-lists");
  const pool = document.querySelector("#rank-pool");
  const priorities = document.querySelector("#priority-list");
  const count = document.querySelector("#rank-count");

  function updateControls() {
    const selectedCount = priorities.children.length;
    count.textContent = `${selectedCount} / 3 selected`;
    document.querySelectorAll(".rank-item").forEach((item) => {
      const controls = item.querySelector(".rank-controls");
      const inPriorityList = item.parentElement === priorities;
      const actions = inPriorityList
        ? [
            ["up", "Up", item.previousElementSibling === null],
            ["down", "Down", item.nextElementSibling === null],
            ["remove", "Remove", false]
          ]
        : [["add", "Add", selectedCount >= 3]];
      controls.replaceChildren(...actions.map(([action, label, disabled]) => {
        const button = document.createElement("button");
        button.type = "button";
        button.dataset.rankAction = action;
        button.textContent = label;
        button.disabled = disabled;
        button.setAttribute("aria-label", `${label} ${item.querySelector("strong").textContent}`);
        return button;
      }));
      item.draggable = true;
    });
  }

  function moveItem(item, destination, before = null) {
    if (destination === priorities && item.parentElement !== priorities && priorities.children.length >= 3) return;
    if (before === item) before = null;
    destination.insertBefore(item, before);
    updateControls();
  }

  lists.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-rank-action]");
    if (!button) return;
    const item = button.closest(".rank-item");
    const action = button.dataset.rankAction;
    if (action === "add") {
      moveItem(item, priorities);
    } else if (action === "remove") {
      moveItem(item, pool);
    } else if (action === "up" && item.previousElementSibling) {
      priorities.insertBefore(item, item.previousElementSibling);
      updateControls();
    } else if (action === "down" && item.nextElementSibling) {
      priorities.insertBefore(item.nextElementSibling, item);
      updateControls();
    }
  });

  lists.addEventListener("dragstart", (event) => {
    const item = event.target.closest(".rank-item");
    if (!item || !event.dataTransfer) return;
    event.dataTransfer.setData("text/plain", item.dataset.rankId);
    event.dataTransfer.effectAllowed = "move";
  });
  lists.addEventListener("dragover", (event) => {
    if (event.target.closest("[data-rank-zone]")) event.preventDefault();
  });
  lists.addEventListener("drop", (event) => {
    const destination = event.target.closest("[data-rank-zone]");
    const id = event.dataTransfer?.getData("text/plain");
    if (!destination || !id) return;
    event.preventDefault();
    const item = [...lists.querySelectorAll(".rank-item")].find((candidate) => candidate.dataset.rankId === id);
    if (!item) return;
    const before = event.target.closest(".rank-item");
    moveItem(item, destination, before);
  });

  for (const id of savedOrder) {
    const item = [...pool.querySelectorAll(".rank-item")].find((candidate) => candidate.dataset.rankId === id);
    if (item && priorities.children.length < 3) priorities.append(item);
  }
  updateControls();
}

function saveCurrentResponse() {
  const mission = missions[currentMission];
  if (mission.type === "rank") {
    savedResponses.set(currentMission, [...document.querySelectorAll("#priority-list [data-rank-id]")].map((item) => item.dataset.rankId));
  } else if (mission.type === "match") {
    savedResponses.set(currentMission, Object.fromEntries(
      [...document.querySelectorAll("[data-match-id]")].map((select) => [select.dataset.matchId, select.value])
    ));
  } else if (mission.type === "quiz") {
    savedResponses.set(currentMission, Object.fromEntries(
      [...document.querySelectorAll("[data-quiz-id]:checked")].map((input) => [input.dataset.quizId, input.value])
    ));
  } else {
    savedResponses.set(currentMission, [...document.querySelectorAll('input[name="mission-answer"]:checked')].map((input) => input.value));
  }
}

function restoreCurrentResponse(mission) {
  const response = savedResponses.get(currentMission);
  if (mission.type === "rank") {
    setupRankExercise(Array.isArray(response) ? response : []);
  } else if (mission.type === "match" && response) {
    document.querySelectorAll("[data-match-id]").forEach((select) => {
      select.value = response[select.dataset.matchId] || "";
    });
  } else if (mission.type === "quiz" && response) {
    document.querySelectorAll("[data-quiz-id]").forEach((input) => {
      input.checked = response[input.dataset.quizId] === input.value;
    });
  } else if (Array.isArray(response)) {
    document.querySelectorAll('input[name="mission-answer"]').forEach((input) => {
      input.checked = response.includes(input.value);
    });
  }
}

function checkAnswer(event) {
  event.preventDefault();
  saveCurrentResponse();
  const mission = missions[currentMission];
  const expected = mission.type === "rank"
    ? [...mission.correct]
    : mission.type === "quiz"
      ? mission.correct
      : [...(mission.correct || [])].sort();
  const selected = mission.type === "rank"
    ? [...document.querySelectorAll("#priority-list [data-rank-id]")].map((item) => item.dataset.rankId)
    : mission.type === "match"
      ? [...document.querySelectorAll("[data-match-id]")].map((select) => [select.dataset.matchId, select.value])
      : mission.type === "quiz"
        ? Object.fromEntries([...document.querySelectorAll("[data-quiz-id]:checked")].map((input) => [input.dataset.quizId, input.value]))
      : [...document.querySelectorAll('input[name="mission-answer"]:checked')].map((input) => input.value).sort();
  const feedback = document.querySelector("#answer-feedback");
  const correct = mission.type === "rank"
    ? selected.length === expected.length && selected.every((answer, index) => answer === expected[index])
    : mission.type === "match"
      ? selected.length === mission.matches.length && selected.every(([id, answer]) => mission.matches.find((match) => match.id === id)?.correct === answer)
      : mission.type === "quiz"
        ? mission.questions.every((question) => selected[question.id] === expected[question.id])
      : selected.length === expected.length && selected.every((answer, index) => answer === expected[index]);
  const hasSelection = mission.type === "match"
    ? selected.some(([, answer]) => answer)
    : mission.type === "quiz"
      ? Object.keys(selected).length > 0
      : selected.length > 0;

  if (!correct) {
    if (hasSelection) {
      const attempts = (incorrectAttempts.get(currentMission) || 0) + 1;
      incorrectAttempts.set(currentMission, attempts);
      if (attempts >= 1) document.querySelector("#show-answer").hidden = false;
      feedback.textContent = attempts >= 1
        ? "Not quite. You can show the answer or try again."
        : "Not quite. Review the scenario and try again.";
    } else {
      feedback.textContent = "Choose an answer before checking.";
    }
    feedback.className = "answer-feedback is-wrong";
    document.querySelector("#feedback-detail").hidden = true;
    return;
  }

  completedMissions.add(currentMission);
  lockCompletedMission(mission);
  renderCheckpoints();
}

function revealAnswer(mission) {
  const reveal = document.querySelector("#answer-reveal");
  let answer;
  if (mission.type === "rank") {
    answer = mission.correct.map((id) => mission.answers.find((item) => item.id === id)?.title).join(" → ");
  } else if (mission.type === "match") {
    answer = mission.matches.map((match) => {
      const signal = mission.matchOptions.find((option) => option.id === match.correct)?.title;
      return `${match.title} → ${signal}`;
    }).join("; ");
  } else if (mission.type === "quiz") {
    answer = mission.questions.map((question) => {
      const correctId = mission.correct[question.id];
      const title = question.answers.find((option) => option.id === correctId)?.title;
      return `${question.prompt} ${title}`;
    }).join("; ");
  } else {
    answer = mission.answers
      .filter((item) => mission.correct.includes(item.id))
      .map((item) => item.title)
      .join("; ");
  }
  reveal.textContent = `Answer: ${answer}. ${mission.explanation}`;
  reveal.hidden = false;
  revealedAnswers.add(currentMission);
}

function lockCompletedMission(mission) {
  const feedback = document.querySelector("#answer-feedback");
  const detail = document.querySelector("#feedback-detail");
  feedback.textContent = mission.type === "rank" ? "Correct. Ranking saved." : "Correct. Checkpoint cleared.";
  feedback.className = "answer-feedback is-right";
  detail.textContent = mission.explanation;
  detail.hidden = false;
  document.querySelector("#check-answer").disabled = true;
  document.querySelectorAll("#mission-form input").forEach((input) => { input.disabled = true; });
  document.querySelectorAll("#mission-form select, #mission-form .rank-controls button").forEach((control) => { control.disabled = true; });
  document.querySelectorAll("#mission-form [data-rank-id]").forEach((item) => { item.draggable = false; });
}

function previousMission() {
  if (currentMission === 0) return;
  saveCurrentResponse();
  currentMission -= 1;
  renderMission();
}

async function advanceMission() {
  saveCurrentResponse();
  if (currentMission < missions.length - 1) {
    currentMission += 1;
    renderMission();
    return;
  }

  if (completedMissions.size !== missions.length) {
    const feedback = document.querySelector("#answer-feedback");
    feedback.textContent = "Complete the unanswered checkpoints to receive your completion code. Use Previous to go back.";
    feedback.className = "answer-feedback is-wrong";
    return;
  }

  try {
    await renderCompletion();
  } catch (error) {
    const message = error instanceof Error ? error.message : "The browser could not create a completion receipt.";
    content.innerHTML = `<p class="answer-feedback is-wrong">${escapeHtml(message)} Refresh the page to retry the activity.</p>`;
  }
}

async function renderCompletion() {
  const randomBytes = new Uint8Array(10);
  if (!globalThis.crypto?.getRandomValues || !globalThis.crypto?.subtle) {
    throw new Error("Secure browser cryptography is unavailable.");
  }
  globalThis.crypto.getRandomValues(randomBytes);
  const nonce = [...randomBytes].map((byte) => byte.toString(16).padStart(2, "0")).join("").toUpperCase();
  const fingerprint = (await sha256(answerFingerprint)).slice(0, 8);
  const core = `BWF1-${nonce}-${fingerprint}`;
  const checksum = (await sha256(core)).slice(0, 8);
  const code = `${core}-${checksum}`;

  content.innerHTML = `
    <div class="completion">
      <div class="completion-symbol" aria-hidden="true">✓</div>
      <div class="mission-tag">ALL CHECKPOINTS CLEARED</div>
      <h2>Good assessment.</h2>
      <p class="completion-summary">You distinguished assessment types, validated a scanner lead, prioritized with context, read the defender's view, and closed the loop with reporting and retesting.</p>
      <p class="receipt-label">YOUR COMPLETION RECEIPT</p>
      <div id="receipt-code" class="receipt-code" role="status">${code}</div>
      <div class="receipt-actions">
        <button id="copy-code" class="button button-quiet" type="button">Copy code</button>
      </div>
      <p id="copy-status" class="answer-feedback" aria-live="polite"></p>
    </div>`;
  document.querySelector("#copy-code").addEventListener("click", copyReceipt);
}

async function copyReceipt() {
  const code = document.querySelector("#receipt-code").textContent;
  const status = document.querySelector("#copy-status");
  try {
    await navigator.clipboard.writeText(code);
    status.textContent = "Copied to clipboard.";
    status.className = "answer-feedback is-right";
  } catch {
    status.textContent = "Copy was blocked by the browser. Select the receipt above and copy it manually.";
    status.className = "answer-feedback is-wrong";
  }
}

async function sha256(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("").toUpperCase();
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}
