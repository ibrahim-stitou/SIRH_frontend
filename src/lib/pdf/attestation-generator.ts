import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { AttestationType } from '@/types/attestation';

interface EmployeeData {
  firstName: string;
  lastName: string;
  position: string;
  email: string;
  departmentId?: string;
  hireDate?: string;
  salaryBase?: number;
  cin?: string;
  birthDate?: string;
  nationality?: string;
}

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
  rc: 'RC 12345',
};

export class AttestationPDFGenerator {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margins = { top: 20, left: 20, right: 20, bottom: 20 };

  constructor() {
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
  }

  private drawHeader(company: CompanyData = DEFAULT_COMPANY) {
    const { doc, pageWidth, margins } = this;

    // Company name - bold and larger
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(company.name, margins.left, margins.top);

    // Company details - smaller
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    let yPos = margins.top + 6;
    doc.text(company.address, margins.left, yPos);
    yPos += 4;
    doc.text(company.city, margins.left, yPos);
    yPos += 4;
    doc.text(`Tél: ${company.phone} | Email: ${company.email}`, margins.left, yPos);

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

  private drawFooter(numeroAttestation: string, dateGeneration: string) {
    const { doc, pageWidth, pageHeight, margins } = this;
    const yPos = pageHeight - margins.bottom - 10;

    // Line
    doc.setLineWidth(0.3);
    doc.line(margins.left, yPos, pageWidth - margins.right, yPos);

    // Footer text
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Attestation N° ${numeroAttestation} - Générée le ${dateGeneration}`,
      pageWidth / 2,
      yPos + 5,
      { align: 'center' }
    );

    doc.setTextColor(0, 0, 0);
  }

  private formatDate(date: string | undefined): string {
    if (!date) return '';
    try {
      return format(new Date(date), 'dd MMMM yyyy', { locale: fr });
    } catch {
      return date;
    }
  }

  private calculateSeniority(hireDate: string | undefined): string {
    if (!hireDate) return '';

    const hire = new Date(hireDate);
    const now = new Date();
    const years = now.getFullYear() - hire.getFullYear();
    const months = now.getMonth() - hire.getMonth();

    let totalMonths = years * 12 + months;
    if (now.getDate() < hire.getDate()) {
      totalMonths--;
    }

    const finalYears = Math.floor(totalMonths / 12);
    const finalMonths = totalMonths % 12;

    if (finalYears > 0 && finalMonths > 0) {
      return `${finalYears} an${finalYears > 1 ? 's' : ''} et ${finalMonths} mois`;
    } else if (finalYears > 0) {
      return `${finalYears} an${finalYears > 1 ? 's' : ''}`;
    } else {
      return `${finalMonths} mois`;
    }
  }

  generateAttestationTravail(
    employee: EmployeeData,
    numeroAttestation: string,
    dateGeneration: string,
    company: CompanyData = DEFAULT_COMPANY
  ): jsPDF {
    let yPos = this.drawHeader(company);
    const { doc, pageWidth, margins } = this;

    // Title
    yPos += 15;
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('ATTESTATION DE TRAVAIL', pageWidth / 2, yPos, { align: 'center' });

    // Date and location
    yPos += 15;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const dateStr = this.formatDate(dateGeneration);
    doc.text(`${company.city.split(',')[0]}, le ${dateStr}`, pageWidth - margins.right, yPos, { align: 'right' });

    // Body
    yPos += 20;
    doc.setFontSize(12);
    const lineHeight = 7;

    const fullName = `${employee.firstName} ${employee.lastName}`.toUpperCase();
    const hireDate = this.formatDate(employee.hireDate);
    const seniority = this.calculateSeniority(employee.hireDate);

    const bodyText = [
      `Je soussigné, Directeur des Ressources Humaines de ${company.name}, certifie que :`,
      '',
      `Monsieur/Madame ${fullName}`,
      '',
      employee.cin ? `Titulaire de la CIN N° : ${employee.cin}` : '',
      employee.birthDate ? `Né(e) le : ${this.formatDate(employee.birthDate)}` : '',
      employee.nationality ? `De nationalité : ${employee.nationality}` : '',
      '',
      `Occupe le poste de : ${employee.position}`,
      '',
      `Au sein de notre entreprise depuis le : ${hireDate}`,
      '',
      seniority ? `Soit une ancienneté de : ${seniority}` : '',
      '',
      `Cette attestation est délivrée à l'intéressé(e) pour servir et valoir ce que de droit.`,
    ].filter(line => line !== '');

    bodyText.forEach(line => {
      if (line === '') {
        yPos += lineHeight / 2;
      } else {
        doc.text(line, margins.left, yPos);
        yPos += lineHeight;
      }
    });

    // Signature section
    yPos += 20;
    doc.setFont('helvetica', 'bold');
    doc.text('Le Directeur des Ressources Humaines', pageWidth - margins.right - 60, yPos);
    yPos += 25;
    doc.text('Signature et Cachet', pageWidth - margins.right - 60, yPos);

    this.drawFooter(numeroAttestation, dateStr);

    return doc;
  }

