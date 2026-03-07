import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { SearchProvidersDto, type StatisticsResponseDto } from '@npi/contracts'
import { StatisticsService } from './statistics.service'

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async getStatistics(@Body() searchProvidersDto: SearchProvidersDto): Promise<StatisticsResponseDto> {
    return this.statisticsService.getStatistics(searchProvidersDto)
  }
}