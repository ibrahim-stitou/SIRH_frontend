'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { UseTableReturn } from '@/components/custom/data-table/types';
import { AttestationsPageSkeleton } from './loading-skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  FileText,
  Plus,
  CheckCircle2,
  Clock,
  FileCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/lib/api';
import { format } from 'date-fns';
import type { AttestationRequest, Attestation, AttestationType, AttestationRequestStatus } from '@/types/attestation';
import { downloadAttestationPDF } from '@/lib/pdf/attestation-generator';
import { apiRoutes } from '@/config/apiRoutes';
import DemandeAttestationListing from './demande-attestation-listing';
import AttestationListing from './attestation-listing';
import {
  NewRequestModal,
  GenerateModal,
  RejectModal,
  ConfirmGenerateModal,
  RequestDetailsModal,
} from './components';

export default function AttestationsPage() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('requests');
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, generated: 0 });

  // Table instances
  const [requestsTable, setRequestsTable] = useState<Partial<UseTableReturn<any>> | null>(null);
  const [attestationsTable, setAttestationsTable] = useState<Partial<UseTableReturn<any>> | null>(null);

  // Dialog states
  const [newRequestDialog, setNewRequestDialog] = useState(false);
  const [generateDialog, setGenerateDialog] = useState(false);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [confirmGenerateDialog, setConfirmGenerateDialog] = useState(false);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<AttestationRequest | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    employeeId: '',
    typeAttestation: '' as AttestationType | '',
    dateSouhaitee: '',
    notes: '',
    raisonRejet: '',
    stageStartDate: '',
    stageEndDate: '',
  });


  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [empRes, reqRes] = await Promise.all([
        apiClient.get(apiRoutes.admin.employees.list),
        apiClient.get(apiRoutes.admin.attestations.requests.list),
      ]);
      setEmployees(empRes.data?.data || []);

      // Calculate stats
      const requests = reqRes.data?.data || [];
      setStats({
        total: requests.length,
        pending: requests.filter((r: any) => r.status === 'en_attente').length,
        approved: requests.filter((r: any) => r.status === 'approuve').length,
        generated: requests.filter((r: any) => r.status === 'genere').length,
      });
    } catch (error) {
      toast.error(t('attestations.messages.error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshTables = () => {
    if (requestsTable?.refresh) requestsTable.refresh();
    if (attestationsTable?.refresh) attestationsTable.refresh();
    fetchInitialData(); // Refresh stats
  };

  const getEmployee = (employeeId: number) => {
    return employees.find((e) => e.id === employeeId);
  };

  const handleNewRequest = async () => {
    if (!formData.employeeId || !formData.typeAttestation) {
      toast.error('Veuillez remplir tous les champs requis');
      return;
    }

    try {
      const payload = {
        employeeId: parseInt(formData.employeeId),
        typeAttestation: formData.typeAttestation,
        dateRequest: new Date().toISOString().split('T')[0],
        dateSouhaitee: formData.dateSouhaitee || null,
        status: 'en_attente' as AttestationRequestStatus,
        notes: formData.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await apiClient.post(apiRoutes.admin.attestations.requests.create, payload);
      toast.success(t('attestations.messages.requestCreated'));
      setNewRequestDialog(false);
      resetForm();
      refreshTables();
    } catch (error) {
      toast.error(t('attestations.messages.error'));
    }
  };

  const handleApprove = async (request: AttestationRequest) => {
    try {
      await apiClient.patch(apiRoutes.admin.attestations.requests.update(request.id), {
        status: 'approuve',
        updatedAt: new Date().toISOString(),
      });
      toast.success(t('attestations.messages.requestApproved'));
      refreshTables();
    } catch (error) {
      toast.error(t('attestations.messages.error'));
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !formData.raisonRejet) {
      toast.error('Veuillez indiquer la raison du rejet');
      return;
    }

    try {
      await apiClient.patch(apiRoutes.admin.attestations.requests.update(selectedRequest.id), {
        status: 'rejete',
        raisonRejet: formData.raisonRejet,
        updatedAt: new Date().toISOString(),
      });
      toast.success(t('attestations.messages.requestRejected'));
      setRejectDialog(false);
      setSelectedRequest(null);
      resetForm();
      refreshTables();
    } catch (error) {
      toast.error(t('attestations.messages.error'));
    }
  };

  const handleOpenRejectDialog = (request: AttestationRequest) => {
    setSelectedRequest(request);
    setRejectDialog(true);
  };

  const handleOpenGenerateConfirmDialog = (request: AttestationRequest) => {
    setSelectedRequest(request);
    setConfirmGenerateDialog(true);
  };

  const handleViewDetails = (request: AttestationRequest) => {
    setSelectedRequest(request);
    setDetailsDialog(true);
  };

  const handleConfirmGenerate = () => {
    if (selectedRequest) {
      setConfirmGenerateDialog(false);
      handleGenerate(selectedRequest);
    }
  };

  const handleGenerate = async (request?: AttestationRequest) => {
    const employeeId = request?.employeeId || parseInt(formData.employeeId);
    const type = request?.typeAttestation || formData.typeAttestation;
    
    if (!employeeId || !type) {
      toast.error('Données insuffisantes');
      return;
    }

    const employee = getEmployee(employeeId);
    if (!employee) {
      toast.error('Employé introuvable');
      return;
    }

    try {
      // Generate attestation number
      const year = new Date().getFullYear();
      const attestationsRes = await apiClient.get(apiRoutes.admin.attestations.generated.list);
      const existingAttestations = attestationsRes.data?.data || [];
      const nextNum = existingAttestations.length + 1;
      const numeroAttestation = `ATT-${year}-${String(nextNum).padStart(3, '0')}`;
      const dateGeneration = new Date().toISOString().split('T')[0];

      // Create attestation record
      const attestationPayload = {
        requestId: request?.id || null,
        employeeId,
        typeAttestation: type,
        dateGeneration,
        numeroAttestation,
        documentPath: `/documents/attestations/${numeroAttestation}.pdf`,
        notes: formData.notes || 'Généré automatiquement',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await apiClient.post(apiRoutes.admin.attestations.generated.create, attestationPayload);

      // Update request status if exists
      if (request) {
        await apiClient.patch(apiRoutes.admin.attestations.requests.update(request.id), {
          status: 'genere',
          updatedAt: new Date().toISOString(),
        });
      }

      // Generate and download PDF
      const additionalData = type === 'stage' ? {
        stageStartDate: formData.stageStartDate || employee.hireDate,
        stageEndDate: formData.stageEndDate || new Date().toISOString().split('T')[0],
      } : undefined;

      downloadAttestationPDF(
        type as AttestationType,
        employee,
        numeroAttestation,
        dateGeneration,
        additionalData
      );

      toast.success(t('attestations.messages.attestationGenerated'));
      setGenerateDialog(false);
      setSelectedRequest(null);
      resetForm();
      refreshTables();
    } catch (error) {
      console.error(error);
      toast.error(t('attestations.messages.error'));
    }
  };

  const handleDownloadExisting = (attestation: Attestation) => {
    const employee = getEmployee(attestation.employeeId);
    if (!employee) {
      toast.error('Employé introuvable');
      return;
    }

    const additionalData = attestation.typeAttestation === 'stage' ? {
      stageStartDate: employee.hireDate,
      stageEndDate: new Date().toISOString().split('T')[0],
    } : undefined;

    downloadAttestationPDF(
      attestation.typeAttestation,
      employee,
      attestation.numeroAttestation,
      attestation.dateGeneration,
      additionalData
    );

    toast.success(t('attestations.messages.downloadStarted'));
  };

  const resetForm = () => {
    setFormData({
      employeeId: '',
      typeAttestation: '',
      dateSouhaitee: '',
      notes: '',
      raisonRejet: '',
      stageStartDate: '',
      stageEndDate: '',
    });
  };


  if (loading) {
    return (
      <PageContainer>
        <AttestationsPageSkeleton />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-6 w-full">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {t('attestations.title')}
            </h1>
            <p className="text-sm text-muted-foreground">{t('attestations.subtitle')}</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setNewRequestDialog(true)}
              size="sm"
              className="gap-2 shadow-sm hover:shadow-md transition-all"
            >
              <Plus className="h-4 w-4" />
              {t('attestations.newRequest')}
            </Button>
            <Button
              onClick={() => setGenerateDialog(true)}
              size="sm"
              variant="outline"
              className="gap-2 shadow-sm hover:shadow-md transition-all"
            >
              <FileText className="h-4 w-4" />
              {t('attestations.generateNew')}
            </Button>
          </div>
        </div>
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-muted/50 p-1 h-auto">
            <TabsTrigger
              value="requests"
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2.5"
            >
              <Clock className="h-4 w-4 mr-2" />
              {t('attestations.tabs.requests')}
            </TabsTrigger>
            <TabsTrigger
              value="generated"
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm px-4 py-2.5"
            >
              <FileCheck className="h-4 w-4 mr-2" />
              {t('attestations.tabs.generated')}
            </TabsTrigger>
          </TabsList>

          {/* Requests Tab */}
          <TabsContent value="requests" className="mt-0 space-y-4">
            <Card className="shadow-sm border-muted/40">
              <CardContent className="flex flex-col min-h-[750px] pt-6">
                <DemandeAttestationListing
                  employees={employees}
                  onApprove={handleApprove}
                  onReject={handleOpenRejectDialog}
                  onGenerate={handleOpenGenerateConfirmDialog}
                  onViewDetails={handleViewDetails}
                  onInit={(instance) => setRequestsTable(instance)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Generated Tab */}
          <TabsContent value="generated" className="mt-0 space-y-4">
            <Card className="shadow-sm border-muted/40">
              <CardContent className="flex flex-col min-h-[750px] pt-6">
                <AttestationListing
                  employees={employees}
                  onDownload={handleDownloadExisting}
                  onInit={(instance) => setAttestationsTable(instance)}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <NewRequestModal
        open={newRequestDialog}
        onOpenChange={setNewRequestDialog}
        employees={employees}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleNewRequest}
        onCancel={() => {
          setNewRequestDialog(false);
          resetForm();
        }}
      />

      <GenerateModal
        open={generateDialog}
        onOpenChange={setGenerateDialog}
        employees={employees}
        formData={formData}
        setFormData={setFormData}
        onGenerate={() => handleGenerate()}
        onCancel={() => {
          setGenerateDialog(false);
          resetForm();
        }}
      />

      <RejectModal
        open={rejectDialog}
        onOpenChange={setRejectDialog}
        raisonRejet={formData.raisonRejet}
        setRaisonRejet={(value) => setFormData({ ...formData, raisonRejet: value })}
        onReject={handleReject}
        onCancel={() => {
          setRejectDialog(false);
          setSelectedRequest(null);
          resetForm();
        }}
      />

      <ConfirmGenerateModal
        open={confirmGenerateDialog}
        onOpenChange={setConfirmGenerateDialog}
        request={selectedRequest}
        employees={employees}
        onConfirm={handleConfirmGenerate}
        onCancel={() => {
          setConfirmGenerateDialog(false);
          setSelectedRequest(null);
        }}
      />

      <RequestDetailsModal
        open={detailsDialog}
        onOpenChange={setDetailsDialog}
        request={selectedRequest}
        employeeName={
          selectedRequest
            ? `${employees.find((e) => e.id === selectedRequest.employeeId)?.firstName || ''} ${
                employees.find((e) => e.id === selectedRequest.employeeId)?.lastName || ''
              }`
            : undefined
        }
      />

      {/* Old Dialog - to be removed */}
      <Dialog open={false} onOpenChange={setNewRequestDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('attestations.dialog.newRequest.title')}</DialogTitle>
            <DialogDescription>{t('attestations.dialog.newRequest.description')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employee">{t('attestations.fields.employeeId')}</Label>
              <Select
                value={formData.employeeId}
                onValueChange={(value) => setFormData({ ...formData, employeeId: value })}
              >
                <SelectTrigger id="employee" className="w-full">
                  <SelectValue placeholder={t('placeholders.select')} />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={String(emp.id)}>
                      {emp.firstName} {emp.lastName} - {emp.position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">{t('attestations.fields.typeAttestation')}</Label>
              <Select
                value={formData.typeAttestation}
                onValueChange={(value) => setFormData({ ...formData, typeAttestation: value as AttestationType })}
              >
                <SelectTrigger id="type" className="w-full">
                  <SelectValue placeholder={t('placeholders.select')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="travail">{t('attestations.types.travail')}</SelectItem>
                  <SelectItem value="salaire">{t('attestations.types.salaire')}</SelectItem>
                  <SelectItem value="travail_salaire">{t('attestations.types.travail_salaire')}</SelectItem>
                  <SelectItem value="stage">{t('attestations.types.stage')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateSouhaitee">{t('attestations.fields.dateSouhaitee')}</Label>
              <Input
                id="dateSouhaitee"
                type="date"
                value={formData.dateSouhaitee}
                onChange={(e) => setFormData({ ...formData, dateSouhaitee: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">{t('attestations.fields.notes')}</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder={t('attestations.fields.notes')}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setNewRequestDialog(false);
              resetForm();
            }}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleNewRequest}>{t('common.submit')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generate Dialog */}
      <Dialog open={generateDialog} onOpenChange={setGenerateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('attestations.dialog.generateAttestation.title')}</DialogTitle>
            <DialogDescription>
              {t('attestations.dialog.generateAttestation.description')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gen-employee">{t('attestations.fields.employeeId')}</Label>
              <Select
                value={formData.employeeId}
                onValueChange={(value) => setFormData({ ...formData, employeeId: value })}
              >
                <SelectTrigger id="gen-employee" className="w-full">
                  <SelectValue placeholder={t('placeholders.select')} />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={String(emp.id)}>
                      {emp.firstName} {emp.lastName} - {emp.position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gen-type">{t('attestations.fields.typeAttestation')}</Label>
              <Select
                value={formData.typeAttestation}
                onValueChange={(value) => setFormData({ ...formData, typeAttestation: value as AttestationType })}
              >
                <SelectTrigger id="gen-type" className="w-full">
                  <SelectValue placeholder={t('placeholders.select')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="travail">{t('attestations.types.travail')}</SelectItem>
                  <SelectItem value="salaire">{t('attestations.types.salaire')}</SelectItem>
                  <SelectItem value="travail_salaire">{t('attestations.types.travail_salaire')}</SelectItem>
                  <SelectItem value="stage">{t('attestations.types.stage')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.typeAttestation === 'stage' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="stage-start">{t('attestations.fields.stageStartDate')}</Label>
                  <Input
                    id="stage-start"
                    type="date"
                    value={formData.stageStartDate}
                    onChange={(e) => setFormData({ ...formData, stageStartDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stage-end">{t('attestations.fields.stageEndDate')}</Label>
                  <Input
                    id="stage-end"
                    type="date"
                    value={formData.stageEndDate}
                    onChange={(e) => setFormData({ ...formData, stageEndDate: e.target.value })}
                  />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="gen-notes">{t('attestations.fields.notes')}</Label>
              <Textarea
                id="gen-notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder={t('attestations.fields.notes')}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setGenerateDialog(false);
              resetForm();
            }}>
              {t('common.cancel')}
            </Button>
            <Button onClick={() => handleGenerate()}>{t('attestations.actions.generate')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog} onOpenChange={setRejectDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('attestations.dialog.reject.title')}</DialogTitle>
            <DialogDescription>{t('attestations.dialog.reject.description')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reject-reason">{t('attestations.fields.raisonRejet')}</Label>
              <Textarea
                id="reject-reason"
                value={formData.raisonRejet}
                onChange={(e) => setFormData({ ...formData, raisonRejet: e.target.value })}
                placeholder={t('attestations.fields.raisonRejet')}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setRejectDialog(false);
              setSelectedRequest(null);
              resetForm();
            }}>
              {t('common.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              {t('attestations.actions.reject')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Generate Dialog */}
      <Dialog open={confirmGenerateDialog} onOpenChange={setConfirmGenerateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('attestations.dialog.confirmGenerate.title')}</DialogTitle>
            <DialogDescription>{t('attestations.dialog.confirmGenerate.description')}</DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-3 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t('attestations.columns.employee')}:</span>
                <span className="text-sm">
                  {employees.find((e) => e.id === selectedRequest.employeeId)?.firstName}{' '}
                  {employees.find((e) => e.id === selectedRequest.employeeId)?.lastName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t('attestations.columns.type')}:</span>
                <span className="text-sm">{t(`attestations.types.${selectedRequest.typeAttestation}`)}</span>
              </div>
              {selectedRequest.dateSouhaitee && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{t('attestations.columns.dateSouhaitee')}:</span>
                  <span className="text-sm">
                    {format(new Date(selectedRequest.dateSouhaitee), 'dd/MM/yyyy')}
                  </span>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setConfirmGenerateDialog(false);
              setSelectedRequest(null);
            }}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleConfirmGenerate}>
              {t('attestations.actions.generate')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

