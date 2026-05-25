// ---- Checklist content (lifted verbatim from Product Quality Checklist (PQL).docx) ----
const SECTIONS = [
  {
    title: "User value & intent",
    objective: "Confirm the release delivers the intended value to the right user.",
    items: [
      "The user problem this release addresses is clearly stated",
      "The shipped functionality matches the original intent and all stated acceptance criteria pass",
      "The primary user can complete the core job end-to-end",
      "There is no obvious user-visible regression for existing workflows (e.g., user shouldn't have to click Back on the happy path)",
      "Non-goals are respected (nothing shipped accidentally)",
    ],
    shipBlocker: "Core user flow is incomplete or confusing.",
  },
  {
    title: "Product scope & completeness",
    objective: "Ensure the feature feels “whole,” not half-shipped.",
    items: [
      "Happy path works without workarounds",
      "Key edge cases are handled or intentionally deferred",
      "Empty states, loading states, and errors are reasonable",
      "No “TODO” or placeholder logic is user-visible",
    ],
    shipBlocker: "Users can easily get stuck or misled.",
  },
  {
    title: "UX clarity & consistency",
    objective: "Protect usability and product coherence.",
    items: [
      "Product copy adheres to Commenda Product Copy Manual",
      "Labels, copy, and actions are clear and unambiguous",
      "Defaults are sensible and safe",
      "New UI aligns with existing patterns (layout, interactions)",
      "No surprising destructive actions without confirmation",
    ],
    shipBlocker: "A reasonable user could misinterpret what the feature does.",
  },
  {
    title: "Data correctness & trust",
    objective: "Ensure the product does not lie.",
    items: [
      "Displayed data matches source-of-truth logic",
      "Calculations, totals, and statuses are accurate",
      "Rounding, currency, time zones, and formatting are correct",
      "No known data inconsistencies are unaccounted for",
      "Failure modes do not silently corrupt or misrepresent data",
      "All information that needs to be recalled later is stored in CommendaOS and displayed in the appropriate place in Entities or Documents",
    ],
    shipBlocker: "Users could make decisions based on incorrect data.",
  },
  {
    title: "Failure modes & recovery",
    objective: "Confirm the system fails safely.",
    items: [
      "Error states are understandable to a non-technical user",
      "Partial failures are visible (not silent)",
      "Users can recover or retry without support intervention",
      "Background jobs or async actions have clear outcomes",
      "No infinite loading or dead-end states",
    ],
    shipBlocker: "Failures leave users confused or blocked.",
  },
  {
    title: "Permissions, roles & safety",
    objective: "Prevent accidental or unauthorized actions.",
    items: [
      "Access is limited to the correct roles/users",
      "Sensitive actions are protected (confirmations, warnings)",
      "No leakage of data across tenants, accounts, or entities",
    ],
    shipBlocker: "Security or access control is ambiguous.",
  },
  {
    title: "Operational readiness",
    objective: "Ensure the team can support what's shipping.",
    items: [
      "Support team knows what changed and why",
      "Arcades are updated or created",
      "Known limitations or caveats are documented internally in Mintlify",
      "Logging, alerts, or dashboards exist where needed",
    ],
    shipBlocker: "On-call or support would be blind.",
  },
  {
    title: "Performance & reliability (PM sanity check)",
    objective: "Catch obvious risk, not deep engineering issues.",
    items: [
      "No obvious latency or timeout issues in normal usage",
      "Feature does not significantly increase load in hot paths",
      "Large datasets or high-volume users behave acceptably",
    ],
    shipBlocker: "Performance issues are obvious in basic use.",
  },
  {
    title: "Release communication",
    objective: "Align expectations.",
    items: [
      "Internal release note is written and accurate",
      "External release note (if any) reflects actual behavior",
      "No over-promising or misleading language",
      "Success metric or follow-up is identified AND added to Mixpanel",
    ],
    shipBlocker: "The team or customers will be surprised.",
  },
  {
    title: "Go / no-go decision",
    objective: "Force accountability.",
    items: [
      "Known issues are explicitly accepted or deferred",
      "PM is comfortable defending this release to a customer",
    ],
    shipBlocker: null,
  },
];

const STATES = [
  { key: "ok", label: "✓ OK" },
  { key: "deferred", label: "⚠ Deferred" },
  { key: "notok", label: "✗ Not OK" },
];
const STATE_LABEL = { ok: "OK", deferred: "Deferred", notok: "Not OK", pending: "Pending" };

// ---- App state ----
const state = {
  name: "",
  project: "",
  decision: "",
  date: "",
  knownIssues: "",
  // sectionStates[i] = { items: ["ok"|"deferred"|"notok"|null, ...], notes: "" }
  sectionStates: SECTIONS.map((s) => ({
    items: s.items.map(() => null),
    notes: "",
  })),
};

