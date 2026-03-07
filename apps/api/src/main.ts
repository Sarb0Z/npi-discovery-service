import { ValidationPipe } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ApiExceptionFilter } from './common/filters/api-exception.filter'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

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

  await app.listen(process.env.PORT ?? 3000)
}

void bootstrap()
