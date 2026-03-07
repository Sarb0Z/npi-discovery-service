import { AppService } from './app.service'

describe('AppService', () => {
  it('returns the default hello message', () => {
    expect(new AppService().getHello()).toBe('Hello World!')
  })
})