// ---- Screen routing ----
const screens = {
  intro: document.getElementById("screen-intro"),
  checklist: document.getElementById("screen-checklist"),
  summary: document.getElementById("screen-summary"),
};

function show(name) {
  Object.values(screens).forEach((s) => s.classList.remove("is-active"));
  screens[name].classList.add("is-active");
  window.scrollTo({ top: 0, behavior: "instant" });
}

// ---- Intro form ----
document.getElementById("intro-form").addEventListener("submit", (e) => {
  e.preventDefault();
  state.name = document.getElementById("input-name").value.trim();
  state.project = document.getElementById("input-project").value.trim();
  if (!state.name || !state.project) return;

  document.getElementById("meta-name").textContent = state.name;
  document.getElementById("meta-project").textContent = state.project;
  document.getElementById("input-date").value = new Date().toISOString().slice(0, 10);

  renderChecklist();
  show("checklist");
});

document.getElementById("btn-back-to-intro").addEventListener("click", () => {
  document.getElementById("input-name").value = state.name;
  document.getElementById("input-project").value = state.project;
  show("intro");
});

// ---- Checklist render ----
function renderChecklist() {
  const root = document.getElementById("sections-root");
  root.innerHTML = "";

  SECTIONS.forEach((section, sIdx) => {
    const card = document.createElement("div");
    card.className = "card section-card";

    const head = document.createElement("div");
    head.className = "section-head";
    head.innerHTML = `
      <h2><span class="section-number">${sIdx + 1}.</span> ${escapeHtml(section.title)}</h2>
      <p class="section-objective">${escapeHtml(section.objective)}</p>
    `;
    card.appendChild(head);

    const list = document.createElement("ul");
    list.className = "section-items";

    section.items.forEach((item, iIdx) => {
      const li = document.createElement("li");
      li.className = "item";

      const label = document.createElement("div");
      label.className = "item-label";
      label.textContent = item;

      const group = document.createElement("div");
      group.className = "state-group";
      group.setAttribute("role", "group");
      group.setAttribute("aria-label", "Status");

      STATES.forEach((st) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "state-btn";
        btn.dataset.state = st.key;
        btn.textContent = st.label;
        btn.addEventListener("click", () => {
          const current = state.sectionStates[sIdx].items[iIdx];
          const next = current === st.key ? null : st.key;
          state.sectionStates[sIdx].items[iIdx] = next;
          group.querySelectorAll(".state-btn").forEach((b) => b.classList.remove("is-active"));
          if (next) btn.classList.add("is-active");
          updateProgress();
        });
        group.appendChild(btn);
      });

      li.appendChild(label);
      li.appendChild(group);
      list.appendChild(li);
    });

    card.appendChild(list);

    if (section.shipBlocker) {
      const blocker = document.createElement("div");
      blocker.className = "section-blocker";
      blocker.innerHTML = `<strong>Ship blocker if:</strong> ${escapeHtml(section.shipBlocker)}`;
      card.appendChild(blocker);
    }

    const notesWrap = document.createElement("div");
    notesWrap.className = "section-notes";
    notesWrap.innerHTML = `<label><span class="section-notes-label">Notes (optional)</span><textarea rows="2" placeholder="Anything to flag for this section?"></textarea></label>`;
    const notesArea = notesWrap.querySelector("textarea");
    notesArea.addEventListener("input", () => {
      state.sectionStates[sIdx].notes = notesArea.value;
    });
    card.appendChild(notesWrap);

    root.appendChild(card);
  });

  updateProgress();
}

function updateProgress() {
  const total = SECTIONS.reduce((sum, s) => sum + s.items.length, 0);
  const done = state.sectionStates.reduce(
    (sum, s) => sum + s.items.filter((x) => x !== null).length,
    0
  );
  document.getElementById("progress-done").textContent = done;
  document.getElementById("progress-total").textContent = total;
  document.getElementById("progress-fill").style.width = `${(done / total) * 100}%`;
}

// ---- Submit → Summary ----
document.getElementById("checklist-form").addEventListener("submit", (e) => {
  e.preventDefault();
  state.knownIssues = document.getElementById("input-known-issues").value.trim();
  state.decision = document.getElementById("input-decision").value;
  state.date = document.getElementById("input-date").value;
  if (!state.decision || !state.date) return;
  renderSummary();
  show("summary");
});

