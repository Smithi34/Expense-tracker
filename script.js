/* =========================================================
   HOSTEL LEDGER — script.js
   A beginner-friendly, vanilla-JS expense tracker.

   Sections in this file:
   1. State & localStorage keys
   2. Storage helpers (load/save)
   3. DOM element references
   4. Rendering functions (turn state into HTML)
   5. Calculation helpers
   6. Event handlers (form submit, delete, filter, search)
   7. Init
   ========================================================= */

/* ---------------------------------------------------------
   1. STATE & LOCALSTORAGE KEYS
   State lives in two plain variables. Every time they change,
   we save them to localStorage and re-render the page.
--------------------------------------------------------- */

const STORAGE_KEYS = {
  budget: "hostelLedger_budget",
  expenses: "hostelLedger_expenses",
};

let monthlyBudget = 0;   // a single number
let expenses = [];       // array of expense objects: { id, name, amount, category, date, description }

/* ---------------------------------------------------------
   2. STORAGE HELPERS
   localStorage only stores strings, so we convert
   objects/arrays to JSON text when saving, and parse
   JSON text back into objects/arrays when loading.
--------------------------------------------------------- */

function loadState() {
  const savedBudget = localStorage.getItem(STORAGE_KEYS.budget);
  const savedExpenses = localStorage.getItem(STORAGE_KEYS.expenses);

  monthlyBudget = savedBudget ? Number(savedBudget) : 0;
  expenses = savedExpenses ? JSON.parse(savedExpenses) : [];
}

function saveBudget() {
  localStorage.setItem(STORAGE_KEYS.budget, String(monthlyBudget));
}

function saveExpenses() {
  localStorage.setItem(STORAGE_KEYS.expenses, JSON.stringify(expenses));
}

/* ---------------------------------------------------------
   3. DOM ELEMENT REFERENCES
   Grabbing every element once up front keeps the rest of
   the file free of repeated document.getElementById calls.
--------------------------------------------------------- */

const el = {
  // budget
  budgetForm: document.getElementById("budgetForm"),
  budgetInput: document.getElementById("budgetInput"),

  // dashboard
  statBudget: document.getElementById("statBudget"),
  statSpent: document.getElementById("statSpent"),
  statRemaining: document.getElementById("statRemaining"),
  statCount: document.getElementById("statCount"),
  statTopCategory: document.getElementById("statTopCategory"),
  progressFill: document.getElementById("progressFill"),
  progressNote: document.getElementById("progressNote"),
  stamp: document.getElementById("statusStamp"),
  stampText: document.getElementById("stampText"),

  // category breakdown
  categoryList: document.getElementById("categoryList"),

  // add expense form
  expenseForm: document.getElementById("expenseForm"),
  nameInput: document.getElementById("nameInput"),
  amountInput: document.getElementById("amountInput"),
  dateInput: document.getElementById("dateInput"),
  categoryInput: document.getElementById("categoryInput"),
  descriptionInput: document.getElementById("descriptionInput"),
  formError: document.getElementById("formError"),

  // filter + search
  searchInput: document.getElementById("searchInput"),
  filterCategory: document.getElementById("filterCategory"),
  filterMonth: document.getElementById("filterMonth"),
  clearFiltersBtn: document.getElementById("clearFiltersBtn"),

  // list
  expenseList: document.getElementById("expenseList"),
  emptyState: document.getElementById("emptyState"),
  visibleCount: document.getElementById("visibleCount"),
};

const CATEGORIES = [
  "Food / Mess", "Travel", "College / Study", "Hostel",
  "Mobile / Internet", "Entertainment", "Shopping", "Medical", "Other",
];

/* ---------------------------------------------------------
   4. CALCULATION HELPERS
   Small, focused functions that turn raw expense data into
   the numbers the dashboard needs. Nothing here touches the DOM.
--------------------------------------------------------- */

