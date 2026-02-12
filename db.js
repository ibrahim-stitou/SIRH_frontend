module.exports = {
  users: require('./mock-data/users.json'),
  roles: require('./mock-data/roles.json'),
  sessions: require('./mock-data/sessions.json'),
  departments: require('./mock-data/departments.json'),
  locations: require('./mock-data/locations.json'),
  employees: require('./mock-data/employees.json'),
  hrEmployees: require('./mock-data/hrEmployees.json'),
  contracts: require('./mock-data/contracts.json'),
  leaves: require('./mock-data/leaves.json'),
  attendance: require('./mock-data/attendance.json'),
  payslips: require('./mock-data/payslips.json'),
  payrollAdjustments: require('./mock-data/payrollAdjustments.json'),
  evaluations: require('./mock-data/evaluations.json'),
  goals: require('./mock-data/goals.json'),
  announcements: require('./mock-data/announcements.json'),
  // Offres & Responsables: loaded from consolidated db.json
  offres: require('./mock-data/db.json').offres,
  Missions: require('./mock-data/db.json').Missions,
ProfilRecherche: require('./mock-data/db.json').ProfilRecherche,
OffreStatistiques: require('./mock-data/db.json').OffreStatistiques,
OffreDiffusions: require('./mock-data/db.json').OffreDiffusions,
candidatures: require('./mock-data/db.json').candidatures,
  responsables: require('./mock-data/db.json').responsables,
    offres: require('./mock-data/db.json').offres,
  responsables: require('./mock-data/db.json').responsables,
  Competences: require('./mock-data/db.json').Competences,
  PosteCompetences: require('./mock-data/db.json').PosteCompetences,
 CompetenceNiveaux: require('./mock-data/db.json').CompetenceNiveaux,
  systemSettings: require('./mock-data/systemSettings.json'),
  featureFlags: require('./mock-data/featureFlags.json'),
  auditLogs: require('./mock-data/auditLogs.json'),
  userMedia: require('./mock-data/userMedia.json'),
  attestationRequests: require('./mock-data/attestationRequests.json'),
  attestations: require('./mock-data/attestations.json'),
  avenants: require('./mock-data/avenants.json'),
  mutuelles: require('./mock-data/mutuelles.json'),
  groupMembers: require('./mock-data/groupMembers.json'),
  headquarters: require('./mock-data/headquarters.json'),
  groups: require('./mock-data/groups.json'),
  employeeHistory: require('./mock-data/employeeHistory.json'),
  movementTypes: require('./mock-data/movementTypes.json'),
  absenceTypes: require('./mock-data/absenceTypes.json'),
  absences: require('./mock-data/absences.json'),
  politiqueConges: require('./mock-data/politiqueConges.json'),
  congeCompteurs: require('./mock-data/congeCompteurs.json'),
  congeMouvements: require('./mock-data/congeMouvements.json'),
  pointages: require('./mock-data/pointages.json'),
  tableauPresence: require('./mock-data/tableauPresence.json'),
  tableauPresenceEmployees: require('./mock-data/tableauPresenceEmployees.json'),
  tableauPresenceDays: require('./mock-data/tableauPresenceDays.json'),
  periodePaie: require('./mock-data/periodePaie.json'),
  bulletinPaie: require('./mock-data/bulletinPaie.json'),
  rubriquePaie: require('./mock-data/rubriquePaie.json'),
  elementVariable: require('./mock-data/elementVariable.json'),
  avances: require('./mock-data/avances.json'),
  prets: require('./mock-data/prets.json'),
  notesFrais: require('./mock-data/notesFrais.json'),
  lignesFrais: require('./mock-data/lignesFrais.json'),
  accidentsTravail: require('./mock-data/accidentsTravail.json'),
  // Catalog des conditions de contrat
  contractConditionsCatalog: require('./mock-data/contract-conditions.json'),
  // Pivot many-to-many entre contrats et conditions
  contractConditions: require('./mock-data/contractConditions.json'),
  // Trial period acceptance criteria
  trialCriteriaCatalog: require('./mock-data/trial-criteria.json'),
  contractTrialCriteria: require('./mock-data/contractTrialCriteria.json'),
  // Nouveau: paramètres max généraux
  parametreMaxGeneral: require('./mock-data/parametreMaxGeneral.json'),
  // Paramètres: départements (code, libelle, is_active)
  settingsDepartements: require('./mock-data/settings/departementsParametres.json'),
  // Paramètres: postes (code, libelle, departement_id, is_active)
  settingsPostes: require('./mock-data/settings/postesParametres.json'),
  // Paramètres: emplois (code, libelle, type_contrat, is_active)
  settingsEmplois: require('./mock-data/settings/emploisParametres.json'),
  // Paramètres: métiers (code, libelle, domaine, is_active)
  settingsMetiers: require('./mock-data/settings/metiersParametres.json'),
  // Paramètres: lieux de travail (code, libelle, adresse)
  settingsLieuxTravail: require('./mock-data/settings/lieuxTravailParametres.json'),
  // Paramètres: types d'absences
  settingsTypesAbsences: require('./mock-data/settings/typesAbsencesParametres.json'),
  // Paramètres: conditions de contrat (name, value, description)
  settingsConditionsContrat: require('./mock-data/settings/conditionsContratParametres.json'),
  // Paramètres: conditions période d'essai (name, value)
  settingsConditionsPeriodeEssaie: require('./mock-data/settings/conditionsPeriodeEssaieParametres.json'),
  // Paramètres: managers (employe_id, departement_id)
  settingsManagers: require('./mock-data/settings/managersParametres.json')

};
