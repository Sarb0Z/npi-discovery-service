import { Controller, Get } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'

@Controller('health')
@ApiTags('health')
export class AppController {
  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiOkResponse({ description: 'Returns the service health status.' })
  getHealth(): { status: string } {
    return { status: 'ok' }
  }
}
