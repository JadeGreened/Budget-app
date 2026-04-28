const BudgetLogic = require("./budgetLogic");

describe("budget logic", () => {
  test("parseEntries returns an empty list for missing, invalid, or non-array data", () => {
    expect(BudgetLogic.parseEntries(null)).toEqual([]);
    expect(BudgetLogic.parseEntries("not-json")).toEqual([]);
    expect(BudgetLogic.parseEntries('{"type":"income"}')).toEqual([]);
  });

  test("createEntry normalizes amount values to numbers", () => {
    expect(BudgetLogic.createEntry("income", "Salary", "1200")).toEqual({
      type: "income",
      title: "Salary",
      amount: 1200,
    });
  });

  test("hasRequiredEntryFields preserves the original required-field behavior", () => {
    expect(BudgetLogic.hasRequiredEntryFields("Rent", "800")).toBe(true);
    expect(BudgetLogic.hasRequiredEntryFields("", "800")).toBe(false);
    expect(BudgetLogic.hasRequiredEntryFields("Rent", "")).toBe(false);
  });

  test("addEntry returns a new entries list without mutating the original list", () => {
    const entries = [BudgetLogic.createEntry("income", "Salary", 1000)];
    const expense = BudgetLogic.createEntry("expense", "Food", 80);

    const nextEntries = BudgetLogic.addEntry(entries, expense);

    expect(nextEntries).toHaveLength(2);
    expect(entries).toHaveLength(1);
  });

  test("removeEntryAt removes the requested entry without mutating the original list", () => {
    const entries = [
      BudgetLogic.createEntry("income", "Salary", 1000),
      BudgetLogic.createEntry("expense", "Food", 80),
      BudgetLogic.createEntry("expense", "Transport", 20),
    ];

    const nextEntries = BudgetLogic.removeEntryAt(entries, 1);

    expect(nextEntries).toEqual([
      BudgetLogic.createEntry("income", "Salary", 1000),
      BudgetLogic.createEntry("expense", "Transport", 20),
    ]);
    expect(entries).toHaveLength(3);
  });

  test("calculateTotal sums entries by type", () => {
    const entries = [
      BudgetLogic.createEntry("income", "Salary", 1000),
      BudgetLogic.createEntry("income", "Gift", 50),
      BudgetLogic.createEntry("expense", "Food", 80),
    ];

    expect(BudgetLogic.calculateTotal("income", entries)).toBe(1050);
    expect(BudgetLogic.calculateTotal("expense", entries)).toBe(80);
  });

  test("calculateBalance subtracts outcome from income", () => {
    expect(BudgetLogic.calculateBalance(1000, 250)).toBe(750);
    expect(BudgetLogic.calculateBalance(100, 250)).toBe(-150);
  });

  test("getBudgetSummary returns totals, absolute balance, and display sign", () => {
    const entries = [
      BudgetLogic.createEntry("income", "Salary", 1000),
      BudgetLogic.createEntry("expense", "Food", 80),
      BudgetLogic.createEntry("expense", "Rent", 1200),
    ];

    expect(BudgetLogic.getBudgetSummary(entries)).toEqual({
      income: 1000,
      outcome: 1280,
      balance: 280,
      sign: "-$",
    });
  });

  test("loadEntries and saveEntries isolate localStorage access from UI code", () => {
    const storage = {
      value: "",
      getItem: jest.fn(() => storage.value),
      setItem: jest.fn((key, value) => {
        storage.value = value;
      }),
    };
    const entries = [BudgetLogic.createEntry("income", "Salary", 1000)];

    BudgetLogic.saveEntries(storage, entries);

    expect(storage.setItem).toHaveBeenCalledWith("entry_list", JSON.stringify(entries));
    expect(BudgetLogic.loadEntries(storage)).toEqual(entries);
  });
});
