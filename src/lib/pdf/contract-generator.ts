import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type {
  Contract,
  ContractType,
  SimplifiedSchedule,
  WorkTime
} from '@/types/contract';

interface CompanyData {
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  ice?: string;
  rc?: string;
}

const DEFAULT_COMPANY: CompanyData = {
  name: 'SIRH COMPANY',
  address: '123 Avenue Mohammed V',
  city: 'Casablanca 20000, Maroc',
  phone: '+212 5 22 XX XX XX',
  email: 'contact@sirh-company.ma',
  ice: 'ICE000123456789',
  rc: 'RC 12345'
};

export class ContractPDFGenerator {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margins = { top: 20, left: 20, right: 20, bottom: 20 };
  private currentY: number = 20;

  constructor() {
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
  }

  private drawHeader(company: CompanyData = DEFAULT_COMPANY) {
    const { doc, pageWidth, margins } = this;

    // Company name
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(company.name, margins.left, margins.top);

    // Company details
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    let yPos = margins.top + 6;
    doc.text(company.address, margins.left, yPos);
    yPos += 4;
    doc.text(company.city, margins.left, yPos);
    yPos += 4;
    doc.text(
      `Tél: ${company.phone} | Email: ${company.email}`,
      margins.left,
      yPos
    );

    if (company.ice || company.rc) {
      yPos += 4;
      const details = [];
      if (company.ice) details.push(`ICE: ${company.ice}`);
      if (company.rc) details.push(`RC: ${company.rc}`);
      doc.text(details.join(' | '), margins.left, yPos);
    }

    // Horizontal line
    yPos += 6;
    doc.setLineWidth(0.5);
    doc.line(margins.left, yPos, pageWidth - margins.right, yPos);

    return yPos + 10;
  }

