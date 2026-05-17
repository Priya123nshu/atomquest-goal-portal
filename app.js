const STORAGE_KEY = "atomquest-goal-portal-v1";

const seed = {
  currentUserId: "e1",
  activeView: "goals",
  activeQuarter: "Q1",
  cycle: {
    name: "FY 2026-27",
    activePhase: "phase1",
    goalOpen: "2026-05-01",
    q1: "July",
    q2: "October",
    q3: "January",
    q4: "March / April"
  },
  users: [
    { id: "e1", name: "Aarav Mehta", role: "employee", department: "Sales", managerId: "m1" },
    { id: "e2", name: "Nisha Rao", role: "employee", department: "Operations", managerId: "m1" },
    { id: "m1", name: "Kavya Menon", role: "manager", department: "Revenue", managerId: "a1" },
    { id: "a1", name: "Rohan Sethi", role: "admin", department: "HR", managerId: "" }
  ],
  goalSheets: [
    {
      employeeId: "e1",
      status: "draft",
      locked: false,
      lockedAt: "",
      returnedReason: "",
      goals: [
        {
          id: "g1",
          thrustArea: "Revenue Growth",
          title: "Enterprise sales revenue",
          description: "Deliver revenue from enterprise accounts.",
          uom: "min",
          target: 1200000,
          deadline: "",
          weightage: 45,
          sharedGroupId: "",
          primaryOwnerId: "e1",
          actuals: { Q1: 250000, Q2: "", Q3: "", Q4: "" },
          statuses: { Q1: "On Track", Q2: "Not Started", Q3: "Not Started", Q4: "Not Started" }
        },
        {
          id: "g2",
          thrustArea: "Customer Success",
          title: "Renewal rate",
          description: "Improve renewal performance for managed accounts.",
          uom: "minPercent",
          target: 92,
          deadline: "",
          weightage: 35,
          sharedGroupId: "",
          primaryOwnerId: "e1",
          actuals: { Q1: 88, Q2: "", Q3: "", Q4: "" },
          statuses: { Q1: "On Track", Q2: "Not Started", Q3: "Not Started", Q4: "Not Started" }
        },
        {
          id: "g3",
          thrustArea: "Quality",
          title: "CRM hygiene",
          description: "Keep overdue CRM tasks at zero.",
          uom: "zero",
          target: 0,
          deadline: "",
          weightage: 20,
          sharedGroupId: "",
          primaryOwnerId: "e1",
          actuals: { Q1: 0, Q2: "", Q3: "", Q4: "" },
          statuses: { Q1: "Completed", Q2: "Not Started", Q3: "Not Started", Q4: "Not Started" }
        }
      ]
    },
    {
      employeeId: "e2",
      status: "submitted",
      locked: false,
      lockedAt: "",
      returnedReason: "",
      goals: [
        {
          id: "g4",
          thrustArea: "Efficiency",
          title: "Reduce ticket turnaround time",
          description: "Lower average ticket turnaround time.",
          uom: "max",
          target: 18,
          deadline: "",
          weightage: 50,
          sharedGroupId: "",
          primaryOwnerId: "e2",
          actuals: { Q1: 21, Q2: "", Q3: "", Q4: "" },
          statuses: { Q1: "On Track", Q2: "Not Started", Q3: "Not Started", Q4: "Not Started" }
        },
        {
          id: "g5",
          thrustArea: "People",
          title: "SOP training completion",
          description: "Complete all SOP training for operations analysts.",
          uom: "timeline",
          target: "2026-07-31",
          deadline: "2026-07-31",
          weightage: 50,
          sharedGroupId: "",
          primaryOwnerId: "e2",
          actuals: { Q1: "2026-07-25", Q2: "", Q3: "", Q4: "" },
          statuses: { Q1: "Completed", Q2: "Not Started", Q3: "Not Started", Q4: "Not Started" }
        }
      ]
    }
  ],
  checkins: [
    { id: "c1", employeeId: "e1", managerId: "m1", quarter: "Q1", comment: "Revenue ramp is healthy; keep focus on renewal risk.", completedAt: "2026-07-18" }
  ],
  audit: [
    { id: "a01", at: "2026-05-10 10:30", actorId: "a1", action: "Seeded demo cycle and users", detail: "Initial hackathon data loaded." }
  ],
  escalations: []
};

let state = loadState();

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return normalizeState(structuredClone(seed));
  try {
    return normalizeState(JSON.parse(raw));
  } catch {
    return normalizeState(structuredClone(seed));
  }
}

