import { create } from "zustand";

interface ExpenseFilterState {
  /** Selected category value, or "all". */
  category: string;
  search: string;
  setCategory: (category: string) => void;
  setSearch: (search: string) => void;
  reset: () => void;
}

export const useExpenseFilters = create<ExpenseFilterState>((set) => ({
  category: "all",
  search: "",
  setCategory: (category) => set({ category }),
  setSearch: (search) => set({ search }),
  reset: () => set({ category: "all", search: "" }),
}));
