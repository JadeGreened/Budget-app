(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.BudgetLogic = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  const ENTRY_STORAGE_KEY = "entry_list";

  function parseEntries(rawValue) {
    if (!rawValue) return [];

    try {
      const parsed = JSON.parse(rawValue);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function loadEntries(storage) {
    return parseEntries(storage.getItem(ENTRY_STORAGE_KEY));
  }

  function saveEntries(storage, entries) {
    storage.setItem(ENTRY_STORAGE_KEY, JSON.stringify(entries));
  }

  function createEntry(type, title, amount) {
    return {
      type,
      title,
      amount: Number(amount),
    };
  }

  function hasRequiredEntryFields(title, amount) {
    return Boolean(title && amount);
  }

  function addEntry(entries, entry) {
    return [...entries, entry];
  }

  function removeEntryAt(entries, index) {
    return entries.filter((entry, entryIndex) => entryIndex !== Number(index));
  }

  function calculateTotal(type, entries) {
    return entries.reduce((sum, entry) => {
      return entry.type === type ? sum + Number(entry.amount) : sum;
    }, 0);
  }

  function calculateBalance(income, outcome) {
    return income - outcome;
  }

  function getBudgetSummary(entries) {
    const income = calculateTotal("income", entries);
    const outcome = calculateTotal("expense", entries);
    const rawBalance = calculateBalance(income, outcome);

    return {
      income,
      outcome,
      balance: Math.abs(rawBalance),
      sign: rawBalance >= 0 ? "$" : "-$",
    };
  }

  return {
    ENTRY_STORAGE_KEY,
    addEntry,
    calculateBalance,
    calculateTotal,
    createEntry,
    getBudgetSummary,
    hasRequiredEntryFields,
    loadEntries,
    parseEntries,
    removeEntryAt,
    saveEntries,
  };
});