  private drawFooter(contractNumber: string, dateGeneration: string) {
    const { doc, pageWidth, pageHeight, margins } = this;
    const yPos = pageHeight - margins.bottom - 10;

    doc.setLineWidth(0.3);
    doc.line(margins.left, yPos, pageWidth - margins.right, yPos);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Contrat N° ${contractNumber} - Généré le ${dateGeneration}`,
      pageWidth / 2,
      yPos + 5,
      { align: 'center' }
    );

    doc.setTextColor(0, 0, 0);
  }

  private formatDate(date: string | null | undefined): string {
    if (!date) return 'N/A';
    try {
      return format(new Date(date), 'dd MMMM yyyy', { locale: fr });
    } catch {
      return date;
    }
  }

  private formatCurrency(amount: number, currency: string = 'MAD'): string {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  private addText(
    text: string,
    fontSize: number = 11,
    style: 'normal' | 'bold' = 'normal',
    indent: number = 0
  ) {
    const { doc, margins, pageWidth } = this;
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', style);

    const maxWidth = pageWidth - margins.left - margins.right - indent;
    const lines = doc.splitTextToSize(text, maxWidth);

    lines.forEach((line: string) => {
      if (this.currentY > this.pageHeight - margins.bottom - 20) {
        doc.addPage();
        this.currentY = margins.top + 10;
      }
      doc.text(line, margins.left + indent, this.currentY);
      this.currentY += fontSize * 0.35 + 2;
    });
  }

  private addSpace(space: number = 5) {
    this.currentY += space;
  }

  private addTitle(title: string) {
    this.addSpace(10);
    this.addText(title, 14, 'bold');
    this.addSpace(5);
  }

  private addSection(title: string, content: string) {
    this.addText(title, 11, 'bold');
    this.addSpace(2);
    this.addText(content, 11, 'normal');
    this.addSpace(5);
  }

  private getContractTypeLabel(type: ContractType): string {
    const labels: Record<string, string> = {
      CDI: 'Contrat à Durée Indéterminée (CDI)',
      CDD: 'Contrat à Durée Déterminée (CDD)',
      CDD_Saisonnier: 'CDD Saisonnier',
      CDD_Temporaire: 'CDD Temporaire',
      ANAPEC: 'Contrat ANAPEC',
      SIVP: 'Contrat SIVP',
      TAHIL: 'Contrat TAHIL',
      Apprentissage: "Contrat d'Apprentissage",
      Stage_PFE: 'Convention de Stage (PFE)',
      Stage_Initiation: 'Convention de Stage (Initiation)',
      Interim: 'Contrat de Travail Temporaire (Intérim)',
      Teletravail: 'Contrat de Télétravail',
      Freelance: 'Contrat Freelance',
      Consultance: 'Contrat de Consultance'
    } as any;
    return labels[type] || String(type);
  }

  // Helpers to safely read from both new and legacy shapes
  private getNowString(): string {
    return this.formatDate(new Date().toISOString());
  }
  private getSignatureOrStartDate(
    contract: Contract & Record<string, any>
  ): string {
    return (
      contract?.dates?.signature_date ||
      contract?.dates?.start_date ||
      contract?.created_at ||
      null
    );
  }
  private getStartDate(
    contract: Contract & Record<string, any>
  ): string | null {
    return contract?.dates?.start_date || contract?.date_debut || null;
  }
  private getEndDate(contract: Contract & Record<string, any>): string | null {
    return contract?.dates?.end_date ?? contract?.date_fin ?? null;
  }
  private getEmployeeName(contract: Contract & Record<string, any>): string {
    const full =
      contract.employee_name ||
      (contract.employee
        ? `${contract.employee.firstName ?? ''} ${contract.employee.lastName ?? ''}`.trim()
        : '') ||
      '';
    return full ? full.toUpperCase() : 'N/A';
  }
  private getEmployeeMatricule(
    contract: Contract & Record<string, any>
  ): string | null {
    return contract.employee_matricule || contract.employee?.matricule || null;
  }
  private getJobTitle(contract: Contract & Record<string, any>): string {
    return (
      contract?.job?.title || contract?.job?.poste || contract?.poste || '—'
    );
  }
  private getDepartment(contract: Contract & Record<string, any>): string {
    return contract?.job?.department || contract?.departement || '—';
  }
  private getWorkScheduleText(
    contract: Contract & Record<string, any>
  ): string {
    const schedule: SimplifiedSchedule | WorkTime | undefined =
      (contract as any).schedule ?? (contract as any).work_time;

    const isSimplified = (s: any): s is SimplifiedSchedule =>
      !!s &&
      ('schedule_type' in s || 'start_time' in s || 'hours_per_week' in s);

    if (isSimplified(schedule)) {
      const parts: string[] = [];
      if (schedule.schedule_type) parts.push(`Type: ${schedule.schedule_type}`);
      if (schedule.shift_work) parts.push(`Shift: ${schedule.shift_work}`);
      if (schedule.start_time && schedule.end_time)
        parts.push(`Heures: ${schedule.start_time} - ${schedule.end_time}`);
      if (schedule.hours_per_day) parts.push(`${schedule.hours_per_day}h/jour`);
      if (schedule.days_per_week)
        parts.push(`${schedule.days_per_week} j/semaine`);
      if (schedule.hours_per_week)
        parts.push(`${schedule.hours_per_week} h/semaine`);
      if (schedule.annual_leave_days)
        parts.push(`Congés annuels: ${schedule.annual_leave_days} j/an`);
      return parts.length
        ? parts.join(' | ')
        : 'Organisation du travail selon les besoins du service';
    }

    if (schedule) {
      const wt = schedule as WorkTime;
      const parts: string[] = [];
      if (wt.work_schedule) parts.push(`Horaire: ${wt.work_schedule}`);
      if (wt.weekly_hours) parts.push(`Hebdo: ${wt.weekly_hours}h`);
      if (wt.daily_hours) parts.push(`Quotidien: ${wt.daily_hours}h`);
      if (wt.annual_leave_days)
        parts.push(`Congés: ${wt.annual_leave_days} j/an`);
      return parts.length
        ? parts.join(' | ')
        : 'Organisation du travail selon les besoins du service';
    }

    // Very legacy fallback
    return String(
      (contract as any).horaires ||
        'Organisation du travail selon les besoins du service'
    );
  }
  private getSalaryBrut(contract: Contract & Record<string, any>): number {
    return (
      contract?.salary?.salary_brut ??
      contract?.salary?.base_salary ??
      (contract as any).salaire_base ??
      0
    );
  }
  private getCurrency(contract: Contract & Record<string, any>): string {
    return (
      contract?.salary?.currency || (contract as any).salaire_devise || 'MAD'
    );
  }
  private getContractRef(contract: Contract & Record<string, any>): string {
    return String(
      contract.reference || contract.internal_reference || contract.id || 'N/A'
    );
  }

  generateCDI(
    contract: Contract,
    company: CompanyData = DEFAULT_COMPANY
  ): jsPDF {
    this.currentY = this.drawHeader(company);
    const { pageWidth, margins } = this;

    // Title (use type label)
    this.addTitle(this.getContractTypeLabel(contract.type));

    // Date and location
    const dateStr = this.formatDate(
      this.getSignatureOrStartDate(contract as any) || this.getNowString()
    );
    this.doc.setFontSize(11);
    this.doc.text(
      `Fait à ${company.city.split(',')[0]}, le ${dateStr}`,
      pageWidth - margins.right,
      this.currentY,
      {
        align: 'right'
      }
    );
    this.addSpace(10);

    // Entre les soussignés
    this.addText('ENTRE LES SOUSSIGNÉS :', 12, 'bold');
    this.addSpace(5);

    // L'employeur
    this.addText("L'EMPLOYEUR", 11, 'bold');
    this.addSpace(2);
    this.addText(`${company.name}`, 11, 'normal', 5);
    this.addText(
      `Adresse : ${company.address}, ${company.city}`,
      11,
      'normal',
      5
    );
    if (company.ice) this.addText(`ICE : ${company.ice}`, 11, 'normal', 5);
    if (company.rc) this.addText(`RC : ${company.rc}`, 11, 'normal', 5);
    this.addSpace(5);

    this.addText('Ci-après dénommé "l\'Employeur"', 11, 'normal');
    this.addSpace(8);

    this.addText('ET', 11, 'bold');
    this.addSpace(8);

    // L'employé
    this.addText('LE SALARIÉ', 11, 'bold');
    this.addSpace(2);
    const employeeName = this.getEmployeeName(contract as any);
    this.addText(`${employeeName}`, 11, 'normal', 5);
    const matricule = this.getEmployeeMatricule(contract as any);
    if (matricule) {
      this.addText(`Matricule : ${matricule}`, 11, 'normal', 5);
    }
    this.addSpace(5);

    this.addText('Ci-après dénommé "le Salarié"', 11, 'normal');
    this.addSpace(10);

    // IL A ÉTÉ CONVENU CE QUI SUIT
    this.addText('IL A ÉTÉ CONVENU ET ARRÊTÉ CE QUI SUIT :', 12, 'bold');
    this.addSpace(8);

    // Article 1 - Engagement
    this.addText('Article 1 - ENGAGEMENT', 11, 'bold');
    this.addSpace(3);
    const startD = this.getStartDate(contract as any);
    this.addText(
      `L'Employeur engage le Salarié qui accepte, en qualité de ${this.getJobTitle(contract as any)}, ` +
        `à compter du ${this.formatDate(startD || '')}.`,
      11,
      'normal'
    );
    this.addSpace(5);

