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

  async remove(id: string): Promise<{
    data: ClassTemplateResponseDto;
    message: string;
    action: 'deleted' | 'deactivated';
  }> {
    const classTemplate = await this.findOne(id);

    const connectedClasses = await this.prisma.class.findMany({
      select: { id: true, level: true },
      where: { templateId: id },
    });

    if (connectedClasses.length > 0) {
      const deactivatedTemplate = await this.prisma.classTemplate.update({
        data: { isActive: false },
        where: { id },
      });

      return {
        action: 'deactivated',
        data: this.mapToResponse(deactivatedTemplate),
        message: `Class template ${classTemplate.name} has been deactivated because it has ${connectedClasses.length} connected class(es). To permanently delete it, please remove or reassign the classes first.`,
      };
    } else {
      await this.prisma.classTemplate.delete({
        where: { id },
      });

      return {
        action: 'deleted',
        data: this.mapToResponse(classTemplate),
        message: `Class template ${classTemplate.name} has been permanently deleted.`,
      };
    }
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
