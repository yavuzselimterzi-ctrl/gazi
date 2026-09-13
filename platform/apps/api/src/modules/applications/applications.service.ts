import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { z } from 'zod';

const committees = [
  'Adliye Encümeni',
  'Harbiye Encümeni',
  'Dahiliye Encümeni',
  'Hariciye Encümeni',
  'Maarif Encümeni',
  'Nafia Encümeni',
] as const;

const personSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  phone: z.string().regex(/^\+90 5\d{2} \d{3} \d{2} \d{2}$/),
  classLevel: z.enum(['Hazırlık', '9. Sınıf', '10. Sınıf', '11. Sınıf', '12. Sınıf']),
  experiences: z.string().trim().max(2000),
  preferences: z.array(z.enum(committees)).length(3),
});

const baseSchema = z.object({
  type: z.enum(['INDIVIDUAL', 'DELEGATION']),
  name: z.string().trim().min(2).max(120),
  tcIdentityNumber: z.string().regex(/^\d{11}$/),
  phone: z.string().regex(/^\+90 5\d{2} \d{3} \d{2} \d{2}$/),
  email: z.string().trim().email(),
  classLevel: z.enum(['Hazırlık', '9. Sınıf', '10. Sınıf', '11. Sınıf', '12. Sınıf']),
  birthDate: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/),
  school: z.string().trim().max(160).optional(),
  experiences: z.string().trim().max(3000).optional(),
  motivation: z.string().trim().refine((value) => value.split(/\s+/).filter(Boolean).length >= 150, 'Motivasyon en az 150 kelime olmalıdır.'),
  preferences: z.array(z.enum(committees)).length(3),
  additions: z.string().trim().max(3000).optional(),
  accuracyConsent: z.literal(true),
  kvkkConsent: z.literal(true),
  members: z.array(personSchema).optional(),
});

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: unknown) {
    const parsed = baseSchema.safeParse(input);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.issues.map((issue) => issue.message));
    }

    const data = parsed.data;
    const members = data.members ?? [];
    const delegationSize = data.type === 'DELEGATION' ? members.length + 1 : 1;

    if (data.preferences.some((preference, index) => data.preferences.indexOf(preference) !== index)) {
      throw new BadRequestException('Komisyon tercihleri birbirinden farklı olmalıdır.');
    }
    if (data.type === 'DELEGATION' && (delegationSize < 5 || delegationSize > 15)) {
      throw new BadRequestException('Delegasyon 5 ile 15 kişi arasında olmalıdır.');
    }
    if (data.type === 'INDIVIDUAL' && members.length > 0) {
      throw new BadRequestException('Bireysel başvuruda delege bulunamaz.');
    }

    members.forEach((member) => {
      if (new Set(member.preferences).size !== 3) {
        throw new BadRequestException('Her delegenin komisyon tercihleri farklı olmalıdır.');
      }
    });

    const year = new Date().getFullYear();
    const sequence = (await this.prisma.application.count({ where: { createdAt: { gte: new Date(`${year}-01-01`) } } })) + 1;
    const applicationNumber = `GAZI-${year}-${String(sequence).padStart(4, '0')}`;

    const application = await this.prisma.application.create({
      data: {
        applicationNumber,
        type: data.type,
        applicantName: data.name,
        email: data.email,
        phone: data.phone,
        tcIdentityNumber: data.tcIdentityNumber,
        classLevel: data.classLevel,
        birthDate: data.birthDate,
        school: data.school,
        experiences: data.experiences,
        motivation: data.motivation,
        preferences: data.preferences,
        additions: data.additions,
        delegationSize,
        delegationMembers: members,
        accuracyConsent: data.accuracyConsent,
        kvkkConsent: data.kvkkConsent,
      },
      select: { applicationNumber: true, type: true, delegationSize: true, status: true, createdAt: true },
    });

    return application;
  }
}