import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { SearchProvidersDto, type SearchResponseDto } from '@npi/contracts'
import { ProvidersService } from './providers.service'

@Controller('providers')
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Post('search')
  @HttpCode(HttpStatus.OK)
  async search(@Body() searchProvidersDto: SearchProvidersDto): Promise<SearchResponseDto> {
    return this.providersService.search(searchProvidersDto)
  }
}
