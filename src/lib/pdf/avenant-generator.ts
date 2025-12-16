import { jsPDF } from 'jspdf';

interface Avenant {
  id: string;
  contract_id: string;
  numero: number;
  date: string;
  objet: string;
  description?: string;
  motif?: string;
  status: string;
  type_modification?: string;
  changes?: Record<string, any>;
  created_at: string;
  created_by: string;
}

interface Contract {
  reference: string;
  employee_name: string;
  employee_matricule: string;
  type: string;
  dates: {
    start_date: string;
  };
  job?: {
    poste?: string;
    department?: string;
  };
  salary?: {
    salary_brut?: number;
    salary_net?: number;
  };
}

export async function generateAvenantPDF(
  contract: Contract,
  avenant: Avenant
): Promise<Blob> {
  const doc = new jsPDF();
  let yPos = 20;

  // Helper functions
  const addText = (
    text: string,
    size: number = 12,
    style: 'normal' | 'bold' = 'normal'
  ) => {
    doc.setFontSize(size);
    doc.setFont('helvetica', style);
    doc.text(text, 20, yPos);
    yPos += size / 2 + 2;
  };

  const addLine = () => {
    doc.line(20, yPos, 190, yPos);
    yPos += 5;
  };

  const addSpace = (space: number = 5) => {
    yPos += space;
  };

  const checkPageBreak = () => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
  };

  // En-tête
  doc.setFillColor(41, 128, 185);
  doc.rect(0, 0, 210, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('AVENANT AU CONTRAT DE TRAVAIL', 105, 15, { align: 'center' });

  doc.setFontSize(14);
  doc.text(`Avenant N°${avenant.numero}`, 105, 25, { align: 'center' });

  doc.setFontSize(12);
  doc.text(`Référence Contrat: ${contract.reference}`, 105, 33, {
    align: 'center'
  });

  doc.setTextColor(0, 0, 0);
  yPos = 50;

  // Informations du contrat original
  addText('CONTRAT ORIGINAL', 14, 'bold');
  addSpace(3);

  doc.setFontSize(11);
  doc.text(`Employé: ${contract.employee_name}`, 25, yPos);
  yPos += 6;
  doc.text(`Matricule: ${contract.employee_matricule}`, 25, yPos);
  yPos += 6;
  doc.text(`Type de contrat: ${contract.type}`, 25, yPos);
  yPos += 6;
  doc.text(
    `Date de début: ${new Date(contract.dates.start_date).toLocaleDateString('fr-FR')}`,
    25,
    yPos
  );
  yPos += 10;

  checkPageBreak();

  // Informations de l'avenant
  addLine();
  addText("INFORMATIONS DE L'AVENANT", 14, 'bold');
  addSpace(3);

  doc.setFontSize(11);
  doc.text(
    `Date d'effet: ${new Date(avenant.date).toLocaleDateString('fr-FR')}`,
    25,
    yPos
  );
  yPos += 6;
  doc.text(`Objet: ${avenant.objet}`, 25, yPos);
  yPos += 6;
  doc.text(`Statut: ${avenant.status}`, 25, yPos);
  yPos += 6;
  doc.text(
    `Créé le: ${new Date(avenant.created_at).toLocaleDateString('fr-FR')}`,
    25,
    yPos
  );
  yPos += 10;

  checkPageBreak();

  // Motif
  if (avenant.motif) {
    addLine();
    addText('MOTIF DE LA MODIFICATION', 14, 'bold');
    addSpace(3);

    doc.setFontSize(11);
    const motifLines = doc.splitTextToSize(avenant.motif, 170);
    motifLines.forEach((line: string) => {
      checkPageBreak();
      doc.text(line, 25, yPos);
      yPos += 5;
    });
    yPos += 5;
  }

  checkPageBreak();

  // Modifications détaillées
  if (avenant.changes) {
    addLine();
    addText('MODIFICATIONS APPORTÉES', 14, 'bold');
    addSpace(3);

    // Modifications de salaire
    if (avenant.changes.salary) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Rémunération:', 25, yPos);
      yPos += 7;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');

      // Avant
      if (avenant.changes.salary.avant) {
        doc.setTextColor(200, 0, 0);
        doc.text('Avant:', 30, yPos);
        yPos += 5;
        doc.setTextColor(0, 0, 0);

        if (avenant.changes.salary.avant.salary_brut) {
          doc.text(
            `  - Salaire brut: ${avenant.changes.salary.avant.salary_brut} MAD`,
            35,
            yPos
          );
          yPos += 5;
        }
        if (avenant.changes.salary.avant.salary_net) {
          doc.text(
            `  - Salaire net: ${avenant.changes.salary.avant.salary_net} MAD`,
            35,
            yPos
          );
          yPos += 5;
        }
        yPos += 3;
      }

      // Après
      if (avenant.changes.salary.apres) {
        doc.setTextColor(0, 150, 0);
        doc.text('Après:', 30, yPos);
        yPos += 5;
        doc.setTextColor(0, 0, 0);

        if (avenant.changes.salary.apres.salary_brut) {
          doc.text(
            `  - Salaire brut: ${avenant.changes.salary.apres.salary_brut} MAD`,
            35,
            yPos
          );
          yPos += 5;
        }
        if (avenant.changes.salary.apres.salary_net) {
          doc.text(
            `  - Salaire net: ${avenant.changes.salary.apres.salary_net} MAD`,
            35,
            yPos
          );
          yPos += 5;
        }
      }

      yPos += 5;
      checkPageBreak();
    }

    // Modifications d'horaire
    if (avenant.changes.schedule) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Horaires de Travail:', 25, yPos);
      yPos += 7;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');

      // Avant
      if (avenant.changes.schedule.avant) {
        doc.setTextColor(200, 0, 0);
        doc.text('Avant:', 30, yPos);
        yPos += 5;
        doc.setTextColor(0, 0, 0);

        if (avenant.changes.schedule.avant.schedule_type) {
          doc.text(
            `  - Type: ${avenant.changes.schedule.avant.schedule_type}`,
            35,
            yPos
          );
          yPos += 5;
        }
        if (avenant.changes.schedule.avant.hours_per_week) {
          doc.text(
            `  - Heures/semaine: ${avenant.changes.schedule.avant.hours_per_week}h`,
            35,
            yPos
          );
          yPos += 5;
        }
        yPos += 3;
      }

      // Après
      if (avenant.changes.schedule.apres) {
        doc.setTextColor(0, 150, 0);
        doc.text('Après:', 30, yPos);
        yPos += 5;
        doc.setTextColor(0, 0, 0);

        if (avenant.changes.schedule.apres.schedule_type) {
          doc.text(
            `  - Type: ${avenant.changes.schedule.apres.schedule_type}`,
            35,
            yPos
          );
          yPos += 5;
        }
        if (avenant.changes.schedule.apres.hours_per_week) {
          doc.text(
            `  - Heures/semaine: ${avenant.changes.schedule.apres.hours_per_week}h`,
            35,
            yPos
          );
          yPos += 5;
        }
      }

      yPos += 5;
      checkPageBreak();
    }

    // Modifications de poste
    if (avenant.changes.job) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Poste et Fonction:', 25, yPos);
      yPos += 7;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');

      // Avant
      if (avenant.changes.job.avant) {
        doc.setTextColor(200, 0, 0);
        doc.text('Avant:', 30, yPos);
        yPos += 5;
        doc.setTextColor(0, 0, 0);

        if (avenant.changes.job.avant.poste) {
          doc.text(`  - Poste: ${avenant.changes.job.avant.poste}`, 35, yPos);
          yPos += 5;
        }
        if (avenant.changes.job.avant.department) {
          doc.text(
            `  - Département: ${avenant.changes.job.avant.department}`,
            35,
            yPos
          );
          yPos += 5;
        }
        yPos += 3;
      }

      // Après
      if (avenant.changes.job.apres) {
        doc.setTextColor(0, 150, 0);
        doc.text('Après:', 30, yPos);
        yPos += 5;
        doc.setTextColor(0, 0, 0);

        if (avenant.changes.job.apres.poste) {
          doc.text(`  - Poste: ${avenant.changes.job.apres.poste}`, 35, yPos);
          yPos += 5;
        }
        if (avenant.changes.job.apres.department) {
          doc.text(
            `  - Département: ${avenant.changes.job.apres.department}`,
            35,
            yPos
          );
          yPos += 5;
        }
      }

      yPos += 5;
      checkPageBreak();
    }
  }

  // Pied de page avec signatures
  doc.addPage();
  yPos = 20;

  addLine();
  addText('SIGNATURES', 14, 'bold');
  addSpace(10);

  doc.setFontSize(11);

  // Signature Employeur
  doc.text("L'Employeur", 30, yPos);
  yPos += 30;
  doc.line(30, yPos, 90, yPos);
  doc.text('Date et signature', 30, yPos + 5);

  // Signature Employé
  yPos -= 30;
  doc.text("L'Employé", 120, yPos);
  yPos += 30;
  doc.line(120, yPos, 180, yPos);
  doc.text('Date et signature', 120, yPos + 5);

  yPos += 20;

  // Mentions légales
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text('Fait à __________________, le __________________', 105, yPos, {
    align: 'center'
  });
  yPos += 5;
  doc.text('En deux exemplaires originaux', 105, yPos, { align: 'center' });

  // Générer le blob
  const pdfBlob = doc.output('blob');
  return pdfBlob;
}