function formatRupees(amount) {
  return "₹" + amount.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

function getTotalSpent(list) {
  return list.reduce((sum, expense) => sum + expense.amount, 0);
}

function getCategoryTotals(list) {
  const totals = {};
  CATEGORIES.forEach((category) => (totals[category] = 0));
  list.forEach((expense) => {
    totals[expense.category] = (totals[expense.category] || 0) + expense.amount;
  });
  return totals;
}

function getTopCategory(categoryTotals) {
  let topName = "—";
  let topAmount = 0;
  for (const [name, amount] of Object.entries(categoryTotals)) {
    if (amount > topAmount) {
      topAmount = amount;
      topName = name;
    }
  }
  return topAmount > 0 ? topName : "—";
}

// Returns one of: "normal", "warning", "critical", "exceeded"
function getBudgetStatus(spent, budget) {
  if (budget <= 0) return "normal";
  const percentUsed = (spent / budget) * 100;
  if (percentUsed > 100) return "exceeded";
  if (percentUsed > 90) return "critical";
  if (percentUsed >= 75) return "warning";
  return "normal";
}

/* ---------------------------------------------------------
   5. FILTERING
   Reads the current search box + filter dropdowns and
   returns only the expenses that match all of them.
--------------------------------------------------------- */

function getFilteredExpenses() {
  const searchTerm = el.searchInput.value.trim().toLowerCase();
  const categoryFilter = el.filterCategory.value;
  const monthFilter = el.filterMonth.value; // format: "YYYY-MM"

  return expenses.filter((expense) => {
    const matchesSearch =
      !searchTerm ||
      expense.name.toLowerCase().includes(searchTerm) ||
      expense.description.toLowerCase().includes(searchTerm);

    const matchesCategory =
      categoryFilter === "all" || expense.category === categoryFilter;

    const matchesMonth =
      !monthFilter || expense.date.startsWith(monthFilter);

    return matchesSearch && matchesCategory && matchesMonth;
  });
}

/* ---------------------------------------------------------
   6. RENDERING
   Each render function reads state and rewrites one part
   of the page. render() is the single entry point that
   calls all of them in the right order.
--------------------------------------------------------- */

function renderDashboard() {
  const spent = getTotalSpent(expenses);
  const remaining = monthlyBudget - spent;
  const categoryTotals = getCategoryTotals(expenses);
  const topCategory = getTopCategory(categoryTotals);
  const status = getBudgetStatus(spent, monthlyBudget);

  el.statBudget.textContent = formatRupees(monthlyBudget);
  el.statSpent.textContent = formatRupees(spent);
  el.statRemaining.textContent = formatRupees(remaining);
  el.statCount.textContent = expenses.length;
  el.statTopCategory.textContent = topCategory;

  // Remaining goes red in text when overspent
  el.statRemaining.style.color = remaining < 0 ? "var(--red)" : "var(--green)";

  // Progress bar
  const percentUsed = monthlyBudget > 0 ? Math.min((spent / monthlyBudget) * 100, 100) : 0;
  el.progressFill.style.width = percentUsed + "%";
  el.progressFill.className = "progress-fill " + (status === "normal" ? "" : status);

  const noteByStatus = {
    normal: "You're comfortably within budget.",
    warning: "Careful — you've used 75% or more of this month's budget.",
    critical: "Almost there — over 90% of your budget is used.",
    exceeded: "Budget exceeded. Time to cut back for the rest of the month.",
  };
  el.progressNote.textContent = monthlyBudget > 0
    ? noteByStatus[status]
    : "Set a monthly budget above to see your progress.";

  // Stamp badge
  const stampByStatus = {
    normal: "NORMAL",
    warning: "WARNING",
    critical: "CRITICAL",
    exceeded: "EXCEEDED",
  };
  el.stampText.textContent = stampByStatus[status];
  el.stamp.className = "stamp " + (status === "normal" ? "" : status);
}

function renderCategoryList() {
  const categoryTotals = getCategoryTotals(expenses);
  const spent = getTotalSpent(expenses);

  el.categoryList.innerHTML = "";

  if (spent === 0) {
    el.categoryList.innerHTML = '<li class="category-empty">No spending recorded yet.</li>';
    return;
  }

  // Only show categories that have at least one expense, largest first
  const activeCategories = Object.entries(categoryTotals)
    .filter(([, amount]) => amount > 0)
    .sort((a, b) => b[1] - a[1]);

  activeCategories.forEach(([category, amount]) => {
    const percent = (amount / spent) * 100;

    const row = document.createElement("li");
    row.className = "category-row";
    row.innerHTML = `
      <span class="category-name">${category}</span>
      <span class="category-bar-track">
        <span class="category-bar-fill" style="width:${percent}%"></span>
      </span>
      <span class="category-amount">${formatRupees(amount)}</span>
    `;
    el.categoryList.appendChild(row);
  });
}

function renderExpenseList() {
  const filtered = getFilteredExpenses();

  // Newest first
  const sorted = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));

  el.expenseList.innerHTML = "";
  el.visibleCount.textContent = `${sorted.length} shown`;
  el.emptyState.style.display = sorted.length === 0 ? "block" : "none";

  sorted.forEach((expense) => {
    const row = document.createElement("li");
    row.className = "ledger-row";
    row.innerHTML = `
      <span class="ledger-name">${escapeHtml(expense.name)}</span>
      <span class="ledger-amount">${formatRupees(expense.amount)}</span>
      <span class="ledger-meta">
        <span class="tag">${escapeHtml(expense.category)}</span>
        <span>${formatDateForDisplay(expense.date)}</span>
      </span>
      ${expense.description ? `<span class="ledger-desc">${escapeHtml(expense.description)}</span>` : ""}
      <button class="delete-btn" data-id="${expense.id}">Delete entry</button>
    `;
    el.expenseList.appendChild(row);
  });
}

