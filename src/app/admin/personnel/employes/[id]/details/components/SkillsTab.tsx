import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Layers, Award, Plus, Edit, Trash2, Building2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { AnimatedTabContent } from '../components';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Skill level indicator component
const SkillLevelBar: React.FC<{ level: number }> = ({ level }) => (
  <div className="flex items-center gap-1">
    {Array.from({ length: 5 }, (_, i) => (
      <div
        key={i}
        className={cn(
          "h-1.5 w-6 rounded-full transition-all",
          i < level ? "bg-primary" : "bg-muted"
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Education */}
        <Card className="p-6 space-y-4 border-l-4 border-l-indigo-500">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
                <GraduationCap className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  {t('employeeDetails.sections.education')}
                </h3>
                <p className="text-xs text-muted-foreground">Parcours académique</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={onAddEducation}
            >
              <Plus className="h-4 w-4" />
              {t('common.add')}
            </Button>
          </div>
          {education.length ? (
            <div className="space-y-3">
              {education.map((e, i) => (
                <div
                  key={i}
                  className="p-4 rounded-lg border bg-muted/30 space-y-2 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-medium text-sm">{e.level}</div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEditEducation(i)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeleteEducation(i)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                      {e.year && (
                        <Badge variant="secondary" className="text-xs">
                          {e.year}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {e.diploma && (
                    <p className="text-sm text-muted-foreground">{e.diploma}</p>
                  )}
                  {e.institution && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {e.institution}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-sm text-muted-foreground">
              {t('employeeDetails.empty.noEducation')}
            </div>
          )}
        </Card>

        {/* Skills */}
        <Card className="p-6 space-y-4 border-l-4 border-l-cyan-500">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-100">
                <Layers className="h-5 w-5 text-cyan-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  {t('employeeDetails.sections.skills')}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Compétences techniques
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={onAddSkill}
            >
              <Plus className="h-4 w-4" />
              {t('common.add')}
            </Button>
          </div>
          {skills.length ? (
            <div className="space-y-3">
              {skills.map((s, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg border bg-muted/30 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{s.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        Niveau {s.level}/5
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEditSkill(i)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeleteSkill(i)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <SkillLevelBar level={s.level} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-sm text-muted-foreground">
              {t('employeeDetails.empty.noSkills')}
            </div>
          )}
        </Card>
      </div>

      {/* Certifications */}
      <Card className="p-6 space-y-4 border-l-4 border-l-primary">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Award className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">
                {t('employeeDetails.sections.certifications')}
              </h3>
              <p className="text-xs text-muted-foreground">
                Certifications professionnelles
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={onAddCertification}
          >
            <Plus className="h-4 w-4" />
            {t('common.add')}
          </Button>
        </div>
        {certifications.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {certifications.map((c, i) => (
              <div
                key={i}
                className="p-4 rounded-lg border bg-muted/30 space-y-2 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="font-medium text-sm">{c.name}</div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEditCertification(i)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteCertification(i)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                {c.issuer && (
                  <p className="text-xs text-muted-foreground">
                    Émis par {c.issuer}
                  </p>
                )}
                {c.issueDate && (
                  <p className="text-xs text-muted-foreground">
                    {formatDate(c.issueDate)}
                    {c.expirationDate && ` · Expire le ${formatDate(c.expirationDate)}`}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-sm text-muted-foreground">
            {t('employeeDetails.empty.noCertifications')}
          </div>
        )}
      </Card>
    </AnimatedTabContent>
  );
};

