const BudgetLogic = require("./budgetLogic");

describe("budget logic", () => {
  test("parseEntries returns an empty list for missing, invalid, or non-array data", () => {
    expect(BudgetLogic.parseEntries(null)).toEqual([]);
    expect(BudgetLogic.parseEntries("not-json")).toEqual([]);
    expect(BudgetLogic.parseEntries('{"type":"income"}')).toEqual([]);
  });

  test("createEntry normalizes amount values to numbers", () => {
    expect(BudgetLogic.createEntry("income", "Salary", "1200", "entry-1")).toEqual({
      id: "entry-1",
      type: "income",
      title: "Salary",
      amount: 1200,
    });
  });

  test("createEntry assigns a stable id when one is not provided", () => {
    const entry = BudgetLogic.createEntry("income", "Salary", "1200");

    expect(entry.id).toEqual(expect.any(String));
    expect(entry.id).not.toHaveLength(0);
  });

  test("hasRequiredEntryFields preserves the original required-field behavior", () => {
    expect(BudgetLogic.hasRequiredEntryFields("Rent", "800")).toBe(true);
    expect(BudgetLogic.hasRequiredEntryFields("", "800")).toBe(false);
    expect(BudgetLogic.hasRequiredEntryFields("Rent", "")).toBe(false);
  });

  test("addEntry returns a new entries list without mutating the original list", () => {
    const entries = [BudgetLogic.createEntry("income", "Salary", 1000, "entry-1")];
    const expense = BudgetLogic.createEntry("expense", "Food", 80, "entry-2");

    const nextEntries = BudgetLogic.addEntry(entries, expense);

    expect(nextEntries).toHaveLength(2);
    expect(entries).toHaveLength(1);
  });

  test("removeEntryById removes the requested entry without mutating the original list", () => {
    const entries = [
      BudgetLogic.createEntry("income", "Salary", 1000, "entry-1"),
      BudgetLogic.createEntry("expense", "Food", 80, "entry-2"),
      BudgetLogic.createEntry("expense", "Transport", 20, "entry-3"),
    ];

    const nextEntries = BudgetLogic.removeEntryById(entries, "entry-2");

    expect(nextEntries).toEqual([
      BudgetLogic.createEntry("income", "Salary", 1000, "entry-1"),
      BudgetLogic.createEntry("expense", "Transport", 20, "entry-3"),
    ]);
    expect(entries).toHaveLength(3);
  });

  test("findEntryById returns the matching entry", () => {
    const entries = [
      BudgetLogic.createEntry("income", "Salary", 1000, "entry-1"),
      BudgetLogic.createEntry("expense", "Food", 80, "entry-2"),
    ];

    expect(BudgetLogic.findEntryById(entries, "entry-2")).toEqual(entries[1]);
  });

  test("calculateTotal sums entries by type", () => {
    const entries = [
      BudgetLogic.createEntry("income", "Salary", 1000, "entry-1"),
      BudgetLogic.createEntry("income", "Gift", 50, "entry-2"),
      BudgetLogic.createEntry("expense", "Food", 80, "entry-3"),
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
      BudgetLogic.createEntry("income", "Salary", 1000, "entry-1"),
      BudgetLogic.createEntry("expense", "Food", 80, "entry-2"),
      BudgetLogic.createEntry("expense", "Rent", 1200, "entry-3"),
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
    const entries = [BudgetLogic.createEntry("income", "Salary", 1000, "entry-1")];

    BudgetLogic.saveEntries(storage, entries);

    expect(storage.setItem).toHaveBeenCalledWith("entry_list", JSON.stringify(entries));
    expect(BudgetLogic.loadEntries(storage)).toEqual(entries);
  });

  test("loadEntries adds ids to legacy entries without ids", () => {
    const storage = {
      getItem: jest.fn(() => JSON.stringify([{ type: "income", title: "Salary", amount: 1000 }])),
    };

    const entries = BudgetLogic.loadEntries(storage);

    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({
      type: "income",
      title: "Salary",
      amount: 1000,
    });
    expect(entries[0].id).toEqual(expect.any(String));
  });
});