function render() {
  renderDashboard();
  renderCategoryList();
  renderExpenseList();
}

/* ---------------------------------------------------------
   Small display helpers
--------------------------------------------------------- */

function formatDateForDisplay(isoDate) {
  const date = new Date(isoDate + "T00:00:00");
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

// Prevents user-typed text from being read as HTML (basic safety/cleanliness)
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/* ---------------------------------------------------------
   7. EVENT HANDLERS
--------------------------------------------------------- */

// --- Budget form ---
el.budgetForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = Number(el.budgetInput.value);

  if (!value || value <= 0) return;

  monthlyBudget = value;
  saveBudget();
  render();
  el.budgetInput.value = "";
});

// --- Add expense form ---
el.expenseForm.addEventListener("submit", (event) => {
  event.preventDefault();
  el.formError.textContent = "";

  const name = el.nameInput.value.trim();
  const amount = Number(el.amountInput.value);
  const date = el.dateInput.value;
  const category = el.categoryInput.value;
  const description = el.descriptionInput.value.trim();

  // Validation
  if (!name) {
    el.formError.textContent = "Please enter an expense name.";
    return;
  }
  if (!amount || amount <= 0) {
    el.formError.textContent = "Please enter an amount greater than 0.";
    return;
  }
  if (!date) {
    el.formError.textContent = "Please choose a date.";
    return;
  }
  if (!category) {
    el.formError.textContent = "Please choose a category.";
    return;
  }

  const newExpense = {
    id: Date.now().toString(), // simple unique id based on timestamp
    name,
    amount,
    category,
    date,
    description,
  };

  expenses.push(newExpense);
  saveExpenses();
  render();

  el.expenseForm.reset();
  el.dateInput.value = getTodayIso(); // keep today's date pre-filled for convenience
});

// --- Delete expense (event delegation: one listener for the whole list) ---
el.expenseList.addEventListener("click", (event) => {
  if (!event.target.classList.contains("delete-btn")) return;

  const idToDelete = event.target.dataset.id;
  expenses = expenses.filter((expense) => expense.id !== idToDelete);
  saveExpenses();
  render();
});

// --- Filters & search (re-render list only, dashboard totals stay unaffected) ---
el.searchInput.addEventListener("input", renderExpenseList);
el.filterCategory.addEventListener("change", renderExpenseList);
el.filterMonth.addEventListener("change", renderExpenseList);

el.clearFiltersBtn.addEventListener("click", () => {
  el.searchInput.value = "";
  el.filterCategory.value = "all";
  el.filterMonth.value = "";
  renderExpenseList();
});

/* ---------------------------------------------------------
   8. INIT
--------------------------------------------------------- */

function getTodayIso() {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

function init() {
  loadState();
  el.dateInput.value = getTodayIso();
  render();
}

init();
