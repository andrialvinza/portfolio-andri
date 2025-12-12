// =======================
// Job Application Tracker
// v1: Theme + CRUD (Add/Edit/Delete) + Stats + Clear All + Search + Filter (localStorage)
// =======================

// ---------- DOM ----------
const themeToggleBtn = document.getElementById("themeToggle");
const yearEl = document.getElementById("year");

const form = document.getElementById("appForm");
const companyEl = document.getElementById("company");
const positionEl = document.getElementById("position");
const appliedDateEl = document.getElementById("appliedDate");
const statusEl = document.getElementById("status");
const notesEl = document.getElementById("notes");

const submitBtn = document.getElementById("submitBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");

const appsListEl = document.getElementById("appsList");
const emptyStateEl = document.getElementById("emptyState");
const listCountEl = document.getElementById("listCount");

const statAppliedEl = document.getElementById("statApplied");
const statInterviewEl = document.getElementById("statInterview");
const statAcceptedEl = document.getElementById("statAccepted");
const statRejectedEl = document.getElementById("statRejected");

const clearAllBtn = document.getElementById("clearAllBtn");

const toastEl = document.getElementById("toast");
const exportBtn = document.getElementById("exportBtn");
const importFile = document.getElementById("importFile");

// toolbar
const searchEl = document.getElementById("search");
const filterStatusEl = document.getElementById("filterStatus");

// ---------- STORAGE ----------
const STORAGE_KEY = "jobTrackerApps";
const THEME_KEY = "jobTrackerTheme";
const DEFAULT_THEME = "light";

// ---------- STATE ----------
let highlightId = null;
let apps = loadApps();
let editingId = null; // kalau null = mode Add, kalau ada id = mode Edit

// ---------- HELPERS ----------
function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function escapeHtml(str = "") {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(yyyy_mm_dd) {
  if (!yyyy_mm_dd) return "-";
  const d = new Date(yyyy_mm_dd);
  if (Number.isNaN(d.getTime())) return yyyy_mm_dd;
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function badgeClass(status) {
  const s = (status || "").toLowerCase();
  if (s === "applied") return "badge-applied";
  if (s === "interview") return "badge-interview";
  if (s === "accepted") return "badge-accepted";
  if (s === "rejected") return "badge-rejected";
  return "badge-applied";
}

let toastTimer = null;

function showToast(message, type = "info") {
  if (!toastEl) return;

  toastEl.className = `toast ${type}`;
  toastEl.textContent = message;
  toastEl.hidden = false;

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.hidden = true;
  }, 2200);
}

// ---------- STORAGE IO ----------
function loadApps() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveApps() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
}

// ---------- UI ----------
function updateStats() {
  const counts = { Applied: 0, Interview: 0, Accepted: 0, Rejected: 0 };

  for (const a of apps) {
    if (counts[a.status] !== undefined) counts[a.status] += 1;
  }

  statAppliedEl.textContent = counts.Applied;
  statInterviewEl.textContent = counts.Interview;
  statAcceptedEl.textContent = counts.Accepted;
  statRejectedEl.textContent = counts.Rejected;
}

function setFormMode(mode) {
  // mode: "add" | "edit"
  if (mode === "edit") {
    submitBtn.textContent = "Update";
    cancelEditBtn.hidden = false;
  } else {
    submitBtn.textContent = "Add";
    cancelEditBtn.hidden = true;
  }
}

function fillForm(app) {
  companyEl.value = app.company || "";
  positionEl.value = app.position || "";
  appliedDateEl.value = app.appliedDate || "";
  statusEl.value = app.status || "Applied";
  notesEl.value = app.notes || "";
}

function clearFormKeepDate() {
  companyEl.value = "";
  positionEl.value = "";
  notesEl.value = "";
  statusEl.value = "Applied";
  companyEl.focus();
}

function render() {
  const q = (searchEl?.value || "").trim().toLowerCase();
  const filter = filterStatusEl?.value || "All";

  // filter
  const filtered = apps.filter((a) => {
    const matchesText =
      !q ||
      a.company.toLowerCase().includes(q) ||
      a.position.toLowerCase().includes(q);

    const matchesStatus = filter === "All" ? true : a.status === filter;

    return matchesText && matchesStatus;
  });

  // sort newest first
  const sorted = [...filtered].sort(
    (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
  );

  appsListEl.innerHTML = sorted
    .map((a) => {
      const company = escapeHtml(a.company);
      const position = escapeHtml(a.position);
      const notes = escapeHtml(a.notes || "");
      const status = escapeHtml(a.status);
      const date = escapeHtml(formatDate(a.appliedDate));

      const isEditing = editingId === a.id;
      const highlightClass = highlightId === a.id ? "highlight" : "";

      return `
          <article class="app-card ${highlightClass}" data-id="${a.id}">
          <div class="app-main">
            <div>
              <h3 class="app-company">${company}</h3>
              <p class="app-position">${position}</p>
              <p class="app-meta muted">Applied: ${date}</p>
            </div>

            <span class="badge ${badgeClass(a.status)}">${status}</span>
          </div>

          ${notes ? `<p class="app-notes muted">Notes: ${notes}</p>` : ""}

          <div class="app-actions">
            <button type="button" class="btn btn-ghost" data-action="edit">
              ${isEditing ? "Editing..." : "Edit"}
            </button>
            <button type="button" class="btn btn-danger" data-action="delete">
              Delete
            </button>
          </div>
        </article>
      `;
    })
    .join("");

  // empty state based on filtered results
  const hasItems = sorted.length > 0;
  emptyStateEl.hidden = hasItems;

  // count based on filtered results
  listCountEl.textContent = `${sorted.length} item${
    sorted.length === 1 ? "" : "s"
  }`;

  // stats always from all apps
  updateStats();
}

// ---------- CRUD ----------
function addApplication(payload) {
  apps.unshift(payload);
  saveApps();
  render();
  showToast("Added ✅", "success");
}

function updateApplication(id, patch) {
  const idx = apps.findIndex((a) => a.id === id);
  if (idx === -1) return;

  apps[idx] = {
    ...apps[idx],
    ...patch,
    updatedAt: Date.now(),
  };

  saveApps();
  highlightId = id;
  render();
  if (highlightId) {
    setTimeout(() => {
      highlightId = null;
      render();
    }, 900);
  }
  showToast("Updated ✨", "success");
}

function deleteApplication(id) {
  apps = apps.filter((a) => a.id !== id);
  saveApps();
  render();
  showToast("Deleted 🗑️", "danger");
}

function clearAll() {
  apps = [];
  saveApps();
  render();
  showToast("All cleared 🧹", "danger");
}

// ---------- THEME ----------
function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);

  const iconSpan = themeToggleBtn.querySelector("span[aria-hidden='true']");
  if (iconSpan) iconSpan.textContent = theme === "dark" ? "☀️" : "🌙";

  localStorage.setItem(THEME_KEY, theme);
}

function getSavedTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "light" || saved === "dark") return saved;
  return null;
}

// ---------- EDIT FLOW ----------
function startEdit(id) {
  const app = apps.find((a) => a.id === id);
  if (!app) return;

  editingId = id;
  setFormMode("edit");
  fillForm(app);

  // scroll ke atas biar user tau lagi edit
  window.scrollTo({ top: 0, behavior: "smooth" });

  render();
}

function cancelEdit() {
  editingId = null;
  setFormMode("add");
  clearFormKeepDate();
  render();
}

// ---------- INIT ----------
(function init() {
  // theme
  const saved = getSavedTheme();
  setTheme(saved || DEFAULT_THEME);

  // footer year
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // default date today
  if (appliedDateEl && !appliedDateEl.value) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    appliedDateEl.value = `${yyyy}-${mm}-${dd}`;
  }

  setFormMode("add");
  render();
})();

// ---------- EVENTS ----------
themeToggleBtn.addEventListener("click", () => {
  const current =
    document.documentElement.getAttribute("data-theme") || DEFAULT_THEME;
  setTheme(current === "dark" ? "light" : "dark");
});

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const company = companyEl.value.trim();
  const position = positionEl.value.trim();
  const appliedDate = appliedDateEl.value;
  const status = statusEl.value;
  const notes = notesEl.value.trim();

  if (!company || !position || !appliedDate || !status) return;

  if (editingId) {
    // UPDATE
    updateApplication(editingId, {
      company,
      position,
      appliedDate,
      status,
      notes,
    });
    cancelEdit();
    return;
  }

  // ADD
  const newApp = {
    id: uid(),
    company,
    position,
    appliedDate,
    status,
    notes,
    createdAt: Date.now(),
  };

  addApplication(newApp);

  // reset fields (date tetap)
  clearFormKeepDate();
});

appsListEl.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;

  const action = btn.dataset.action;
  const card = btn.closest(".app-card");
  const id = card?.dataset?.id;
  if (!id) return;

  if (action === "delete") {
    const ok = confirm("Yakin mau hapus data ini?");
    if (!ok) return;

    // kalau lagi edit item ini, cancel dulu
    if (editingId === id) cancelEdit();

    deleteApplication(id);
  }

  if (action === "edit") {
    startEdit(id);
  }
});

clearAllBtn.addEventListener("click", () => {
  if (apps.length === 0) return;

  const ok = confirm("Hapus SEMUA data aplikasi? Ini tidak bisa dibatalkan.");
  if (!ok) return;

  cancelEdit();
  clearAll();
});

function download(filename, text) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type: "application/json" }));
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

exportBtn?.addEventListener("click", () => {
  const data = {
    exportedAt: new Date().toISOString(),
    apps,
  };
  download("job-tracker-export.json", JSON.stringify(data, null, 2));
  showToast("Exported JSON 📦", "info");
});

importFile?.addEventListener("change", async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    const text = await file.text();
    const parsed = JSON.parse(text);

    const importedApps = Array.isArray(parsed) ? parsed : parsed.apps;
    if (!Array.isArray(importedApps)) throw new Error("Invalid format");

    // basic sanitize
    const cleaned = importedApps
      .filter((x) => x && typeof x === "object")
      .map((x) => ({
        id: x.id || uid(),
        company: String(x.company || "").trim(),
        position: String(x.position || "").trim(),
        appliedDate: String(x.appliedDate || ""),
        status: ["Applied", "Interview", "Accepted", "Rejected"].includes(
          x.status
        )
          ? x.status
          : "Applied",
        notes: String(x.notes || ""),
        createdAt: Number(x.createdAt || Date.now()),
      }))
      .filter((x) => x.company && x.position && x.appliedDate);

    apps = cleaned;
    saveApps();
    render();
    showToast("Imported ✅", "success");
  } catch {
    showToast("Import gagal. Pastikan file JSON valid.", "danger");
  } finally {
    // reset input biar bisa import file yang sama lagi
    importFile.value = "";
  }
});

document.addEventListener("keydown", (e) => {
  if (
    e.key === "/" &&
    document.activeElement?.tagName !== "INPUT" &&
    document.activeElement?.tagName !== "TEXTAREA"
  ) {
    e.preventDefault();
    searchEl.focus();
  }
});

// search + filter
searchEl.addEventListener("input", render);
filterStatusEl.addEventListener("change", render);

// cancel edit
cancelEditBtn.addEventListener("click", cancelEdit);
