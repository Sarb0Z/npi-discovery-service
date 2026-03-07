import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type SearchMode = 'zip' | 'cityState' | 'stateOnly'
export type ResultsViewMode = 'table' | 'card'
export type SortField = 'name' | 'npi' | 'primarySpecialty' | 'city' | 'state'
export type SortDirection = 'asc' | 'desc'

export interface RecentSearch {
  label: string
  query: string
}

interface SearchStore {
  searchMode: SearchMode
  recentSearches: RecentSearch[]
  viewMode: ResultsViewMode
  sortField: SortField
  sortDirection: SortDirection
  setSearchMode: (searchMode: SearchMode) => void
  addRecentSearch: (search: RecentSearch) => void
  setViewMode: (viewMode: ResultsViewMode) => void
  setSort: (field: SortField) => void
}

export const useSearchStore = create<SearchStore>()(
  persist(
    (set) => ({
      searchMode: 'zip',
      recentSearches: [],
      viewMode: 'table',
      sortField: 'name',
      sortDirection: 'asc',
      setSearchMode: (searchMode) => set({ searchMode }),
      addRecentSearch: (search) =>
        set((state) => ({
          recentSearches: [
            search,
            ...state.recentSearches.filter((entry) => entry.query !== search.query),
          ].slice(0, 5),
        })),
      setViewMode: (viewMode) => set({ viewMode }),
      setSort: (field) =>
        set((state) => ({
          sortField: field,
          sortDirection:
            state.sortField === field && state.sortDirection === 'asc' ? 'desc' : 'asc',
        })),
    }),
    {
      name: 'npi-discovery-search-store',
      // Rehydrate after mount to keep initial SSR and client render consistent.
      skipHydration: true,
      partialize: (state) => ({
        recentSearches: state.recentSearches,
        searchMode: state.searchMode,
        viewMode: state.viewMode,
        sortField: state.sortField,
        sortDirection: state.sortDirection,
      }),
    },
  ),
)
