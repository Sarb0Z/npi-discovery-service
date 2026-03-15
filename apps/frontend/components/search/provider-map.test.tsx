import type { ProviderDto } from '@npi/contracts'
import { ProviderType } from '@npi/contracts'
import { render, screen, waitFor } from '@testing-library/react'
import { ProviderMap } from '@/components/search/provider-map'

const mockAddTo = jest.fn()
const mockBindPopup = jest.fn()
const mockCircleMarker = jest.fn(() => ({
  addTo: mockAddTo,
  bindPopup: mockBindPopup,
}))
const mockExtend = jest.fn()
const mockPad = jest.fn(() => 'padded-bounds')
const mockLatLngBounds = jest.fn(() => ({
  extend: mockExtend,
  pad: mockPad,
}))
const mockLayerRemove = jest.fn()
const mockLayerAddTo = jest.fn()
const mockLayerGroup = jest.fn(() => ({
  addTo: mockLayerAddTo,
  remove: mockLayerRemove,
}))
const mockSetView = jest.fn()
const mockFitBounds = jest.fn()
const mockInvalidateSize = jest.fn()
const mockMapRemove = jest.fn()
const mockMap = jest.fn(() => ({
  fitBounds: mockFitBounds,
  invalidateSize: mockInvalidateSize,
  remove: mockMapRemove,
  setView: mockSetView,
}))
const mockZoomAddTo = jest.fn()
const mockTileLayerAddTo = jest.fn()

jest.mock('leaflet', () => ({
  __esModule: true,
  circleMarker: mockCircleMarker,
  control: {
    zoom: jest.fn(() => ({ addTo: mockZoomAddTo })),
  },
  latLngBounds: mockLatLngBounds,
  layerGroup: mockLayerGroup,
  map: mockMap,
  tileLayer: jest.fn(() => ({ addTo: mockTileLayerAddTo })),
}))

jest.mock('zipcodes', () => ({
  lookup: jest.fn((zipCode: string) => {
    if (zipCode === '75201') {
      return {
        city: 'Dallas',
        latitude: 32.7876,
        longitude: -96.7994,
        state: 'TX',
      }
    }

    if (zipCode === '73301') {
      return {
        city: 'Austin',
        latitude: 30.3072,
        longitude: -97.756,
        state: 'TX',
      }
    }

    return undefined
  }),
}))

function createProvider(overrides: Partial<ProviderDto> = {}): ProviderDto {
  return {
    npi: '1234567893',
    type: ProviderType.Individual,
    name: 'Dr. Ada Lovelace',
    primarySpecialty: 'Dentist',
    specialties: ['Dentist'],
    taxonomies: [
      {
        code: '1223G0001X',
        description: 'Dentist',
        primary: true,
        state: 'TX',
      },
    ],
    address: {
      address1: '123 Main St',
      address2: null,
      city: 'Dallas',
      state: 'TX',
      zipCode: '75201',
    },
    phone: '555-0100',
    ...overrides,
  }
}

describe('ProviderMap', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('groups providers by ZIP code and reports unmappable records', async () => {
    render(
      <ProviderMap
        providers={[
          createProvider(),
          createProvider({
            address: {
              address1: '456 Elm St',
              address2: null,
              city: 'Dallas',
              state: 'TX',
              zipCode: '75201-1234',
            },
            npi: '2234567893',
            phone: '555-0101',
          }),
          createProvider({
            address: {
              address1: '789 Oak St',
              address2: null,
              city: 'Unknown',
              state: 'TX',
              zipCode: '00000',
            },
            npi: '3234567893',
          }),
        ]}
      />,
    )

    expect(screen.getByText('1 mapped areas')).toBeInTheDocument()
    expect(screen.getByText('2 providers positioned')).toBeInTheDocument()
    expect(screen.getByText('1 providers without mappable ZIP data')).toBeInTheDocument()
    expect(screen.getByLabelText('Provider footprint map')).toBeInTheDocument()

    await waitFor(() => {
      expect(mockSetView).toHaveBeenCalledWith([32.7876, -96.7994], 9)
    })
    expect(mockCircleMarker).toHaveBeenCalledTimes(1)
  })

  it('renders the empty-state message when no ZIP code can be mapped', () => {
    render(
      <ProviderMap
        providers={[
          createProvider({
            address: {
              address1: '123 Main St',
              address2: null,
              city: 'Dallas',
              state: 'TX',
              zipCode: '',
            },
          }),
        ]}
      />,
    )

    expect(
      screen.getByText(
        'No providers in the current result set have enough postal-code data to render on the map.',
      ),
    ).toBeInTheDocument()
    expect(mockMap).not.toHaveBeenCalled()
  })
})