    // Article 2 - Nature du contrat
    this.addText('Article 2 - NATURE DU CONTRAT', 11, 'bold');
    this.addSpace(3);
    this.addText(
      'Le présent contrat est conclu pour une durée indéterminée conformément aux dispositions du Code du Travail marocain.',
      11,
      'normal'
    );
    this.addSpace(5);

    // Article 3 - Fonctions
    this.addText('Article 3 - FONCTIONS', 11, 'bold');
    this.addSpace(3);
    this.addText(
      `Le Salarié exercera les fonctions de ${this.getJobTitle(contract as any)} au sein du département ${this.getDepartment(contract as any)}.`,
      11,
      'normal'
    );
    this.addSpace(5);

    // Article 4 - Lieu de travail
    this.addText('Article 4 - LIEU DE TRAVAIL', 11, 'bold');
    this.addSpace(3);
    this.addText(
      `Le Salarié exercera ses fonctions à : ${company.city}`,
      11,
      'normal'
    );
    this.addSpace(5);

    // Article 5 - Durée du travail
    this.addText('Article 5 - DURÉE DU TRAVAIL', 11, 'bold');
    this.addSpace(3);
    this.addText(this.getWorkScheduleText(contract as any), 11, 'normal');
    this.addSpace(5);

    // Article 6 - Rémunération
    this.addText('Article 6 - RÉMUNÉRATION', 11, 'bold');
    this.addSpace(3);
    const brut = this.getSalaryBrut(contract as any);
    const currency = this.getCurrency(contract as any);
    this.addText(
      `En contrepartie de son travail, le Salarié percevra un salaire mensuel brut de ${this.formatCurrency(
        brut,
        currency
      )}, payable à la fin de chaque mois.`,
      11,
      'normal'
    );
    this.addSpace(8);