function normalizeState(nextState) {
  nextState.cycle = { ...seed.cycle, ...(nextState.cycle || {}) };
  nextState.activeQuarter = nextState.activeQuarter || seed.activeQuarter;
  nextState.goalSheets = nextState.goalSheets || [];
  nextState.goalSheets.forEach((sheet) => {
    sheet.lockedAt = sheet.lockedAt || "";
    sheet.returnedReason = sheet.returnedReason || "";
    sheet.goals = sheet.goals || [];
  });
  nextState.checkins = nextState.checkins || [];
  nextState.audit = nextState.audit || [];
  nextState.escalations = nextState.escalations || [];
  return nextState;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function uid(prefix) {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

function currentUser() {
  return state.users.find((user) => user.id === state.currentUserId) || state.users[0];
}

function userName(id) {
  return state.users.find((user) => user.id === id)?.name || "Unknown";
}

function sheetFor(employeeId) {
  let sheet = state.goalSheets.find((item) => item.employeeId === employeeId);
  if (!sheet) {
    sheet = { employeeId, status: "draft", locked: false, lockedAt: "", returnedReason: "", goals: [] };
    state.goalSheets.push(sheet);
  }
  return sheet;
}

function managedEmployees(managerId) {
  return state.users.filter((user) => user.role === "employee" && user.managerId === managerId);
}

function visibleEmployees() {
  const user = currentUser();
  if (user.role === "admin") return state.users.filter((item) => item.role === "employee");
  if (user.role === "manager") return managedEmployees(user.id);
  return [user];
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function logAudit(action, detail) {
  state.audit.unshift({
    id: uid("audit"),
    at: new Date().toLocaleString(),
    actorId: currentUser().id,
    action,
    detail
  });
}

function phaseLabel(value = state.cycle.activePhase) {
  const labels = {
    phase1: "Phase 1 - Goal setting",
    Q1: "Q1 check-in",
    Q2: "Q2 check-in",
    Q3: "Q3 check-in",
    Q4: "Q4 / Annual check-in"
  };
  return labels[value] || labels.phase1;
}

function isGoalSettingOpen() {
  return state.cycle.activePhase === "phase1";
}

function isCheckinOpen() {
  return state.cycle.activePhase === state.activeQuarter;
}

function roleLabel(user) {
  const labels = { employee: "Employee", manager: "Manager (L1)", admin: "Admin / HR" };
  return `${user.name} - ${labels[user.role]}`;
}

function render() {
  renderRoleSwitcher();
  renderTabs();
  renderSummary();
  const view = state.activeView || "goals";
  if (view === "goals") renderGoals();
  if (view === "checkins") renderCheckins();
  if (view === "reports") renderReports();
  if (view === "admin") renderAdmin();
}

function renderRoleSwitcher() {
  const select = document.querySelector("#roleSelect");
  select.innerHTML = state.users
    .map((user) => `<option value="${user.id}" ${user.id === state.currentUserId ? "selected" : ""}>${escapeHtml(roleLabel(user))}</option>`)
    .join("");
}

function renderTabs() {
  document.querySelectorAll(".tab").forEach((tab) => {
    const hiddenForEmployee = currentUser().role === "employee" && tab.dataset.view === "admin";
    tab.hidden = hiddenForEmployee;
    tab.classList.toggle("is-active", tab.dataset.view === state.activeView);
  });
  if (currentUser().role === "employee" && state.activeView === "admin") {
    state.activeView = "goals";
  }
}

function renderSummary() {
  const employees = state.users.filter((user) => user.role === "employee");
  const submitted = state.goalSheets.filter((sheet) => ["submitted", "approved"].includes(sheet.status)).length;
  const approved = state.goalSheets.filter((sheet) => sheet.status === "approved").length;
  const qDone = state.checkins.filter((item) => item.quarter === state.activeQuarter).length;
  const totalWeight = visibleEmployees().reduce((sum, employee) => sum + weightTotal(sheetFor(employee.id)), 0);
  const avgWeight = visibleEmployees().length ? Math.round(totalWeight / visibleEmployees().length) : 0;

  document.querySelector("#summaryGrid").innerHTML = [
    metric("Cycle", state.cycle.name),
    metric("Goal sheets submitted", `${submitted}/${employees.length}`),
    metric("Approved sheets", `${approved}/${employees.length}`),
    metric(`${state.activeQuarter} check-ins`, `${qDone}/${employees.length}`),
    metric("Active window", phaseLabel()),
    metric("Avg visible weightage", `${avgWeight}%`)
  ].join("");
}

function metric(label, value) {
  return `<article class="metric"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></article>`;
}

function renderGoals() {
  const user = currentUser();
  if (user.role === "employee") {
    renderEmployeeGoals(user.id);
    return;
  }
  renderManagerGoals(user.role === "admin" ? "admin" : "manager");
}

function renderEmployeeGoals(employeeId) {
  const sheet = sheetFor(employeeId);
  const canEdit = isGoalSettingOpen() && !sheet.locked && sheet.status !== "submitted";
  const total = weightTotal(sheet);
  const errors = validateSheet(sheet);
  const sharedNotice = sheet.goals.some((goal) => goal.sharedGroupId)
    ? `<div class="notice">Shared goals are read-only for title and target. You may adjust weightage before submission.</div>`
    : "";
  document.querySelector("#appView").innerHTML = `
    <section class="panel">
      <div class="panel-header">
        <div>
          <h2>${escapeHtml(userName(employeeId))}'s goal sheet</h2>
          <p>Status: ${statusBadge(sheet.status, sheet.locked)} Total weightage: <strong>${total}%</strong></p>
        </div>
        <div class="actions">
          <button class="btn primary" data-action="submit-sheet" data-employee="${employeeId}" ${errors.length || !isGoalSettingOpen() || sheet.locked || sheet.status === "submitted" ? "disabled" : ""}>Submit</button>
          <button class="btn" data-action="add-goal" ${!canEdit || sheet.goals.length >= 8 ? "disabled" : ""}>Add goal</button>
        </div>
      </div>
      ${sheet.returnedReason ? `<div class="error">Returned for rework: ${escapeHtml(sheet.returnedReason)}</div>` : ""}
      ${!isGoalSettingOpen() ? `<div class="notice">Goal creation and submission are available only during the Phase 1 goal-setting window.</div>` : ""}
      ${sharedNotice}
      ${errors.length ? `<div class="error">${errors.map(escapeHtml).join("<br>")}</div>` : ""}
      ${canEdit ? goalForm(employeeId) : `<div class="notice">This sheet is locked or awaiting manager approval, so goal edits are disabled.</div>`}
    </section>
    ${goalList(sheet, { mode: "employee", editable: canEdit })}
  `;
}

function goalForm(employeeId) {
  return `
    <form class="grid" data-form="goal" data-employee="${employeeId}">
      <div class="form-grid">
        <div class="field"><label>Thrust area</label><input name="thrustArea" required></div>
        <div class="field wide"><label>Goal title</label><input name="title" required></div>
        <div class="field"><label>UoM</label>${uomSelect("uom")}</div>
        <div class="field full"><label>Description</label><textarea name="description" required></textarea></div>
        <div class="field"><label>Target</label><input name="target" required></div>
        <div class="field"><label>Deadline</label><input type="date" name="deadline"></div>
        <div class="field"><label>Weightage</label><input type="number" name="weightage" min="10" max="100" required></div>
      </div>
      <div class="actions"><button class="btn primary" type="submit">Save goal</button></div>
    </form>
  `;
}

function uomSelect(name, selected = "min") {
  const options = [
    ["min", "Min numeric: higher is better"],
    ["minPercent", "Min percent: higher is better"],
    ["max", "Max numeric: lower is better"],
    ["maxPercent", "Max percent: lower is better"],
    ["timeline", "Timeline: completion date vs deadline"],
    ["zero", "Zero based: zero equals success"]
  ];
  return `<select name="${name}">${options.map(([value, label]) => `<option value="${value}" ${value === selected ? "selected" : ""}>${label}</option>`).join("")}</select>`;
}

function goalList(sheet, options) {
  if (!sheet.goals.length) return emptyState("No goals yet", "Create up to 8 goals. Each goal must carry at least 10% weightage.");
  return `<section class="goal-list">${sheet.goals.map((goal) => goalCard(sheet, goal, options)).join("")}</section>`;
}

function goalCard(sheet, goal, options) {
  const score = progressScore(goal, state.activeQuarter);
  const actual = goal.actuals?.[state.activeQuarter] ?? "";
  const status = goal.statuses?.[state.activeQuarter] || "Not Started";
  const canEditSharedText = !goal.sharedGroupId;
  const employeeEditable = options.mode === "employee" && options.editable;
  const managerApproval = options.mode === "managerApproval";
  const actualEditable = options.mode === "checkin";
  return `
    <article class="goal-card" data-goal="${goal.id}" data-employee="${sheet.employeeId}">
      <div class="goal-head">
        <div>
          <h3>${escapeHtml(goal.title)}</h3>
          <p>${escapeHtml(goal.description)}</p>
        </div>
        <div class="badge-row">
          <span class="badge">${escapeHtml(goal.thrustArea)}</span>
          <span class="badge">${uomLabel(goal.uom)}</span>
          ${goal.sharedGroupId ? `<span class="badge warn">Shared KPI</span>` : ""}
        </div>
      </div>
      <div class="kpi-grid">
        <div class="kpi"><span>Target</span>${escapeHtml(goal.target)}</div>
        <div class="kpi"><span>Weightage</span>${escapeHtml(goal.weightage)}%</div>
        <div class="kpi"><span>${state.activeQuarter} actual</span>${escapeHtml(actual || "Not updated")}</div>
        <div class="kpi"><span>Progress score</span>${score}%</div>
      </div>
      <div class="progress" aria-label="Progress score"><span style="width:${score}%"></span></div>
      <div class="badge-row"><span class="badge ${statusClass(status)}">${escapeHtml(status)}</span></div>
      ${employeeEditable || managerApproval ? editGoalFields(goal, { managerApproval, canEditSharedText }) : ""}
      ${actualEditable ? actualFields(goal) : ""}
      <div class="actions">
        ${employeeEditable ? `<button class="btn" data-action="update-goal">Update</button><button class="btn danger" data-action="delete-goal">Delete</button>` : ""}
        ${managerApproval ? `<button class="btn" data-action="manager-update-goal">Save inline edits</button>` : ""}
        ${actualEditable ? `<button class="btn primary" data-action="save-actual">Save achievement</button>` : ""}
      </div>
    </article>
  `;
}

function editGoalFields(goal, options) {
  return `
    <div class="form-grid">
      <div class="field"><label>Thrust area</label><input name="thrustArea" value="${escapeHtml(goal.thrustArea)}" ${options.canEditSharedText ? "" : "disabled"}></div>
      <div class="field wide"><label>Title</label><input name="title" value="${escapeHtml(goal.title)}" ${options.canEditSharedText ? "" : "disabled"}></div>
      <div class="field"><label>UoM</label>${options.canEditSharedText ? uomSelect("uom", goal.uom) : `<input value="${uomLabel(goal.uom)}" disabled>`}</div>
      <div class="field full"><label>Description</label><textarea name="description" ${options.canEditSharedText ? "" : "disabled"}>${escapeHtml(goal.description)}</textarea></div>
      <div class="field"><label>Target</label><input name="target" value="${escapeHtml(goal.target)}" ${options.canEditSharedText ? "" : "disabled"}></div>
      <div class="field"><label>Deadline</label><input type="date" name="deadline" value="${escapeHtml(goal.deadline || "")}" ${options.canEditSharedText ? "" : "disabled"}></div>
      <div class="field"><label>Weightage</label><input type="number" name="weightage" min="10" max="100" value="${escapeHtml(goal.weightage)}"></div>
    </div>
  `;
}

function actualFields(goal) {
  return `
    <div class="form-grid">
      <div class="field"><label>Quarter</label><input value="${state.activeQuarter}" disabled></div>
      <div class="field"><label>Actual achievement</label><input name="actual" value="${escapeHtml(goal.actuals?.[state.activeQuarter] ?? "")}"></div>
      <div class="field"><label>Status</label>
        <select name="status">
          ${["Not Started", "On Track", "Completed"].map((item) => `<option ${item === (goal.statuses?.[state.activeQuarter] || "Not Started") ? "selected" : ""}>${item}</option>`).join("")}
        </select>
      </div>
    </div>
  `;
}

function renderManagerGoals(kind) {
  const employees = visibleEmployees();
  document.querySelector("#appView").innerHTML = `
    <section class="panel">
      <div class="panel-header">
        <div>
          <h2>${kind === "admin" ? "Organization goal sheets" : "Team approval queue"}</h2>
          <p>Review submitted goals, adjust targets or weightage, approve, return, or push shared KPIs.</p>
        </div>
        <button class="btn primary" data-action="open-shared">Push shared KPI</button>
      </div>
      <div id="sharedFormSlot"></div>
    </section>
    ${employees.map((employee) => approvalPanel(employee)).join("")}
  `;
}

function approvalPanel(employee) {
  const sheet = sheetFor(employee.id);
  const errors = validateSheet(sheet);
  return `
    <section class="panel">
      <div class="panel-header">
        <div>
          <h2>${escapeHtml(employee.name)}</h2>
          <p>${escapeHtml(employee.department)} | ${statusBadge(sheet.status, sheet.locked)} | Total weightage: <strong>${weightTotal(sheet)}%</strong></p>
        </div>
        <div class="actions">
          <button class="btn primary" data-action="approve-sheet" data-employee="${employee.id}" ${!isGoalSettingOpen() || sheet.status !== "submitted" || errors.length ? "disabled" : ""}>Approve</button>
          <button class="btn warn" data-action="return-sheet" data-employee="${employee.id}" ${!isGoalSettingOpen() || sheet.status !== "submitted" ? "disabled" : ""}>Return</button>
          <button class="btn" data-action="unlock-sheet" data-employee="${employee.id}" ${currentUser().role !== "admin" || !sheet.locked ? "disabled" : ""}>Unlock</button>
        </div>
      </div>
      ${!isGoalSettingOpen() ? `<div class="notice">Approval actions are locked outside the Phase 1 goal-setting window.</div>` : ""}
      ${errors.length ? `<div class="error">${errors.map(escapeHtml).join("<br>")}</div>` : ""}
      ${goalList(sheet, { mode: sheet.status === "submitted" ? "managerApproval" : "readonly", editable: false })}
    </section>
  `;
}

function renderCheckins() {
  const user = currentUser();
  if (user.role === "employee") {
    renderEmployeeCheckins(user.id);
    return;
  }
  renderManagerCheckins();
}

function renderEmployeeCheckins(employeeId) {
  const sheet = sheetFor(employeeId);
  const open = isCheckinOpen();
  document.querySelector("#appView").innerHTML = `
    <section class="panel">
      <div class="panel-header">
        <div>
          <h2>Achievement capture</h2>
          <p>Update actual achievement for ${state.activeQuarter}. Progress scores are for tracking, not ratings.</p>
        </div>
        ${quarterPicker()}
      </div>
      ${sheet.status !== "approved" ? `<div class="notice">Achievement updates open after manager approval.</div>` : ""}
      ${!open ? `<div class="notice">${state.activeQuarter} achievement capture is closed. Admin can change the active window in Admin controls.</div>` : ""}
    </section>
    ${goalList(sheet, { mode: sheet.status === "approved" && open ? "checkin" : "readonly", editable: false })}
  `;
}

function renderManagerCheckins() {
  const employees = visibleEmployees();
  document.querySelector("#appView").innerHTML = `
    <section class="panel">
      <div class="panel-header">
        <div>
          <h2>Manager check-ins</h2>
          <p>Review planned vs actual achievement and record the structured discussion comment.</p>
        </div>
        ${quarterPicker()}
      </div>
    </section>
    ${employees.map((employee) => managerCheckinPanel(employee)).join("")}
  `;
}

function managerCheckinPanel(employee) {
  const sheet = sheetFor(employee.id);
  const checkin = state.checkins.find((item) => item.employeeId === employee.id && item.quarter === state.activeQuarter);
  const open = isCheckinOpen();
  return `
    <section class="panel">
      <div class="panel-header">
        <div>
          <h2>${escapeHtml(employee.name)}</h2>
          <p>${escapeHtml(employee.department)} | ${statusBadge(sheet.status, sheet.locked)}</p>
        </div>
        <span class="badge ${checkin ? "ok" : "warn"}">${checkin ? "Check-in complete" : "Pending check-in"}</span>
      </div>
      ${achievementTable([employee])}
      ${!open ? `<div class="notice">${state.activeQuarter} manager check-ins are closed. Admin can change the active window in Admin controls.</div>` : ""}
      <form class="grid" data-form="checkin" data-employee="${employee.id}">
        <div class="field full">
          <label>Check-in comment</label>
          <textarea name="comment" required>${escapeHtml(checkin?.comment || "")}</textarea>
        </div>
        <div class="actions"><button class="btn primary" type="submit" ${!open ? "disabled" : ""}>Save check-in</button></div>
      </form>
    </section>
  `;
}

function quarterPicker() {
  return `
    <div class="field" style="min-width:190px">
      <label>Active period</label>
      <select data-action="quarter-select">
        ${["Q1", "Q2", "Q3", "Q4"].map((q) => `<option value="${q}" ${q === state.activeQuarter ? "selected" : ""}>${q}</option>`).join("")}
      </select>
    </div>
  `;
}

function renderReports() {
  const employees = visibleEmployees();
  document.querySelector("#appView").innerHTML = `
    <section class="panel">
      <div class="panel-header">
        <div>
          <h2>Reports and governance</h2>
          <p>Export planned target vs actual achievement, review completion, and inspect locked-goal audit activity.</p>
        </div>
        <div class="actions">
          ${quarterPicker()}
          <button class="btn primary" data-action="export-csv">Export CSV</button>
        </div>
      </div>
    </section>
    <section class="panel">
      <h2>Achievement report</h2>
      ${achievementTable(employees)}
    </section>
    <section class="panel">
      <h2>Completion dashboard</h2>
      ${completionTable(employees)}
    </section>
    <section class="panel">
      <h2>Audit trail</h2>
      ${auditTable()}
    </section>
  `;
}

function renderAdmin() {
  if (currentUser().role === "employee") {
    state.activeView = "goals";
    render();
    return;
  }
  document.querySelector("#appView").innerHTML = `
    <section class="panel">
      <div class="panel-header">
        <div>
          <h2>Admin and HR controls</h2>
          <p>Configure the cycle, inspect exceptions, and use unlock controls in the goal sheet view.</p>
        </div>
        <button class="btn danger" data-action="reset-demo">Reset demo data</button>
      </div>
      <form class="grid" data-form="cycle">
        <div class="form-grid">
          <div class="field"><label>Cycle name</label><input name="name" value="${escapeHtml(state.cycle.name)}"></div>
          <div class="field"><label>Active window</label>
            <select name="activePhase">
              ${["phase1", "Q1", "Q2", "Q3", "Q4"].map((value) => `<option value="${value}" ${value === state.cycle.activePhase ? "selected" : ""}>${phaseLabel(value)}</option>`).join("")}
            </select>
          </div>
          <div class="field"><label>Goal setting opens</label><input type="date" name="goalOpen" value="${escapeHtml(state.cycle.goalOpen)}"></div>
          <div class="field"><label>Q1 window</label><input name="q1" value="${escapeHtml(state.cycle.q1)}"></div>
          <div class="field"><label>Q2 window</label><input name="q2" value="${escapeHtml(state.cycle.q2)}"></div>
          <div class="field"><label>Q3 window</label><input name="q3" value="${escapeHtml(state.cycle.q3)}"></div>
          <div class="field"><label>Q4 window</label><input name="q4" value="${escapeHtml(state.cycle.q4)}"></div>
        </div>
        <div class="actions"><button class="btn primary" type="submit">Save cycle</button></div>
      </form>
    </section>
    <section class="panel">
      <h2>Escalation monitor</h2>
      ${escalationTable()}
    </section>
    <section class="panel">
      <h2>Users and hierarchy</h2>
      ${hierarchyForm()}
      ${usersTable()}
    </section>
  `;
}

function hierarchyForm() {
  const managers = state.users.filter((user) => user.role === "manager" || user.role === "admin");
  const employees = state.users.filter((user) => user.role === "employee");
  return `
    <form class="grid" data-form="hierarchy">
      <div class="form-grid">
        ${employees.map((employee) => `
          <div class="field">
            <label>${escapeHtml(employee.name)} department</label>
            <input name="department-${employee.id}" value="${escapeHtml(employee.department)}">
          </div>
          <div class="field">
            <label>${escapeHtml(employee.name)} manager</label>
            <select name="manager-${employee.id}">
              ${managers.map((manager) => `<option value="${manager.id}" ${manager.id === employee.managerId ? "selected" : ""}>${escapeHtml(manager.name)}</option>`).join("")}
            </select>
          </div>
        `).join("")}
      </div>
      <div class="actions"><button class="btn primary" type="submit">Save hierarchy</button></div>
    </form>
  `;
}

function achievementTable(employees) {
  const rows = [];
  employees.forEach((employee) => {
    const sheet = sheetFor(employee.id);
    sheet.goals.forEach((goal) => {
      rows.push(`
        <tr>
          <td>${escapeHtml(employee.name)}</td>
          <td>${escapeHtml(goal.title)}</td>
          <td>${escapeHtml(goal.thrustArea)}</td>
          <td>${uomLabel(goal.uom)}</td>
          <td>${escapeHtml(goal.target)}</td>
          <td>${escapeHtml(goal.actuals?.[state.activeQuarter] || "")}</td>
          <td>${escapeHtml(goal.weightage)}%</td>
          <td>${progressScore(goal, state.activeQuarter)}%</td>
          <td>${escapeHtml(goal.statuses?.[state.activeQuarter] || "Not Started")}</td>
        </tr>
      `);
    });
  });
  if (!rows.length) return emptyState("No goals to report", "Submitted and approved goals will appear here.");
  return `
    <div class="table-wrap">
      <table>
        <thead><tr><th>Employee</th><th>Goal</th><th>Thrust area</th><th>UoM</th><th>Planned target</th><th>Actual</th><th>Weight</th><th>Score</th><th>Status</th></tr></thead>
        <tbody>${rows.join("")}</tbody>
      </table>
    </div>
  `;
}

function completionTable(employees) {
  return `
    <div class="table-wrap">
      <table>
        <thead><tr><th>Employee</th><th>Manager</th><th>Goal sheet</th><th>${state.activeQuarter} check-in</th><th>Last comment</th></tr></thead>
        <tbody>
          ${employees.map((employee) => {
            const sheet = sheetFor(employee.id);
            const checkin = state.checkins.find((item) => item.employeeId === employee.id && item.quarter === state.activeQuarter);
            return `<tr><td>${escapeHtml(employee.name)}</td><td>${escapeHtml(userName(employee.managerId))}</td><td>${statusBadge(sheet.status, sheet.locked)}</td><td>${checkin ? "Completed" : "Pending"}</td><td>${escapeHtml(checkin?.comment || "")}</td></tr>`;
          }).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function auditTable() {
  if (!state.audit.length) return emptyState("No audit events", "Locked-goal and admin changes are logged here.");
  return `
    <div class="table-wrap">
      <table>
        <thead><tr><th>When</th><th>Actor</th><th>Action</th><th>Detail</th></tr></thead>
        <tbody>${state.audit.map((item) => `<tr><td>${escapeHtml(item.at)}</td><td>${escapeHtml(userName(item.actorId))}</td><td>${escapeHtml(item.action)}</td><td>${escapeHtml(item.detail)}</td></tr>`).join("")}</tbody>
      </table>
    </div>
  `;
}

function escalationTable() {
  const rows = state.users
    .filter((user) => user.role === "employee")
    .map((employee) => {
      const sheet = sheetFor(employee.id);
      const checkin = state.checkins.find((item) => item.employeeId === employee.id && item.quarter === state.activeQuarter);
      const issue = sheet.status === "draft" ? "Goal sheet not submitted" : !checkin ? `${state.activeQuarter} check-in pending` : "No active escalation";
      return `<tr><td>${escapeHtml(employee.name)}</td><td>${escapeHtml(userName(employee.managerId))}</td><td>${escapeHtml(issue)}</td><td>${issue === "No active escalation" ? "Closed" : "Notify employee, manager, then HR"}</td></tr>`;
    });
  return `<div class="table-wrap"><table><thead><tr><th>Employee</th><th>Manager</th><th>Condition</th><th>Escalation chain</th></tr></thead><tbody>${rows.join("")}</tbody></table></div>`;
}

function usersTable() {
  return `
    <div class="table-wrap">
      <table>
        <thead><tr><th>Name</th><th>Role</th><th>Department</th><th>Manager</th></tr></thead>
        <tbody>${state.users.map((user) => `<tr><td>${escapeHtml(user.name)}</td><td>${escapeHtml(user.role)}</td><td>${escapeHtml(user.department)}</td><td>${escapeHtml(user.managerId ? userName(user.managerId) : "")}</td></tr>`).join("")}</tbody>
      </table>
    </div>
  `;
}

function openSharedForm() {
  const slot = document.querySelector("#sharedFormSlot");
  slot.innerHTML = `
    <form class="grid" data-form="shared">
      <div class="notice">Push a departmental KPI to selected employees. Recipients can adjust weightage only.</div>
      <div class="form-grid">
        <div class="field"><label>Thrust area</label><input name="thrustArea" required></div>
        <div class="field wide"><label>Goal title</label><input name="title" required></div>
        <div class="field"><label>UoM</label>${uomSelect("uom")}</div>
        <div class="field full"><label>Description</label><textarea name="description" required></textarea></div>
        <div class="field"><label>Target</label><input name="target" required></div>
        <div class="field"><label>Deadline</label><input type="date" name="deadline"></div>
        <div class="field"><label>Default weightage</label><input type="number" name="weightage" min="10" value="10" required></div>
        <div class="field wide"><label>Recipients</label>
          <select name="recipients" multiple size="3">
            ${visibleEmployees().map((employee) => `<option value="${employee.id}" selected>${escapeHtml(employee.name)}</option>`).join("")}
          </select>
        </div>
      </div>
      <div class="actions"><button class="btn primary" type="submit">Push shared KPI</button></div>
    </form>
  `;
}

function validateSheet(sheet) {
  const errors = [];
  if (sheet.goals.length > 8) errors.push("Maximum 8 goals are allowed.");
  if (sheet.goals.some((goal) => Number(goal.weightage) < 10)) errors.push("Each goal must have at least 10% weightage.");
  if (sheet.goals.length && weightTotal(sheet) !== 100) errors.push("Total weightage across goals must equal 100%.");
  return errors;
}

function weightTotal(sheet) {
  return sheet.goals.reduce((sum, goal) => sum + Number(goal.weightage || 0), 0);
}

function uomLabel(uom) {
  const labels = {
    min: "Min numeric",
    minPercent: "Min %",
    max: "Max numeric",
    maxPercent: "Max %",
    timeline: "Timeline",
    zero: "Zero based"
  };
  return labels[uom] || uom;
}

function statusBadge(status, locked = false) {
  const klass = status === "approved" ? "ok" : status === "returned" ? "danger" : status === "submitted" ? "warn" : "";
  return `<span class="badge ${klass}">${escapeHtml(status)}${locked ? " | locked" : ""}</span>`;
}

function statusClass(status) {
  if (status === "Completed") return "ok";
  if (status === "On Track") return "warn";
  return "";
}

function progressScore(goal, quarter) {
  const rawActual = goal.actuals?.[quarter];
  if (rawActual === "" || rawActual == null) return 0;
  if (goal.uom === "timeline") {
    const deadline = new Date(goal.deadline || goal.target);
    const actual = new Date(rawActual);
    if (Number.isNaN(deadline.valueOf()) || Number.isNaN(actual.valueOf())) return 0;
    return actual <= deadline ? 100 : Math.max(0, 100 - Math.ceil((actual - deadline) / 86400000) * 5);
  }
  if (goal.uom === "zero") return Number(rawActual) === 0 ? 100 : 0;
  const actual = Number(rawActual);
  const target = Number(goal.target);
  if (!actual || !target) return 0;
  const ratio = goal.uom === "max" || goal.uom === "maxPercent" ? target / actual : actual / target;
  return Math.max(0, Math.min(100, Math.round(ratio * 100)));
}

function emptyState(title, body) {
  return `<div class="empty-state"><h2>${escapeHtml(title)}</h2><p>${escapeHtml(body)}</p></div>`;
}

function readGoalFields(card, goal) {
  const read = (name) => card.querySelector(`[name="${name}"]`)?.value ?? goal[name] ?? "";
  return {
    thrustArea: read("thrustArea"),
    title: read("title"),
    description: read("description"),
    uom: card.querySelector("[name='uom']")?.value || goal.uom,
    target: read("target"),
    deadline: read("deadline"),
    weightage: Number(read("weightage")),
  };
}

function updateSharedLinkedGoals(goal, updated, sourceEmployeeId) {
  if (!goal.sharedGroupId) return;
  state.goalSheets.forEach((sheet) => {
    sheet.goals.forEach((candidate) => {
      if (candidate.sharedGroupId === goal.sharedGroupId && candidate.id !== goal.id) {
        candidate.thrustArea = updated.thrustArea;
        candidate.title = updated.title;
        candidate.description = updated.description;
        candidate.uom = updated.uom;
        candidate.target = updated.target;
        candidate.deadline = updated.deadline;
        if (candidate.primaryOwnerId === sourceEmployeeId) {
          candidate.actuals = structuredClone(goal.actuals);
          candidate.statuses = structuredClone(goal.statuses);
        }
      }
    });
  });
}

function exportCsv() {
  const rows = [["Employee", "Manager", "Goal", "Thrust Area", "UoM", "Planned Target", "Actual", "Weightage", "Score", "Status"]];
  visibleEmployees().forEach((employee) => {
    sheetFor(employee.id).goals.forEach((goal) => {
      rows.push([
        employee.name,
        userName(employee.managerId),
        goal.title,
        goal.thrustArea,
        uomLabel(goal.uom),
        goal.target,
        goal.actuals?.[state.activeQuarter] || "",
        goal.weightage,
        progressScore(goal, state.activeQuarter),
        goal.statuses?.[state.activeQuarter] || "Not Started"
      ]);
    });
  });
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `atomquest-achievement-${state.activeQuarter}.csv`;
  link.click();
  URL.revokeObjectURL(url);
  logAudit("Exported achievement report", `Quarter ${state.activeQuarter}`);
  saveState();
}

document.addEventListener("change", (event) => {
  if (event.target.id === "roleSelect") {
    state.currentUserId = event.target.value;
    state.activeView = "goals";
    saveState();
    render();
  }
  if (event.target.matches("[data-action='quarter-select']")) {
    state.activeQuarter = event.target.value;
    saveState();
    render();
  }
});

document.addEventListener("click", (event) => {
  const tab = event.target.closest(".tab");
  if (tab) {
    state.activeView = tab.dataset.view;
    saveState();
    render();
    return;
  }

  const button = event.target.closest("[data-action]");
  if (!button || button.tagName === "SELECT") return;
  const action = button.dataset.action;
  const employeeId = button.dataset.employee || button.closest("[data-employee]")?.dataset.employee;
  const sheet = employeeId ? sheetFor(employeeId) : null;
  const card = button.closest(".goal-card");
  const goal = card ? sheet.goals.find((item) => item.id === card.dataset.goal) : null;

  if (action === "add-goal") {
    document.querySelector("[data-form='goal'] input")?.focus();
  }
  if (action === "submit-sheet") {
    sheet.status = "submitted";
    sheet.returnedReason = "";
    logAudit("Submitted goal sheet", `${userName(employeeId)} submitted ${sheet.goals.length} goals.`);
    saveState();
    render();
  }
  if (action === "delete-goal" && goal) {
    sheet.goals = sheet.goals.filter((item) => item.id !== goal.id);
    logAudit("Deleted goal", `${userName(employeeId)} deleted ${goal.title}.`);
    saveState();
    render();
  }
  if (action === "update-goal" && goal) {
    const updated = readGoalFields(card, goal);
    Object.assign(goal, updated);
    updateSharedLinkedGoals(goal, updated, employeeId);
    logAudit(sheet.lockedAt ? "Changed goal after lock exception" : "Updated goal", `${userName(employeeId)} updated ${goal.title}.`);
    saveState();
    render();
  }
  if (action === "manager-update-goal" && goal) {
    const updated = readGoalFields(card, goal);
    Object.assign(goal, updated);
    updateSharedLinkedGoals(goal, updated, employeeId);
    logAudit("Manager edited submitted goal", `${currentUser().name} edited ${goal.title} for ${userName(employeeId)}.`);
    saveState();
    render();
  }
  if (action === "approve-sheet") {
    sheet.status = "approved";
    sheet.locked = true;
    sheet.lockedAt = new Date().toLocaleString();
    sheet.returnedReason = "";
    logAudit("Approved and locked goal sheet", `${currentUser().name} approved ${userName(employeeId)}.`);
    saveState();
    render();
  }
  if (action === "return-sheet") {
    const reason = prompt("Reason for rework", "Please rebalance goal weightage and confirm targets.");
    if (reason !== null) {
      sheet.status = "returned";
      sheet.locked = false;
      sheet.returnedReason = reason;
      logAudit("Returned goal sheet", `${currentUser().name} returned ${userName(employeeId)}: ${reason}`);
      saveState();
      render();
    }
  }
  if (action === "unlock-sheet") {
    sheet.locked = false;
    sheet.status = "draft";
    logAudit("Admin exception unlock", `${currentUser().name} unlocked ${userName(employeeId)}. Original lock: ${sheet.lockedAt || "not recorded"}.`);
    saveState();
    render();
  }
  if (action === "save-actual" && goal) {
    goal.actuals = goal.actuals || {};
    goal.statuses = goal.statuses || {};
    goal.actuals[state.activeQuarter] = card.querySelector("[name='actual']").value;
    goal.statuses[state.activeQuarter] = card.querySelector("[name='status']").value;
    if (goal.sharedGroupId && goal.primaryOwnerId === employeeId) {
      state.goalSheets.forEach((linkedSheet) => {
        linkedSheet.goals.forEach((linkedGoal) => {
          if (linkedGoal.sharedGroupId === goal.sharedGroupId) {
            linkedGoal.actuals[state.activeQuarter] = goal.actuals[state.activeQuarter];
            linkedGoal.statuses[state.activeQuarter] = goal.statuses[state.activeQuarter];
          }
        });
      });
    }
    logAudit("Updated achievement", `${userName(employeeId)} updated ${state.activeQuarter} actual for ${goal.title}.`);
    saveState();
    render();
  }
  if (action === "open-shared") openSharedForm();
  if (action === "export-csv") exportCsv();
  if (action === "reset-demo") {
    if (confirm("Reset all demo data?")) {
      state = structuredClone(seed);
      saveState();
      render();
    }
  }
});

document.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.target;
  if (form.dataset.form === "goal") {
    const employeeId = form.dataset.employee;
    const sheet = sheetFor(employeeId);
    const data = Object.fromEntries(new FormData(form).entries());
    sheet.goals.push({
      id: uid("g"),
      thrustArea: data.thrustArea,
      title: data.title,
      description: data.description,
      uom: data.uom,
      target: data.target,
      deadline: data.deadline,
      weightage: Number(data.weightage),
      sharedGroupId: "",
      primaryOwnerId: employeeId,
      actuals: { Q1: "", Q2: "", Q3: "", Q4: "" },
      statuses: { Q1: "Not Started", Q2: "Not Started", Q3: "Not Started", Q4: "Not Started" }
    });
    sheet.status = "draft";
    sheet.returnedReason = "";
    logAudit("Created goal", `${userName(employeeId)} created ${data.title}.`);
    saveState();
    render();
  }
  if (form.dataset.form === "checkin") {
    const employeeId = form.dataset.employee;
    const existing = state.checkins.find((item) => item.employeeId === employeeId && item.quarter === state.activeQuarter);
    const comment = new FormData(form).get("comment");
    if (existing) {
      existing.comment = comment;
      existing.completedAt = new Date().toLocaleDateString();
    } else {
      state.checkins.push({ id: uid("c"), employeeId, managerId: currentUser().id, quarter: state.activeQuarter, comment, completedAt: new Date().toLocaleDateString() });
    }
    logAudit("Saved manager check-in", `${currentUser().name} saved ${state.activeQuarter} check-in for ${userName(employeeId)}.`);
    saveState();
    render();
  }
  if (form.dataset.form === "cycle") {
    state.cycle = Object.fromEntries(new FormData(form).entries());
    if (["Q1", "Q2", "Q3", "Q4"].includes(state.cycle.activePhase)) {
      state.activeQuarter = state.cycle.activePhase;
    }
    logAudit("Updated cycle settings", `${currentUser().name} updated ${state.cycle.name}.`);
    saveState();
    render();
  }
  if (form.dataset.form === "hierarchy") {
    const data = Object.fromEntries(new FormData(form).entries());
    state.users
      .filter((user) => user.role === "employee")
      .forEach((employee) => {
        employee.department = data[`department-${employee.id}`] || employee.department;
        employee.managerId = data[`manager-${employee.id}`] || employee.managerId;
      });
    logAudit("Updated org hierarchy", `${currentUser().name} updated employee departments and reporting lines.`);
    saveState();
    render();
  }
  if (form.dataset.form === "shared") {
    const data = Object.fromEntries(new FormData(form).entries());
    const recipients = Array.from(form.querySelector("[name='recipients']").selectedOptions).map((option) => option.value);
    const groupId = uid("shared");
    recipients.forEach((employeeId, index) => {
      const sheet = sheetFor(employeeId);
      sheet.goals.push({
        id: uid("g"),
        thrustArea: data.thrustArea,
        title: data.title,
        description: data.description,
        uom: data.uom,
        target: data.target,
        deadline: data.deadline,
        weightage: Number(data.weightage),
        sharedGroupId: groupId,
        primaryOwnerId: recipients[0],
        actuals: { Q1: "", Q2: "", Q3: "", Q4: "" },
        statuses: { Q1: "Not Started", Q2: "Not Started", Q3: "Not Started", Q4: "Not Started" }
      });
      if (index === 0) sheet.goals[sheet.goals.length - 1].primaryOwnerId = employeeId;
    });
    logAudit("Pushed shared KPI", `${currentUser().name} pushed ${data.title} to ${recipients.length} employees.`);
    saveState();
    render();
  }
});

render();