function renderSummary() {
  const root = document.getElementById("summary-root");
  const counts = countStates();

  root.innerHTML = `
    <h2>Product Quality Checklist — ${escapeHtml(state.project)}</h2>
    <dl class="summary-meta">
      <dt>PM</dt><dd>${escapeHtml(state.name)}</dd>
      <dt>Project</dt><dd>${escapeHtml(state.project)}</dd>
      <dt>Date</dt><dd>${escapeHtml(state.date)}</dd>
      <dt>Decision</dt><dd><span class="summary-decision ${state.decision}">${escapeHtml(state.decision)}</span></dd>
      <dt>Items</dt><dd>${counts.ok} OK · ${counts.deferred} deferred · ${counts.notok} not OK · ${counts.pending} pending</dd>
    </dl>
    ${state.knownIssues ? `<div class="summary-notes"><strong>Known issues accepted:</strong> ${escapeHtml(state.knownIssues)}</div>` : ""}
    ${SECTIONS.map((section, sIdx) => {
      const sState = state.sectionStates[sIdx];
      const itemsHtml = section.items
        .map((item, iIdx) => {
          const st = sState.items[iIdx] || "pending";
          return `<li><span class="state-pill ${st}">${STATE_LABEL[st]}</span><span>${escapeHtml(item)}</span></li>`;
        })
        .join("");
      return `
        <h3>${sIdx + 1}. ${escapeHtml(section.title)}</h3>
        <ul>${itemsHtml}</ul>
        ${sState.notes ? `<div class="summary-notes">${escapeHtml(sState.notes)}</div>` : ""}
      `;
    }).join("")}
  `;
}

function countStates() {
  const c = { ok: 0, deferred: 0, notok: 0, pending: 0 };
  state.sectionStates.forEach((s) => {
    s.items.forEach((x) => {
      c[x || "pending"]++;
    });
  });
  return c;
}

// ---- Markdown export ----
function buildMarkdown() {
  const lines = [];
  lines.push(`# Product Quality Checklist — ${state.project}`);
  lines.push("");
  lines.push(`- **PM:** ${state.name}`);
  lines.push(`- **Project:** ${state.project}`);
  lines.push(`- **Date:** ${state.date}`);
  lines.push(`- **Decision:** ${state.decision}`);
  const c = countStates();
  lines.push(`- **Items:** ${c.ok} OK · ${c.deferred} deferred · ${c.notok} not OK · ${c.pending} pending`);
  if (state.knownIssues) {
    lines.push("");
    lines.push(`**Known issues accepted:** ${state.knownIssues}`);
  }
  lines.push("");
  SECTIONS.forEach((section, sIdx) => {
    const sState = state.sectionStates[sIdx];
    lines.push(`## ${sIdx + 1}. ${section.title}`);
    lines.push(`_${section.objective}_`);
    lines.push("");
    section.items.forEach((item, iIdx) => {
      const st = sState.items[iIdx];
      const mark = st === "ok" ? "[x]" : st === "notok" ? "[!]" : st === "deferred" ? "[~]" : "[ ]";
      const suffix = st === "deferred" ? " _(deferred)_" : st === "notok" ? " _(NOT OK)_" : "";
      lines.push(`- ${mark} ${item}${suffix}`);
    });
    if (section.shipBlocker) {
      lines.push("");
      lines.push(`> **Ship blocker if:** ${section.shipBlocker}`);
    }
    if (sState.notes) {
      lines.push("");
      lines.push(`**Notes:** ${sState.notes}`);
    }
    lines.push("");
  });
  return lines.join("\n");
}

// ---- Toolbar actions ----
document.getElementById("btn-copy").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(buildMarkdown());
    toast("Copied to clipboard");
  } catch {
    toast("Couldn't copy — try Download instead");
  }
});

document.getElementById("btn-download").addEventListener("click", () => {
  const md = buildMarkdown();
  const safeProject = state.project.replace(/[^a-z0-9\-_]+/gi, "-").replace(/^-+|-+$/g, "");
  const filename = `PQL-${safeProject}-${state.date}.md`;
  const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

document.getElementById("btn-print").addEventListener("click", () => {
  window.print();
});

document.getElementById("btn-new").addEventListener("click", () => {
  // Reset state
  state.name = "";
  state.project = "";
  state.decision = "";
  state.date = "";
  state.knownIssues = "";
  state.sectionStates = SECTIONS.map((s) => ({
    items: s.items.map(() => null),
    notes: "",
  }));
  document.getElementById("intro-form").reset();
  document.getElementById("checklist-form").reset();
  show("intro");
});

// ---- Helpers ----
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

let toastTimer;
function toast(msg) {
  let el = document.querySelector(".toast");
  if (!el) {
    el = document.createElement("div");
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("is-visible"), 1800);
}
