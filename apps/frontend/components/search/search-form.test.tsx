import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SearchForm } from '@/components/search/search-form'

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
})
