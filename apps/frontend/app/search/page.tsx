import { Suspense } from 'react'
import { SearchExperience } from '@/components/search/search-experience'

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchExperience />
    </Suspense>
  )
}
