import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Contract, ContractType } from '@/types/contract';

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
      format: 'a4',
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
      currency: currency,
    }).format(amount);
  }

  private addText(text: string, fontSize: number = 11, style: 'normal' | 'bold' = 'normal', indent: number = 0) {
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
      Stage: 'Convention de Stage',
      'Intérim': 'Contrat de Travail Temporaire (Intérim)',
      Apprentissage: "Contrat d'Apprentissage",
      Autre: 'Autre type de contrat',
    };
    return labels[type] || type;
  }

  generateCDI(contract: Contract, company: CompanyData = DEFAULT_COMPANY): jsPDF {
    this.currentY = this.drawHeader(company);
    const { pageWidth, margins } = this;

    // Title (use type label)
    this.addTitle(this.getContractTypeLabel(contract.type_contrat));

    // Date and location
    const dateStr = this.formatDate(contract.created_at);
    this.doc.setFontSize(11);
    this.doc.text(`Fait à ${company.city.split(',')[0]}, le ${dateStr}`, pageWidth - margins.right, this.currentY, {
      align: 'right',
    });
    this.addSpace(10);

    // Entre les soussignés
    this.addText('ENTRE LES SOUSSIGNÉS :', 12, 'bold');
    this.addSpace(5);

    // L'employeur
    this.addText("L'EMPLOYEUR", 11, 'bold');
    this.addSpace(2);
    this.addText(`${company.name}`, 11, 'normal', 5);
    this.addText(`Adresse : ${company.address}, ${company.city}`, 11, 'normal', 5);
    if (company.ice) this.addText(`ICE : ${company.ice}`, 11, 'normal', 5);
    if (company.rc) this.addText(`RC : ${company.rc}`, 11, 'normal', 5);
    this.addSpace(5);

    this.addText('Ci-après dénommé "l\'Employeur"', 11, 'normal');
    this.addSpace(8);

    this.addText('ET', 11, 'bold');
    this.addSpace(8);

    // L'employé
    this.addText("LE SALARIÉ", 11, 'bold');
    this.addSpace(2);
    const employeeName = contract.employee
      ? `${contract.employee.firstName} ${contract.employee.lastName}`.toUpperCase()
      : 'N/A';
    this.addText(`${employeeName}`, 11, 'normal', 5);
    if (contract.employee?.matricule) {
      this.addText(`Matricule : ${contract.employee.matricule}`, 11, 'normal', 5);
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
    this.addText(
      `L'Employeur engage le Salarié qui accepte, en qualité de ${contract.poste}, ` +
        `à compter du ${this.formatDate(contract.date_debut)}.`,
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
      `Le Salarié exercera les fonctions de ${contract.poste} au sein du département ${contract.departement}.`,
      11,
      'normal'
    );
    this.addSpace(5);

    // Article 4 - Lieu de travail
    this.addText('Article 4 - LIEU DE TRAVAIL', 11, 'bold');
    this.addSpace(3);
    this.addText(`Le Salarié exercera ses fonctions à : ${company.city}`, 11, 'normal');
    this.addSpace(5);

    // Article 5 - Durée du travail
    this.addText('Article 5 - DURÉE DU TRAVAIL', 11, 'bold');
    this.addSpace(3);
    this.addText(`${contract.horaires}`, 11, 'normal');
    this.addSpace(5);

    // Article 6 - Rémunération
    this.addText('Article 6 - RÉMUNÉRATION', 11, 'bold');
    this.addSpace(3);
    this.addText(
      `En contrepartie de son travail, le Salarié percevra un salaire mensuel brut de ${this.formatCurrency(
        contract.salaire_base,
        contract.salaire_devise
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
    this.doc.text('L\'Employeur', margins.left + 20, signatureY);
    this.doc.text('Signature et Cachet', margins.left + 20, signatureY + 20);

    // Signature salarié (droite)
    this.doc.text('Le Salarié', pageWidth - margins.right - 40, signatureY);
    this.doc.text('Signature', pageWidth - margins.right - 40, signatureY + 20);

    this.drawFooter(`CONTRACT-${contract.id}`, dateStr);

    return this.doc;
  }

  generateCDD(contract: Contract, company: CompanyData = DEFAULT_COMPANY): jsPDF {
    this.currentY = this.drawHeader(company);
    const { pageWidth, margins } = this;

    // Title (use type label)
    this.addTitle(this.getContractTypeLabel(contract.type_contrat));

    // Date and location
    const dateStr = this.formatDate(contract.created_at);
    this.doc.setFontSize(11);
    this.doc.text(`Fait à ${company.city.split(',')[0]}, le ${dateStr}`, pageWidth - margins.right, this.currentY, {
      align: 'right',
    });
    this.addSpace(10);

    // Entre les soussignés
    this.addText('ENTRE LES SOUSSIGNÉS :', 12, 'bold');
    this.addSpace(5);

    // L'employeur
    this.addText("L'EMPLOYEUR", 11, 'bold');
    this.addSpace(2);
    this.addText(`${company.name}`, 11, 'normal', 5);
    this.addText(`Adresse : ${company.address}, ${company.city}`, 11, 'normal', 5);
    if (company.ice) this.addText(`ICE : ${company.ice}`, 11, 'normal', 5);
    if (company.rc) this.addText(`RC : ${company.rc}`, 11, 'normal', 5);
    this.addSpace(5);

    this.addText('Ci-après dénommé "l\'Employeur"', 11, 'normal');
    this.addSpace(8);

    this.addText('ET', 11, 'bold');
    this.addSpace(8);

    // L'employé
    this.addText("LE SALARIÉ", 11, 'bold');
    this.addSpace(2);
    const employeeName = contract.employee
      ? `${contract.employee.firstName} ${contract.employee.lastName}`.toUpperCase()
      : 'N/A';
    this.addText(`${employeeName}`, 11, 'normal', 5);
    if (contract.employee?.matricule) {
      this.addText(`Matricule : ${contract.employee.matricule}`, 11, 'normal', 5);
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
    this.addText(
      `L'Employeur engage le Salarié qui accepte, en qualité de ${contract.poste}, ` +
        `pour la période du ${this.formatDate(contract.date_debut)} au ${this.formatDate(contract.date_fin)}.`,
      11,
      'normal'
    );
    this.addSpace(5);

    // Article 2 - Nature du contrat
    this.addText('Article 2 - NATURE DU CONTRAT', 11, 'bold');
    this.addSpace(3);
    this.addText(
      'Le présent contrat est conclu pour une durée déterminée conformément aux dispositions ' +
        'de l\'article 16 du Code du Travail marocain.',
      11,
      'normal'
    );
    this.addSpace(5);

    // Article 3 - Durée du contrat
    this.addText('Article 3 - DURÉE DU CONTRAT', 11, 'bold');
    this.addSpace(3);
    this.addText(
      `Le contrat prendra effet le ${this.formatDate(contract.date_debut)} ` +
        `et prendra fin le ${this.formatDate(contract.date_fin)}.`,
      11,
      'normal'
    );
    this.addSpace(5);

    // Article 4 - Fonctions
    this.addText('Article 4 - FONCTIONS', 11, 'bold');
    this.addSpace(3);
    this.addText(
      `Le Salarié exercera les fonctions de ${contract.poste} au sein du département ${contract.departement}.`,
      11,
      'normal'
    );
    this.addSpace(5);

    // Article 5 - Lieu de travail
    this.addText('Article 5 - LIEU DE TRAVAIL', 11, 'bold');
    this.addSpace(3);
    this.addText(`Le Salarié exercera ses fonctions à : ${company.city}`, 11, 'normal');
    this.addSpace(5);

    // Article 6 - Durée du travail
    this.addText('Article 6 - DURÉE DU TRAVAIL', 11, 'bold');
    this.addSpace(3);
    this.addText(`${contract.horaires}`, 11, 'normal');
    this.addSpace(5);

    // Article 7 - Rémunération
    this.addText('Article 7 - RÉMUNÉRATION', 11, 'bold');
    this.addSpace(3);
    this.addText(
      `En contrepartie de son travail, le Salarié percevra un salaire mensuel brut de ${this.formatCurrency(
        contract.salaire_base,
        contract.salaire_devise
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
    this.doc.text('L\'Employeur', margins.left + 20, signatureY);
    this.doc.text('Signature et Cachet', margins.left + 20, signatureY + 20);

    // Signature salarié (droite)
    this.doc.text('Le Salarié', pageWidth - margins.right - 40, signatureY);
    this.doc.text('Signature', pageWidth - margins.right - 40, signatureY + 20);

    this.drawFooter(`CONTRACT-${contract.id}`, dateStr);

    return this.doc;
  }

  generate(contract: Contract, company?: CompanyData): jsPDF {
    if (contract.type_contrat === 'CDI') {
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
  const employeeName = contract.employee
    ? `${contract.employee.lastName}_${contract.employee.firstName}`
    : 'Unknown';
  const fileName = `Contrat_${contract.id}_${employeeName}.pdf`;
  pdf.save(fileName);
}
