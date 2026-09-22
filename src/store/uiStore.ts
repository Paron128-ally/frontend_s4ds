import { create } from "zustand";
import { UserRole } from "@/types";
import { switchUserRole } from "@/lib/auth";

interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  userRole: UserRole;
  setUserRole: (role: UserRole) => void;

  // Shortlist filters
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  bandFilter: string;
  setBandFilter: (band: string) => void;
  trackFilter: string;
  setTrackFilter: (track: string) => void;
  integrityOnly: boolean;
  setIntegrityOnly: (val: boolean) => void;
  overriddenOnly: boolean;
  setOverriddenOnly: (val: boolean) => void;
  minScore: number | undefined;
  setMinScore: (val: number | undefined) => void;
  maxScore: number | undefined;
  setMaxScore: (val: number | undefined) => void;
  sortBy: "rank" | "composite" | "p2Score" | "name" | "id";
  setSortBy: (sort: "rank" | "composite" | "p2Score" | "name" | "id") => void;
  sortOrder: "asc" | "desc";
  setSortOrder: (order: "asc" | "desc") => void;
  resetFilters: () => void;

  // Freeze Modal State
  isFreezeModalOpen: boolean;
  setIsFreezeModalOpen: (open: boolean) => void;

  // Selected Team Drawer / Inspector
  selectedTeamId: string | null;
  setSelectedTeamId: (id: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  userRole: "auditor",
  setUserRole: (role) => {
    switchUserRole(role);
    set({ userRole: role });
  },

  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),
  statusFilter: "ALL",
  setStatusFilter: (status) => set({ statusFilter: status }),
  bandFilter: "ALL",
  setBandFilter: (band) => set({ bandFilter: band }),
  trackFilter: "ALL",
  setTrackFilter: (track) => set({ trackFilter: track }),
  integrityOnly: false,
  setIntegrityOnly: (integrityOnly) => set({ integrityOnly }),
  overriddenOnly: false,
  setOverriddenOnly: (overriddenOnly) => set({ overriddenOnly }),
  minScore: undefined,
  setMinScore: (minScore) => set({ minScore }),
  maxScore: undefined,
  setMaxScore: (maxScore) => set({ maxScore }),
  sortBy: "rank",
  setSortBy: (sortBy) => set({ sortBy }),
  sortOrder: "asc",
  setSortOrder: (sortOrder) => set({ sortOrder }),
  resetFilters: () =>
    set({
      searchQuery: "",
      statusFilter: "ALL",
      bandFilter: "ALL",
      trackFilter: "ALL",
      integrityOnly: false,
      overriddenOnly: false,
      minScore: undefined,
      maxScore: undefined,
      sortBy: "rank",
      sortOrder: "asc",
    }),

  isFreezeModalOpen: false,
  setIsFreezeModalOpen: (open) => set({ isFreezeModalOpen: open }),

  selectedTeamId: null,
  setSelectedTeamId: (id) => set({ selectedTeamId: id }),
}));
