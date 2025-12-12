import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  GraduationCap,
  Layers,
  Award,
  Plus,
  Edit,
  Trash2,
  Building2,
  FileText
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { AnimatedTabContent } from '../components';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { DocumentUploadSection, DocumentItem } from './DocumentUploadSection';

// Skill level indicator component
const SkillLevelBar: React.FC<{ level: number }> = ({ level }) => (
  <div className='flex items-center gap-1'>
    {Array.from({ length: 5 }, (_, i) => (
      <div
        key={i}
        className={cn(
          'h-1.5 w-6 rounded-full transition-all',
          i < level ? 'bg-primary' : 'bg-muted'
        )}
      />
    ))}
  </div>
);

interface SkillsTabProps {
  active: boolean;
  education?: any[];
  skills?: any[];
  certifications?: any[];
  onAddEducation: () => void;
  onEditEducation: (index: number) => void;
  onDeleteEducation: (index: number) => void;
  onAddSkill: () => void;
  onEditSkill: (index: number) => void;
  onDeleteSkill: (index: number) => void;
  onAddCertification: () => void;
  onEditCertification: (index: number) => void;
  onDeleteCertification: (index: number) => void;
  documents?: DocumentItem[];
  onAddDocument?: (
    documentType: 'cin' | 'certificate' | 'diploma' | 'experience' | 'other'
  ) => void;
  onEditDocument?: (index: number) => void;
  onDeleteDocument?: (index: number) => void;
  onPreviewDocument?: (doc: DocumentItem) => void;
}

