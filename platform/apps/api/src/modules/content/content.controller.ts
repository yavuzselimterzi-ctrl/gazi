import { Body, Controller, Get, Post } from '@nestjs/common';
import { ContentService } from './content.service';

class CreateContentDto {
  title: string;
  slug: string;
  body: string;
  category: string;
}

@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get()
  async list() {
    return this.contentService.list();
  }

  @Post()
  async create(@Body() body: CreateContentDto) {
    return this.contentService.create(body);
  }
}