  generateAttestationSalaire(
    employee: EmployeeData,
    numeroAttestation: string,
    dateGeneration: string,
    company: CompanyData = DEFAULT_COMPANY
  ): jsPDF {
    let yPos = this.drawHeader(company);
    const { doc, pageWidth, margins } = this;

    // Title
    yPos += 15;
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('ATTESTATION DE SALAIRE', pageWidth / 2, yPos, { align: 'center' });

    // Date and location
    yPos += 15;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const dateStr = this.formatDate(dateGeneration);
    doc.text(`${company.city.split(',')[0]}, le ${dateStr}`, pageWidth - margins.right, yPos, { align: 'right' });

    // Body
    yPos += 20;
    doc.setFontSize(12);
    const lineHeight = 7;

    const fullName = `${employee.firstName} ${employee.lastName}`.toUpperCase();
    const hireDate = this.formatDate(employee.hireDate);
    const salaryFormatted = employee.salaryBase
      ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(employee.salaryBase)
      : 'N/A';

    const bodyText = [
      `Je soussigné, Directeur des Ressources Humaines de ${company.name}, certifie que :`,
      '',
      `Monsieur/Madame ${fullName}`,
      '',
      employee.cin ? `Titulaire de la CIN N° : ${employee.cin}` : '',
      '',
      `Occupe le poste de : ${employee.position}`,
      '',
      `Au sein de notre entreprise depuis le : ${hireDate}`,
      '',
      `Perçoit un salaire mensuel brut de : ${salaryFormatted}`,
      '',
      `Cette attestation est délivrée à l'intéressé(e) pour servir et valoir ce que de droit.`,
    ].filter(line => line !== '');

    bodyText.forEach(line => {
      if (line === '') {
        yPos += lineHeight / 2;
      } else {
        doc.text(line, margins.left, yPos);
        yPos += lineHeight;
      }
    });

    // Signature section
    yPos += 20;
    doc.setFont('helvetica', 'bold');
    doc.text('Le Directeur des Ressources Humaines', pageWidth - margins.right - 60, yPos);
    yPos += 25;
    doc.text('Signature et Cachet', pageWidth - margins.right - 60, yPos);

    this.drawFooter(numeroAttestation, dateStr);

    return doc;
  }

  generateAttestationTravailSalaire(
    employee: EmployeeData,
    numeroAttestation: string,
    dateGeneration: string,
    company: CompanyData = DEFAULT_COMPANY
  ): jsPDF {
    let yPos = this.drawHeader(company);
    const { doc, pageWidth, margins } = this;

    // Title
    yPos += 15;
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('ATTESTATION DE TRAVAIL ET DE SALAIRE', pageWidth / 2, yPos, { align: 'center' });

    // Date and location
    yPos += 15;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const dateStr = this.formatDate(dateGeneration);
    doc.text(`${company.city.split(',')[0]}, le ${dateStr}`, pageWidth - margins.right, yPos, { align: 'right' });

    // Body
    yPos += 20;
    doc.setFontSize(12);
    const lineHeight = 7;

    const fullName = `${employee.firstName} ${employee.lastName}`.toUpperCase();
    const hireDate = this.formatDate(employee.hireDate);
    const seniority = this.calculateSeniority(employee.hireDate);
    const salaryFormatted = employee.salaryBase
      ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(employee.salaryBase)
      : 'N/A';

    const bodyText = [
      `Je soussigné, Directeur des Ressources Humaines de ${company.name}, certifie que :`,
      '',
      `Monsieur/Madame ${fullName}`,
      '',
      employee.cin ? `Titulaire de la CIN N° : ${employee.cin}` : '',
      employee.birthDate ? `Né(e) le : ${this.formatDate(employee.birthDate)}` : '',
      employee.nationality ? `De nationalité : ${employee.nationality}` : '',
      '',
      `Occupe le poste de : ${employee.position}`,
      '',
      `Au sein de notre entreprise depuis le : ${hireDate}`,
      '',
      seniority ? `Soit une ancienneté de : ${seniority}` : '',
      '',
      `Perçoit un salaire mensuel brut de : ${salaryFormatted}`,
      '',
      `Cette attestation est délivrée à l'intéressé(e) pour servir et valoir ce que de droit.`,
    ].filter(line => line !== '');

    bodyText.forEach(line => {
      if (line === '') {
        yPos += lineHeight / 2;
      } else {
        doc.text(line, margins.left, yPos);
        yPos += lineHeight;
      }
    });

    // Signature section
    yPos += 20;
    doc.setFont('helvetica', 'bold');
    doc.text('Le Directeur des Ressources Humaines', pageWidth - margins.right - 60, yPos);
    yPos += 25;
    doc.text('Signature et Cachet', pageWidth - margins.right - 60, yPos);

    this.drawFooter(numeroAttestation, dateStr);

    return doc;
  }