export const SkillsTab: React.FC<SkillsTabProps> = ({
  active,
  education = [],
  skills = [],
  certifications = [],
  onAddEducation,
  onEditEducation,
  onDeleteEducation,
  onAddSkill,
  onEditSkill,
  onDeleteSkill,
  onAddCertification,
  onEditCertification,
  onDeleteCertification
}) => {
  const { t } = useLanguage();

  const formatDate = (date?: string) => {
    if (!date) return '—';
    try {
      return format(new Date(date), 'dd MMM yyyy', { locale: fr });
    } catch {
      return date;
    }
  };

  return (
    <AnimatedTabContent active={active}>
      <div className='space-y-4'>
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
          {/* Education */}
          <Card className='space-y-4 border-l-4 border-l-indigo-500 p-6'>
            <div className='mb-4 flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100'>
                  <GraduationCap className='h-5 w-5 text-indigo-600' />
                </div>
                <div>
                  <h3 className='text-lg font-semibold'>
                    {t('employeeDetails.sections.education')}
                  </h3>
                  <p className='text-muted-foreground text-xs'>
                    Parcours académique
                  </p>
                </div>
              </div>
              <Button
                variant='outline'
                size='sm'
                className='gap-2'
                onClick={onAddEducation}
              >
                <Plus className='h-4 w-4' />
                {t('common.add')}
              </Button>
            </div>
            {education.length ? (
              <div className='space-y-3'>
                {education.map((e, i) => (
                  <div
                    key={i}
                    className='bg-muted/30 space-y-2 rounded-lg border p-4 transition-shadow hover:shadow-md'
                  >
                    <div className='flex items-start justify-between gap-2'>
                      <div className='text-sm font-medium'>{e.level}</div>
                      <div className='flex items-center gap-2'>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => onEditEducation(i)}
                        >
                          <Edit className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => onDeleteEducation(i)}
                        >
                          <Trash2 className='text-destructive h-4 w-4' />
                        </Button>
                        {e.year && (
                          <Badge variant='secondary' className='text-xs'>
                            {e.year}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {e.diploma && (
                      <p className='text-muted-foreground text-sm'>
                        {e.diploma}
                      </p>
                    )}
                    {e.institution && (
                      <p className='text-muted-foreground flex items-center gap-1 text-xs'>
                        <Building2 className='h-3 w-3' />
                        {e.institution}
                      </p>
                    )}
                    {e.documents && e.documents.length > 0 && (
                      <div className='mt-2 border-t pt-2'>
                        <div className='mb-1 flex items-center gap-2'>
                          <FileText className='text-muted-foreground h-3 w-3' />
                          <span className='text-xs font-medium'>
                            Documents ({e.documents.length})
                          </span>
                        </div>
                        <div className='flex flex-wrap gap-1'>
                          {e.documents.map((doc: any, docIdx: number) => (
                            <div
                              key={docIdx}
                              className='bg-muted flex items-center gap-1 rounded px-2 py-0.5 text-xs'
                            >
                              <FileText className='h-3 w-3' />
                              <span className='max-w-[100px] truncate'>
                                {doc.fileName}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className='text-muted-foreground py-8 text-center text-sm'>
                {t('employeeDetails.empty.noEducation')}
              </div>
            )}
          </Card>

          {/* Skills */}
          <Card className='space-y-4 border-l-4 border-l-cyan-500 p-6'>
            <div className='mb-4 flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-100'>
                  <Layers className='h-5 w-5 text-cyan-600' />
                </div>
                <div>
                  <h3 className='text-lg font-semibold'>
                    {t('employeeDetails.sections.skills')}
                  </h3>
                  <p className='text-muted-foreground text-xs'>
                    Compétences techniques
                  </p>
                </div>
              </div>
              <Button
                variant='outline'
                size='sm'
                className='gap-2'
                onClick={onAddSkill}
              >
                <Plus className='h-4 w-4' />
                {t('common.add')}
              </Button>
            </div>
            {skills.length ? (
              <div className='space-y-3'>
                {skills.map((s, i) => (
                  <div
                    key={i}
                    className='bg-muted/30 rounded-lg border p-3 transition-shadow hover:shadow-md'
                  >
                    <div className='mb-2 flex items-center justify-between'>
                      <span className='text-sm font-medium'>{s.name}</span>
                      <div className='flex items-center gap-2'>
                        <span className='text-muted-foreground text-xs'>
                          Niveau {s.level}/5
                        </span>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => onEditSkill(i)}
                        >
                          <Edit className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => onDeleteSkill(i)}
                        >
                          <Trash2 className='text-destructive h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                    <SkillLevelBar level={s.level} />
                  </div>
                ))}
              </div>
            ) : (
              <div className='text-muted-foreground py-8 text-center text-sm'>
                {t('employeeDetails.empty.noSkills')}
              </div>
            )}
          </Card>
        </div>

        {/* Certifications */}
        <Card className='border-l-primary space-y-4 border-l-4 p-6'>
          <div className='mb-4 flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg'>
                <Award className='text-primary h-5 w-5' />
              </div>
              <div>
                <h3 className='text-lg font-semibold'>
                  {t('employeeDetails.sections.certifications')}
                </h3>
                <p className='text-muted-foreground text-xs'>
                  Certifications professionnelles
                </p>
              </div>
            </div>
            <Button
              variant='outline'
              size='sm'
              className='gap-2'
              onClick={onAddCertification}
            >
              <Plus className='h-4 w-4' />
              {t('common.add')}
            </Button>
          </div>
          {certifications.length ? (
            <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
              {certifications.map((c, i) => (
                <div
                  key={i}
                  className='bg-muted/30 space-y-2 rounded-lg border p-4 transition-shadow hover:shadow-md'
                >
                  <div className='flex items-start justify-between gap-2'>
                    <div className='text-sm font-medium'>{c.name}</div>
                    <div className='flex items-center gap-2'>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => onEditCertification(i)}
                      >
                        <Edit className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => onDeleteCertification(i)}
                      >
                        <Trash2 className='text-destructive h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                  {c.issuer && (
                    <p className='text-muted-foreground text-xs'>
                      Émis par {c.issuer}
                    </p>
                  )}
                  {c.issueDate && (
                    <p className='text-muted-foreground text-xs'>
                      {formatDate(c.issueDate)}
                      {c.expirationDate &&
                        ` · Expire le ${formatDate(c.expirationDate)}`}
                    </p>
                  )}
                  {c.documents && c.documents.length > 0 && (
                    <div className='mt-2 border-t pt-2'>
                      <div className='mb-1 flex items-center gap-2'>
                        <FileText className='text-muted-foreground h-3 w-3' />
                        <span className='text-xs font-medium'>
                          Documents ({c.documents.length})
                        </span>
                      </div>
                      <div className='flex flex-wrap gap-1'>
                        {c.documents.map((doc: any, docIdx: number) => (
                          <div
                            key={docIdx}
                            className='bg-muted flex items-center gap-1 rounded px-2 py-0.5 text-xs'
                          >
                            <FileText className='h-3 w-3' />
                            <span className='max-w-[100px] truncate'>
                              {doc.fileName}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className='text-muted-foreground py-8 text-center text-sm'>
              {t('employeeDetails.empty.noCertifications')}
            </div>
          )}
        </Card>
      </div>
    </AnimatedTabContent>
  );
};
