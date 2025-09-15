import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';

import { PrismaService } from '@/database';

import { CreateClassTemplateDto, UpdateClassTemplateDto, ClassTemplateResponseDto } from './dto';

@Injectable()
export class ClassTemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createClassTemplateDto: CreateClassTemplateDto): Promise<ClassTemplateResponseDto> {
    const { name } = createClassTemplateDto;

    const existingTemplate = await this.prisma.classTemplate.findUnique({
      where: { name },
    });

    if (existingTemplate) {
      throw new ConflictException('Class template with this name already exists');
    }

    const classTemplate = await this.prisma.classTemplate.create({
      data: { name },
    });

    return this.mapToResponse(classTemplate);
  }

  async findAll(includeArchived: boolean = false): Promise<ClassTemplateResponseDto[]> {
    const where = includeArchived ? {} : { isActive: true };

    const classTemplates = await this.prisma.classTemplate.findMany({
      orderBy: { createdAt: 'desc' },
      where,
    });

    return classTemplates.map(template => this.mapToResponse(template));
  }

  async findOne(id: string): Promise<ClassTemplateResponseDto> {
    const classTemplate = await this.prisma.classTemplate.findUnique({
      where: { id },
    });

    if (!classTemplate) {
      throw new NotFoundException('Class template not found');
    }

    return this.mapToResponse(classTemplate);
  }

  async update(
    id: string,
    updateClassTemplateDto: UpdateClassTemplateDto,
  ): Promise<ClassTemplateResponseDto> {
    const classTemplate = await this.findOne(id);

    if (updateClassTemplateDto.name !== classTemplate.name) {
      const existingTemplate = await this.prisma.classTemplate.findUnique({
        where: { name: updateClassTemplateDto.name },
      });

      if (existingTemplate) {
        throw new ConflictException('Class template with this name already exists');
      }
    }

    const updatedClassTemplate = await this.prisma.classTemplate.update({
      data: updateClassTemplateDto,
      where: { id },
    });

    return this.mapToResponse(updatedClassTemplate);
  }

  async remove(id: string): Promise<ClassTemplateResponseDto> {
    await this.findOne(id);

    // Soft delete by setting isActive to false
    const deletedClassTemplate = await this.prisma.classTemplate.update({
      data: { isActive: false },
      where: { id },
    });

    return this.mapToResponse(deletedClassTemplate);
  }

  async restore(id: string): Promise<ClassTemplateResponseDto> {
    const classTemplate = await this.prisma.classTemplate.findUnique({
      where: { id },
    });

    if (!classTemplate) {
      throw new NotFoundException('Class template not found');
    }

    if (classTemplate.isActive) {
      throw new ConflictException('Class template is already active');
    }

    const restoredClassTemplate = await this.prisma.classTemplate.update({
      data: { isActive: true },
      where: { id },
    });

    return this.mapToResponse(restoredClassTemplate);
  }

  private mapToResponse(classTemplate: {
    id: string;
    name: string;
    isActive: boolean;
    createdAt: Date;
  }): ClassTemplateResponseDto {
    return {
      createdAt: classTemplate.createdAt,
      id: classTemplate.id,
      isActive: classTemplate.isActive,
      name: classTemplate.name,
    };
  }
}
