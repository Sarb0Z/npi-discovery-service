import { ValidationPipe } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ApiExceptionFilter } from './common/filters/api-exception.filter'

export async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const port = process.env.PORT ?? 3000
  const host = process.env.HOST ?? '0.0.0.0'

  app.enableCors()
  app.setGlobalPrefix('api')
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  )
  app.useGlobalFilters(new ApiExceptionFilter())

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Healthcare Provider Discovery Service')
    .setDescription('NPI discovery and provider statistics API')
    .setVersion('1.0.0')
    .build()
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig)

  SwaggerModule.setup('api/docs', app, swaggerDocument)

  await app.listen(port, host)
}

if (require.main === module) {
  void bootstrap()
}