  generateAttestationStage(
    employee: EmployeeData,
    numeroAttestation: string,
    dateGeneration: string,
    stageStartDate: string,
    stageEndDate: string,
    company: CompanyData = DEFAULT_COMPANY
  ): jsPDF {
    let yPos = this.drawHeader(company);
    const { doc, pageWidth, margins } = this;

    // Title
    yPos += 15;
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('ATTESTATION DE STAGE', pageWidth / 2, yPos, { align: 'center' });

    // Date and location
    yPos += 15;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const dateStr = this.formatDate(dateGeneration);
    doc.text(`${company.city.split(',')[0]}, le ${dateStr}`, pageWidth - margins.right, yPos, { align: 'right' });

    // Body
    yPos += 20;
    doc.setFontSize(12);
    const lineHeight = 7;

    const fullName = `${employee.firstName} ${employee.lastName}`.toUpperCase();
    const startDate = this.formatDate(stageStartDate);
    const endDate = this.formatDate(stageEndDate);

    const bodyText = [
      `Je soussigné, Directeur des Ressources Humaines de ${company.name}, certifie que :`,
      '',
      `Monsieur/Madame ${fullName}`,
      '',
      employee.cin ? `Titulaire de la CIN N° : ${employee.cin}` : '',
      '',
      `A effectué un stage au sein de notre entreprise en tant que : ${employee.position}`,
      '',
      `Du ${startDate} au ${endDate}`,
      '',
      `Durant cette période, l'intéressé(e) a fait preuve de sérieux et de compétence dans l'accomplissement`,
      `de ses missions.`,
      '',
      `Cette attestation est délivrée à l'intéressé(e) pour servir et valoir ce que de droit.`,
    ].filter(line => line !== '');

    bodyText.forEach(line => {
      if (line === '') {
        yPos += lineHeight / 2;
      } else {
        doc.text(line, margins.left, yPos);
        yPos += lineHeight;
      }
    });

    // Signature section
    yPos += 20;
    doc.setFont('helvetica', 'bold');
    doc.text('Le Directeur des Ressources Humaines', pageWidth - margins.right - 60, yPos);
    yPos += 25;
    doc.text('Signature et Cachet', pageWidth - margins.right - 60, yPos);

    this.drawFooter(numeroAttestation, dateStr);

    return doc;
  }

  generate(
    type: AttestationType,
    employee: EmployeeData,
    numeroAttestation: string,
    dateGeneration: string,
    additionalData?: any,
    company?: CompanyData
  ): jsPDF {
    switch (type) {
      case 'travail':
        return this.generateAttestationTravail(employee, numeroAttestation, dateGeneration, company);
      case 'salaire':
        return this.generateAttestationSalaire(employee, numeroAttestation, dateGeneration, company);
      case 'travail_salaire':
        return this.generateAttestationTravailSalaire(employee, numeroAttestation, dateGeneration, company);
      case 'stage':
        return this.generateAttestationStage(
          employee,
          numeroAttestation,
          dateGeneration,
          additionalData?.stageStartDate || employee.hireDate || '',
          additionalData?.stageEndDate || new Date().toISOString().split('T')[0],
          company
        );
      default:
        return this.generateAttestationTravail(employee, numeroAttestation, dateGeneration, company);
    }
  }
}

export function generateAttestationPDF(
  type: AttestationType,
  employee: EmployeeData,
  numeroAttestation: string,
  dateGeneration: string,
  additionalData?: any
): jsPDF {
  const generator = new AttestationPDFGenerator();
  return generator.generate(type, employee, numeroAttestation, dateGeneration, additionalData);
}

export function downloadAttestationPDF(
  type: AttestationType,
  employee: EmployeeData,
  numeroAttestation: string,
  dateGeneration: string,
  additionalData?: any
): void {
  const pdf = generateAttestationPDF(type, employee, numeroAttestation, dateGeneration, additionalData);
  const fileName = `${numeroAttestation}_${employee.lastName}_${employee.firstName}.pdf`;
  pdf.save(fileName);
}

