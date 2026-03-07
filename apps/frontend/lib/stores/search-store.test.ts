import { useSearchStore } from '@/lib/stores/search-store'

describe('search-store', () => {
  it('updates search and view modes', () => {
    useSearchStore.getState().setSearchMode('stateOnly')
    useSearchStore.getState().setViewMode('card')

    expect(useSearchStore.getState().searchMode).toBe('stateOnly')
    expect(useSearchStore.getState().viewMode).toBe('card')
  })

  it('deduplicates recent searches and keeps the newest five', () => {
    for (let index = 1; index <= 6; index += 1) {
      useSearchStore.getState().addRecentSearch({
        label: `Search ${index}`,
        query: `zipCode=75${index}`,
      })
    }

    useSearchStore.getState().addRecentSearch({
      label: 'Updated Search 4',
      query: 'zipCode=754',
    })

    expect(useSearchStore.getState().recentSearches).toEqual([
      { label: 'Updated Search 4', query: 'zipCode=754' },
      { label: 'Search 6', query: 'zipCode=756' },
      { label: 'Search 5', query: 'zipCode=755' },
      { label: 'Search 3', query: 'zipCode=753' },
      { label: 'Search 2', query: 'zipCode=752' },
    ])
  })

  it('toggles sort direction when the same field is selected twice', () => {
    useSearchStore.getState().setSort('city')
    expect(useSearchStore.getState().sortField).toBe('city')
    expect(useSearchStore.getState().sortDirection).toBe('asc')

    useSearchStore.getState().setSort('city')
    expect(useSearchStore.getState().sortDirection).toBe('desc')

    useSearchStore.getState().setSort('state')
    expect(useSearchStore.getState().sortField).toBe('state')
    expect(useSearchStore.getState().sortDirection).toBe('asc')
  })
})