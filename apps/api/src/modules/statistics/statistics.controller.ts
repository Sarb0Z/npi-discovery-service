import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { SearchProvidersDto, type StatisticsResponseDto } from '@npi/contracts'
import { StatisticsService } from './statistics.service'

@Controller('statistics')
@ApiTags('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate provider statistics for a search request' })
  @ApiBody({ type: SearchProvidersDto })
  @ApiOkResponse({ description: 'Returns aggregated provider statistics for the search.' })
  async getStatistics(
    @Body() searchProvidersDto: SearchProvidersDto,
  ): Promise<StatisticsResponseDto> {
    return this.statisticsService.getStatistics(searchProvidersDto)
  }
}
