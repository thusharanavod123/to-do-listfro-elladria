const calendar = document.querySelector("#calendar");
const dialog = document.querySelector("#issueDialog");
const form = document.querySelector("#issueForm");
const issueText = document.querySelector("#issueText");
const employeeName = document.querySelector("#employeeName");
const characterCount = document.querySelector("#characterCount");
const weekLabel = document.querySelector("#weekLabel");
const weekRange = document.querySelector("#weekRange");
const openCount = document.querySelector("#openCount");
const fixedCount = document.querySelector("#fixedCount");
const toast = document.querySelector("#toast");

const STORAGE_KEY = "elladria-support-board-v1";
const timeSlots = [
  [9, 0, "9:00 AM"], [10, 0, "10:00 AM"], [11, 0, "11:00 AM"],
  [12, 0, "12:00 PM"], [13, 0, "1:00 PM"], [14, 0, "2:00 PM"],
  [15, 0, "3:00 PM"], [16, 0, "4:00 PM"], [17, 0, "5:00 PM"]
];

let weekOffset = 0;
let activeSlot = null;
let issues = loadIssues();

function loadIssues() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
  catch { return {}; }
}

function saveIssues() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(issues));
}

function getMonday(offset = 0) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  const day = date.getDay() || 7;
  date.setDate(date.getDate() - day + 1 + offset * 7);
  return date;
}

function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function make(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 1800);
}

function render() {
  calendar.replaceChildren();
  const monday = getMonday(weekOffset);
  const dates = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return date;
  });

  const corner = make("div", "corner", "TIME");
  calendar.append(corner);

  dates.forEach((date) => {
    const header = make("div", `day-header${sameDay(date, new Date()) ? " today" : ""}`);
    header.append(
      make("span", "day-name", date.toLocaleDateString("en-US", { weekday: "short" })),
      make("span", "day-number", date.getDate())
    );
    calendar.append(header);
  });

  timeSlots.forEach(([hour, minute, label], rowIndex) => {
    const endLabel = rowIndex === timeSlots.length - 1 ? "5:30 PM" : "";
    calendar.append(make("div", `time-label${endLabel ? " half-hour" : ""}`, endLabel ? `${label}–5:30` : label));

    dates.forEach((date) => {
      const key = `${dateKey(date)}-${hour}-${minute}`;
      const slot = make("div", `slot${endLabel ? " half-hour" : ""}`);
      slot.tabIndex = 0;
      slot.setAttribute("role", "button");
      slot.setAttribute("aria-label", `Add an issue on ${date.toDateString()} at ${label}`);
      slot.addEventListener("click", () => openDialog(key, date, label));
      slot.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openDialog(key, date, label);
        }
      });

      if (issues[key]) slot.append(createIssueCard(key, issues[key]));
      calendar.append(slot);
    });
  });

  const sunday = dates[6];
  weekLabel.textContent = weekOffset === 0 ? "This week" : weekOffset === 1 ? "Next week" : weekOffset === -1 ? "Last week" : "Selected week";
  weekRange.textContent = `${monday.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${sunday.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
  updateSummary(dates);
}

function createIssueCard(key, issue) {
  const card = make("article", `issue-card${issue.fixed ? " fixed" : ""}`);
  card.addEventListener("click", (event) => event.stopPropagation());
  const text = make("p", "issue-text", issue.text);
  const meta = make("div", "issue-meta");
  meta.append(make("span", "", issue.name || "Anonymous"), make("span", "", issue.fixed ? "Fixed" : "Open"));

  const actions = make("div", "card-actions");
  const toggle = make("button", "toggle-button", issue.fixed ? "Reopen" : "Mark fixed");
  toggle.type = "button";
  toggle.addEventListener("click", () => {
    issues[key].fixed = !issues[key].fixed;
    saveIssues();
    render();
    showToast(issues[key].fixed ? "Issue marked as fixed" : "Issue reopened");
  });
  const remove = make("button", "delete-button", "Delete");
  remove.type = "button";
  remove.addEventListener("click", () => {
    if (!window.confirm("Delete this support request?")) return;
    delete issues[key];
    saveIssues();
    render();
    showToast("Request deleted");
  });
  actions.append(toggle, remove);
  card.append(text, meta, actions);
  return card;
}

function openDialog(key, date, time) {
  if (issues[key]) return;
  activeSlot = key;
  form.reset();
  characterCount.textContent = "0 / 240";
  document.querySelector("#dialogSlot").textContent = `${date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} · ${time}`;
  dialog.showModal();
  setTimeout(() => employeeName.focus(), 50);
}

function updateSummary(dates) {
  const weekKeys = new Set(dates.map(dateKey));
  const weekIssues = Object.entries(issues).filter(([key]) => weekKeys.has(key.slice(0, 10))).map(([, issue]) => issue);
  openCount.textContent = weekIssues.filter((issue) => !issue.fixed).length;
  fixedCount.textContent = weekIssues.filter((issue) => issue.fixed).length;
}

form.addEventListener("submit", (event) => {
  if (event.submitter?.value === "cancel") return;
  event.preventDefault();
  const text = issueText.value.trim();
  if (!text || !activeSlot) return;
  issues[activeSlot] = { text, name: employeeName.value.trim(), fixed: false, createdAt: Date.now() };
  saveIssues();
  dialog.close();
  render();
  showToast("Support request added");
});

issueText.addEventListener("input", () => { characterCount.textContent = `${issueText.value.length} / 240`; });
document.querySelector("#previousWeek").addEventListener("click", () => { weekOffset -= 1; render(); });
document.querySelector("#nextWeek").addEventListener("click", () => { weekOffset += 1; render(); });
document.querySelector("#currentWeek").addEventListener("click", () => { weekOffset = 0; render(); });
dialog.addEventListener("click", (event) => {
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
});

render();
