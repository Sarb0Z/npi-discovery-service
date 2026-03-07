import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SearchForm } from '@/components/search/search-form'
import { useSearchStore } from '@/lib/stores/search-store'

describe('SearchForm', () => {
  it('renders ZIP mode inputs by default', () => {
    render(
      <SearchForm
        onSubmit={() => {
          return undefined
        }}
      />,
    )

    expect(screen.getByLabelText('ZIP code')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Search providers' })).toBeInTheDocument()
  })

  it('submits a valid ZIP search', async () => {
    const handleSubmit = jest.fn()

    render(<SearchForm onSubmit={handleSubmit} />)

    fireEvent.change(screen.getByLabelText('ZIP code'), { target: { value: '75201' } })
    fireEvent.click(screen.getByRole('button', { name: 'Search providers' }))

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          zipCode: '75201',
        }),
      )
    })
  })

  it('applies a quick specialty pick before submit', async () => {
    const handleSubmit = jest.fn()

    render(<SearchForm onSubmit={handleSubmit} />)

    fireEvent.change(screen.getByLabelText('ZIP code'), { target: { value: '75201' } })
    fireEvent.click(screen.getByRole('button', { name: 'Dentist' }))
    fireEvent.click(screen.getByRole('button', { name: 'Search providers' }))

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          zipCode: '75201',
          taxonomyDescription: 'Dentist',
        }),
      )
    })
  })

  it('switches modes and restores a recent search', async () => {
    useSearchStore.setState({
      recentSearches: [
        {
          label: 'Austin dental search',
          query: 'city=Austin&state=TX&taxonomyDescription=Dentist&providerType=1',
        },
      ],
    })

    render(
      <SearchForm
        onSubmit={() => {
          return undefined
        }}
      />,
    )

    fireEvent.click(screen.getByRole('tab', { name: 'City + State' }))
    expect(screen.getByLabelText('City')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Austin dental search' }))

    await waitFor(() => {
      expect(screen.getByDisplayValue('Austin')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Dentist')).toBeInTheDocument()
    })
  })
})