    // Signatures
    this.addSpace(15);
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');

    const signatureY = this.currentY;
    // Signature employeur (gauche)
    this.doc.text("L'Employeur", margins.left + 20, signatureY);
    this.doc.text('Signature et Cachet', margins.left + 20, signatureY + 20);

    // Signature salarié (droite)
    this.doc.text('Le Salarié', pageWidth - margins.right - 40, signatureY);
    this.doc.text('Signature', pageWidth - margins.right - 40, signatureY + 20);

    this.drawFooter(
      `CONTRACT-${this.getContractRef(contract as any)}`,
      dateStr
    );

    return this.doc;
  }

  generateCDD(
    contract: Contract,
    company: CompanyData = DEFAULT_COMPANY
  ): jsPDF {
    this.currentY = this.drawHeader(company);
    const { pageWidth, margins } = this;

    // Title (use type label)
    this.addTitle(this.getContractTypeLabel(contract.type));

    // Date and location
    const dateStr = this.formatDate(
      this.getSignatureOrStartDate(contract as any) || this.getNowString()
    );
    this.doc.setFontSize(11);
    this.doc.text(
      `Fait à ${company.city.split(',')[0]}, le ${dateStr}`,
      pageWidth - margins.right,
      this.currentY,
      {
        align: 'right'
      }
    );
    this.addSpace(10);

    // Entre les soussignés
    this.addText('ENTRE LES SOUSSIGNÉS :', 12, 'bold');
    this.addSpace(5);

    // L'employeur
    this.addText("L'EMPLOYEUR", 11, 'bold');
    this.addSpace(2);
    this.addText(`${company.name}`, 11, 'normal', 5);
    this.addText(
      `Adresse : ${company.address}, ${company.city}`,
      11,
      'normal',
      5
    );
    if (company.ice) this.addText(`ICE : ${company.ice}`, 11, 'normal', 5);
    if (company.rc) this.addText(`RC : ${company.rc}`, 11, 'normal', 5);
    this.addSpace(5);

    this.addText('Ci-après dénommé "l\'Employeur"', 11, 'normal');
    this.addSpace(8);

    this.addText('ET', 11, 'bold');
    this.addSpace(8);

    // L'employé
    this.addText('LE SALARIÉ', 11, 'bold');
    this.addSpace(2);
    const employeeName = this.getEmployeeName(contract as any);
    this.addText(`${employeeName}`, 11, 'normal', 5);
    const matricule = this.getEmployeeMatricule(contract as any);
    if (matricule) {
      this.addText(`Matricule : ${matricule}`, 11, 'normal', 5);
    }
    this.addSpace(5);

    this.addText('Ci-après dénommé "le Salarié"', 11, 'normal');
    this.addSpace(10);

    // IL A ÉTÉ CONVENU CE QUI SUIT
    this.addText('IL A ÉTÉ CONVENU ET ARRÊTÉ CE QUI SUIT :', 12, 'bold');
    this.addSpace(8);

    // Article 1 - Engagement
    this.addText('Article 1 - ENGAGEMENT', 11, 'bold');
    this.addSpace(3);
    const startD = this.getStartDate(contract as any);
    const endD = this.getEndDate(contract as any);
    this.addText(
      `L'Employeur engage le Salarié qui accepte, en qualité de ${this.getJobTitle(contract as any)}, ` +
        `pour la période du ${this.formatDate(startD || '')} au ${this.formatDate(endD || '')}.`,
      11,
      'normal'
    );
    this.addSpace(5);

    // Article 2 - Nature du contrat
    this.addText('Article 2 - NATURE DU CONTRAT', 11, 'bold');
    this.addSpace(3);
    this.addText(
      'Le présent contrat est conclu pour une durée déterminée conformément aux dispositions ' +
        "de l'article 16 du Code du Travail marocain.",
      11,
      'normal'
    );
    this.addSpace(5);

    // Article 3 - Durée du contrat
    this.addText('Article 3 - DURÉE DU CONTRAT', 11, 'bold');
    this.addSpace(3);
    this.addText(
      `Le contrat prendra effet le ${this.formatDate(startD || '')} ` +
        `et prendra fin le ${this.formatDate(endD || '')}.`,
      11,
      'normal'
    );
    this.addSpace(5);

    // Article 4 - Fonctions
    this.addText('Article 4 - FONCTIONS', 11, 'bold');
    this.addSpace(3);
    this.addText(
      `Le Salarié exercera les fonctions de ${this.getJobTitle(contract as any)} au sein du département ${this.getDepartment(contract as any)}.`,
      11,
      'normal'
    );
    this.addSpace(5);

    // Article 5 - Lieu de travail
    this.addText('Article 5 - LIEU DE TRAVAIL', 11, 'bold');
    this.addSpace(3);
    this.addText(
      `Le Salarié exercera ses fonctions à : ${company.city}`,
      11,
      'normal'
    );
    this.addSpace(5);

    // Article 6 - Durée du travail
    this.addText('Article 6 - DURÉE DU TRAVAIL', 11, 'bold');
    this.addSpace(3);
    this.addText(this.getWorkScheduleText(contract as any), 11, 'normal');
    this.addSpace(5);

    // Article 7 - Rémunération
    this.addText('Article 7 - RÉMUNÉRATION', 11, 'bold');
    this.addSpace(3);
    const brut = this.getSalaryBrut(contract as any);
    const currency = this.getCurrency(contract as any);
    this.addText(
      `En contrepartie de son travail, le Salarié percevra un salaire mensuel brut de ${this.formatCurrency(
        brut,
        currency
      )}, payable à la fin de chaque mois.`,
      11,
      'normal'
    );
    this.addSpace(8);

    // Signatures
    this.addSpace(15);
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');

    const signatureY = this.currentY;
    // Signature employeur (gauche)
    this.doc.text("L'Employeur", margins.left + 20, signatureY);
    this.doc.text('Signature et Cachet', margins.left + 20, signatureY + 20);

    // Signature salarié (droite)
    this.doc.text('Le Salarié', pageWidth - margins.right - 40, signatureY);
    this.doc.text('Signature', pageWidth - margins.right - 40, signatureY + 20);

    this.drawFooter(
      `CONTRACT-${this.getContractRef(contract as any)}`,
      dateStr
    );

    return this.doc;
  }

  generate(contract: Contract, company?: CompanyData): jsPDF {
    if (contract.type === 'CDI') {
      return this.generateCDI(contract, company);
    } else {
      return this.generateCDD(contract, company);
    }
  }
}

export function generateContractPDF(contract: Contract): jsPDF {
  const generator = new ContractPDFGenerator();
  return generator.generate(contract);
}

export function downloadContractPDF(contract: Contract): void {
  const pdf = generateContractPDF(contract);
  const namePart =
    (contract as any).employee_name ||
    ((contract as any).employee
      ? `${(contract as any).employee.lastName}_${(contract as any).employee.firstName}`
      : null) ||
    'Unknown';
  const fileName = `Contrat_${contract.id}_${namePart}.pdf`;
  pdf.save(fileName);
}
