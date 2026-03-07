import '@testing-library/jest-dom'
import type * as Undici from 'undici'
import { ReadableStream, TransformStream } from 'node:stream/web'
import { TextDecoder, TextEncoder } from 'node:util'
import { MessageChannel, MessagePort } from 'node:worker_threads'
import { useSearchStore } from '@/lib/stores/search-store'

Object.assign(globalThis, {
  MessageChannel,
  MessagePort,
  ReadableStream,
  TextDecoder,
  TextEncoder,
  TransformStream,
})

// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
const undici: typeof Undici = require('undici')
const { fetch, Headers, Request, Response } = undici

Object.assign(globalThis, {
  fetch,
  Headers,
  Request,
  Response,
})
afterEach(() => {
  useSearchStore.setState({
    recentSearches: [],
    searchMode: 'zip',
    viewMode: 'table',
    sortField: 'name',
    sortDirection: 'asc',
  })
})
