// SELECT ELEMENTS
const balanceEl = document.querySelector(".balance .value");
const incomeTotalEl = document.querySelector(".income-total");
const outcomeTotalEl = document.querySelector(".outcome-total");
const incomeEl = document.querySelector("#income");
const expenseEl = document.querySelector("#expense");
const allEl = document.querySelector("#all");
const incomeList = document.querySelector("#income .list");
const expenseList = document.querySelector("#expense .list");
const allList = document.querySelector("#all .list");
const languageButtons = document.querySelectorAll(".language-btn");
const translatableText = document.querySelectorAll("[data-i18n]");
const translatablePlaceholders = document.querySelectorAll("[data-i18n-placeholder]");

// SELECT BUTTONS
const expenseBtn = document.querySelector(".first-tab");
const incomeBtn = document.querySelector(".second-tab");
const allBtn = document.querySelector(".third-tab");

// INPUT BTS
const addExpense = document.querySelector(".add-expense");
const expenseTitle = document.getElementById("expense-title-input");
const expenseAmount = document.getElementById("expense-amount-input");

const addIncome = document.querySelector(".add-income");
const incomeTitle = document.getElementById("income-title-input");
const incomeAmount = document.getElementById("income-amount-input");

// VARIABLES
let ENTRY_LIST;
let balance = 0,
  income = 0,
  outcome = 0;
const DELETE = "delete",
  EDIT = "edit";
const logic = window.BudgetLogic;
const LANGUAGE_STORAGE_KEY = "budget_app_language";
const translations = {
  en: {
    all: "All",
    amountPlaceholder: "$0",
    balance: "Balance",
    dashboard: "Dashboard",
    expenseLabel: "Expense",
    expenses: "Expenses",
    income: "Income",
    incomeLabel: "Income",
    invalidAmount: "{type} amount must be a valid number",
    maxAmount: "{type} amount cannot exceed {max}",
    negativeAmount: "{type} amount cannot be negative",
    outcome: "Outcome",
    titlePlaceholder: "title",
    zeroAmount: "{type} amount cannot be zero",
  },
  zh: {
    all: "全部",
    amountPlaceholder: "金额",
    balance: "余额",
    dashboard: "仪表盘",
    expenseLabel: "支出",
    expenses: "支出",
    income: "收入",
    incomeLabel: "收入",
    invalidAmount: "{type}金额必须是有效数字",
    maxAmount: "{type}金额不能超过 {max}",
    negativeAmount: "{type}金额不能为负数",
    outcome: "支出",
    titlePlaceholder: "标题",
    zeroAmount: "{type}金额不能为零",
  },
};
let currentLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) || "en";

// CHECK IF THERE IS DATA IN LOCAL STORAGE
ENTRY_LIST = logic.loadEntries(localStorage);
applyLanguage(currentLanguage);
updateUI();

// EVENT LISTENERS
expenseBtn.addEventListener("click", function () {
  show(expenseEl);
  hide([incomeEl, allEl]);
  active(expenseBtn);
  inactive([incomeBtn, allBtn]);
});

incomeBtn.addEventListener("click", function () {
  show(incomeEl);
  hide([expenseEl, allEl]);
  active(incomeBtn);
  inactive([expenseBtn, allBtn]);
});

allBtn.addEventListener("click", function () {
  show(allEl);
  hide([incomeEl, expenseEl]);
  active(allBtn);
  inactive([incomeBtn, expenseBtn]);
});

languageButtons.forEach((button) => {
  button.addEventListener("click", function () {
    applyLanguage(button.dataset.lang);
  });
});

function translate(key, replacements = {}) {
  let text = translations[currentLanguage][key] || translations.en[key] || key;

  Object.keys(replacements).forEach((replacementKey) => {
    text = text.replace(`{${replacementKey}}`, replacements[replacementKey]);
  });

  return text;
}

function applyLanguage(language) {
  currentLanguage = translations[language] ? language : "en";
  localStorage.setItem(LANGUAGE_STORAGE_KEY, currentLanguage);
  document.documentElement.lang = currentLanguage === "zh" ? "zh-CN" : "en";

  translatableText.forEach((element) => {
    element.textContent = translate(element.dataset.i18n);
  });

  translatablePlaceholders.forEach((element) => {
    element.placeholder = translate(element.dataset.i18nPlaceholder);
  });

  languageButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.lang === currentLanguage);
  });
}

