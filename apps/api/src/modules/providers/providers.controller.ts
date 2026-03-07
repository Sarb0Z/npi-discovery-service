import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { SearchProvidersDto, type SearchResponseDto } from '@npi/contracts'
import { ProvidersService } from './providers.service'

@Controller('providers')
@ApiTags('providers')
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Post('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search healthcare providers by location and taxonomy filters' })
  @ApiBody({ type: SearchProvidersDto })
  @ApiOkResponse({ description: 'Returns the matching providers and response metadata.' })
  async search(@Body() searchProvidersDto: SearchProvidersDto): Promise<SearchResponseDto> {
    return this.providersService.search(searchProvidersDto)
  }
}
