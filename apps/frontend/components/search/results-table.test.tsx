import { ProviderType, type ProviderDto } from '@npi/contracts'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { ResultsTable } from '@/components/search/results-table'

function buildProvider(index: number, overrides: Partial<ProviderDto> = {}): ProviderDto {
  return {
    npi: `100000000${index}`,
    type: index % 2 === 0 ? ProviderType.Individual : ProviderType.Organization,
    name: `Provider ${String(index).padStart(2, '0')}`,
    primarySpecialty: index % 2 === 0 ? 'Dentist' : 'Cardiology',
    specialties: [index % 2 === 0 ? 'Dentist' : 'Cardiology'],
    taxonomies: [
      {
        code: index % 2 === 0 ? '1223G0001X' : '207R00000X',
        description: index % 2 === 0 ? 'Dentist' : 'Cardiology',
        primary: true,
        state: index % 2 === 0 ? 'TX' : 'CA',
      },
    ],
    address: {
      address1: `${index} Main St`,
      address2: null,
      city: `City ${String(20 - index).padStart(2, '0')}`,
      state: index % 2 === 0 ? 'TX' : 'CA',
      zipCode: `75${String(index).padStart(3, '0')}`,
    },
    phone: '555-0100',
    ...overrides,
  }
}

function getBodyRows() {
  return screen.getAllByRole('row').slice(1)
}

function getFirstBodyRow() {
  const [firstRow] = getBodyRows()

  expect(firstRow).toBeDefined()

  return firstRow!
}

describe('ResultsTable', () => {
  it('sorts rows and renders provider type badges', () => {
    render(
      <ResultsTable
        providers={[
          buildProvider(2, {
            name: 'Zulu Clinic',
            address: { ...buildProvider(2).address, city: 'Dallas' },
          }),
          buildProvider(1, {
            name: 'Alpha Clinic',
            address: { ...buildProvider(1).address, city: 'Austin' },
          }),
        ]}
      />,
    )

    expect(within(getFirstBodyRow()).getByText('Alpha Clinic')).toBeInTheDocument()
    expect(screen.getByText('Individual')).toBeInTheDocument()
    expect(screen.getByText('Organization')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /name/i }))
    expect(within(getFirstBodyRow()).getByText('Zulu Clinic')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /city/i }))
    expect(within(getFirstBodyRow()).getByText('Austin')).toBeInTheDocument()
  })

  it('paginates through long result sets', () => {
    render(
      <ResultsTable
        providers={Array.from({ length: 11 }, (_, index) => buildProvider(index + 1))}
      />,
    )

    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled()
    expect(screen.getByText('Provider 01')).toBeInTheDocument()
    expect(screen.queryByText('Provider 11')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Next' }))

    expect(screen.getByText('Page 2 of 2')).toBeInTheDocument()
    expect(screen.getByText('Provider 11')).toBeInTheDocument()
    expect(screen.queryByText('Provider 01')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
  })

  it('expands provider rows and supports page-size changes', () => {
    render(
      <ResultsTable
        providers={Array.from({ length: 26 }, (_, index) => buildProvider(index + 1))}
      />,
    )

    const [expandButton] = screen.getAllByRole('button', { name: 'Show details' })

    expect(expandButton).toBeDefined()

    fireEvent.click(expandButton!)

    expect(screen.getByText('Practice location')).toBeInTheDocument()
    expect(screen.getByText('Cardiology (207R00000X)')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Rows per page'), { target: { value: '25' } })

    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument()
    expect(screen.getByText('Provider 25')).toBeInTheDocument()
  })
})