// Helper function to validate amount values
function validateAmount(amount, type) {
  const numAmount = Number(amount);
  const entryType = translate(`${type}Label`);
  
  // Check if amount is a valid number
  if (isNaN(numAmount)) {
    alert(translate("invalidAmount", { type: entryType }));
    return false;
  }
  
  // Check if amount is negative
  if (numAmount < 0) {
    alert(translate("negativeAmount", { type: entryType }));
    return false;
  }
  
  // Check if amount is zero
  if (numAmount === 0) {
    alert(translate("zeroAmount", { type: entryType }));
    return false;
  }
  
  // Check if amount is unreasonably large (10 million as upper limit)
  const MAX_REASONABLE_AMOUNT = 10000000;
  if (numAmount > MAX_REASONABLE_AMOUNT) {
    alert(
      translate("maxAmount", {
        max: MAX_REASONABLE_AMOUNT.toLocaleString(),
        type: entryType,
      })
    );
    return false;
  }
  
  return true;
}

// Add expense entry with validation
addExpense.addEventListener("click", function () {
  // Check if required fields are empty
  if (!logic.hasRequiredEntryFields(expenseTitle.value, expenseAmount.value)) return;
  
  // Validate amount value
  if (!validateAmount(expenseAmount.value, 'expense')) return;
  
  // Add entry to ENTRY_LIST
  let expense = logic.createEntry("expense", expenseTitle.value, expenseAmount.value);
  ENTRY_LIST = logic.addEntry(ENTRY_LIST, expense);
  
  updateUI();
  clearInput([expenseTitle, expenseAmount]);
});

// Add income entry with validation
addIncome.addEventListener("click", function () {
  // Check if required fields are empty
  if (!logic.hasRequiredEntryFields(incomeTitle.value, incomeAmount.value)) return;
  
  // Validate amount value
  if (!validateAmount(incomeAmount.value, 'income')) return;
  
  // Add entry to ENTRY_LIST
  let income = logic.createEntry("income", incomeTitle.value, incomeAmount.value);
  ENTRY_LIST = logic.addEntry(ENTRY_LIST, income);
  
  updateUI();
  clearInput([incomeTitle, incomeAmount]);
});

incomeList.addEventListener("click", deleteOrEdit);
expenseList.addEventListener("click", deleteOrEdit);
allList.addEventListener("click", deleteOrEdit);

// HELPER FUNCTIONS
function deleteOrEdit(event) {
  const targetBtn = event.target;
  const entry = targetBtn.parentNode;

  if (targetBtn.id == EDIT) {
    editEntry(entry);
  } else if (targetBtn.id == DELETE) {
    deleteEntry(entry);
  }
}

function deleteEntry(entry) {
  ENTRY_LIST = logic.removeEntryAt(ENTRY_LIST, entry.id);
  updateUI();
}

function editEntry(entry) {
  const ENTRY = ENTRY_LIST[entry.id];

  if (ENTRY.type == "income") {
    incomeTitle.value = ENTRY.title;
    incomeAmount.value = ENTRY.amount;
  } else if (ENTRY.type == "expense") {
    expenseTitle.value = ENTRY.title;
    expenseAmount.value = ENTRY.amount;
  }
  deleteEntry(entry);
}

function updateUI() {
  const summary = logic.getBudgetSummary(ENTRY_LIST);
  income = summary.income;
  outcome = summary.outcome;
  balance = summary.balance;

  // Update UI
  balanceEl.innerHTML = `<small>${summary.sign}</small>${balance}`;
  outcomeTotalEl.innerHTML = `<small>$</small>${outcome}`;
  incomeTotalEl.innerHTML = `<small>$</small>${income}`;

  clearElement([expenseList, incomeList, allList]);

  ENTRY_LIST.forEach((entry, index) => {
    if (entry.type == "expense") {
      showEntry(expenseList, entry.type, entry.title, entry.amount, index);
    } else if (entry.type == "income") {
      showEntry(incomeList, entry.type, entry.title, entry.amount, index);
    }
    showEntry(allList, entry.type, entry.title, entry.amount, index);
  });
  updateChart(income, outcome);
  logic.saveEntries(localStorage, ENTRY_LIST);
}

function showEntry(list, type, title, amount, id) {
  const entry = `<li id="${id}" class="${type}">
                    <div class="entry">${title} : $${amount}</div>
                    <div id="edit"></div>
                    <div id="delete"></div>
                  </li>`;
  const position = "afterbegin";
  list.insertAdjacentHTML(position, entry);
}

function clearElement(elements) {
  elements.forEach((element) => {
    element.innerHTML = "";
  });
}

function clearInput(inputs) {
  inputs.forEach((input) => {
    input.value = "";
  });
}

function show(element) {
  element.classList.remove("hide");
}

function hide(elements) {
  elements.forEach((element) => {
    element.classList.add("hide");
  });
}

function active(element) {
  element.classList.add("focus");
}

function inactive(elements) {
  elements.forEach((element) => {
    element.classList.remove("focus");
  });
}
