'use client';
import React, { useEffect, useState, useMemo } from 'react';
import apiClient from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import PageContainer from '@/components/layout/page-container';

interface Employee {
  id: number;
  status: string;
  departmentId: number;
  salaryBase?: number;
  hireDate?: string;
}
interface Department {
  id: number;
  name: string;
}
interface Leave {
  id: number;
  status: string;
  type?: string;
}
interface Payslip {
  id: number;
  net: number;
  gross?: number;
  status: string;
  period: string;
  employeeId: number;
}
interface Evaluation {
  id: number;
  employeeId: number;
  score: number;
}

const COLORS = [
  '#6366F1',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899'
];

export default function OverviewDashboard() {
  const { t } = useLanguage();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [empRes, deptRes, leaveRes, payRes, evalRes] = await Promise.all([
          apiClient.get('/employees'),
          apiClient.get('/departments'),
          apiClient.get('/leaves'),
          apiClient.get('/payslips'),
          apiClient.get('/evaluations')
        ]);
        if (!mounted) return;
        setEmployees(empRes.data || []);
        setDepartments(deptRes.data || []);
        setLeaves(leaveRes.data || []);
        setPayslips(payRes.data || []);
        setEvaluations(evalRes.data || []);
      } catch (e: any) {
        if (mounted) setError(e?.message || t('dashboard.error'));
      } finally {
        mounted && setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [t]);

  const activeEmployees = employees.filter((e) => e.status === 'active');
  const pendingLeavesCount = leaves.filter(
    (l) => l.status === 'pending'
  ).length;
  const publishedPayslips = payslips.filter((p) => p.status === 'published');
  const totalNetPayroll = publishedPayslips.reduce(
    (s, p) => s + (p.net || 0),
    0
  );
  const averageEvaluation = evaluations.length
    ? (
        evaluations.reduce((s, ev) => s + (ev.score || 0), 0) /
        evaluations.length
      ).toFixed(2)
    : 'N/A';
  const avgSalary = activeEmployees.length
    ? (
        activeEmployees.reduce((s, e) => s + (e.salaryBase || 0), 0) /
        activeEmployees.length
      ).toFixed(0)
    : '0';

  // Hiring trend (last 6 hire months)
  const hiringTrend = useMemo(() => {
    const hires: Record<string, number> = {};
    employees.forEach((e) => {
      if (!e.hireDate) return;
      const d = new Date(e.hireDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      hires[key] = (hires[key] || 0) + 1;
    });
    const sortedKeys = Object.keys(hires).sort().slice(-6);
    return sortedKeys.map((k) => ({ month: k, hires: hires[k] }));
  }, [employees]);

  // Payroll distribution by department (net sum of published)
  const payrollByDept = useMemo(() => {
    const map: Record<number, number> = {};
    publishedPayslips.forEach((p) => {
      const emp = employees.find((e) => e.id === p.employeeId);
      if (!emp) return;
      map[emp.departmentId] = (map[emp.departmentId] || 0) + (p.net || 0);
    });
    return Object.entries(map)
      .map(([deptId, net]) => ({
        dept:
          departments.find((d) => d.id === Number(deptId))?.name ||
          `Dept ${deptId}`,
        net
      }))
      .sort((a, b) => b.net - a.net);
  }, [publishedPayslips, employees, departments]);

  // Leave status pie
  const leaveStatusData = useMemo(() => {
    const counts: Record<string, number> = {};
    leaves.forEach((l) => (counts[l.status] = (counts[l.status] || 0) + 1));
    return Object.entries(counts).map(([status, value]) => ({ status, value }));
  }, [leaves]);

  // Performance radar (average per employee for top 6)
  const performanceData = useMemo(() => {
    const scores: Record<number, { total: number; count: number }> = {};
    evaluations.forEach((ev) => {
      scores[ev.employeeId] = scores[ev.employeeId] || { total: 0, count: 0 };
      scores[ev.employeeId].total += ev.score;
      scores[ev.employeeId].count += 1;
    });
    return Object.entries(scores)
      .slice(0, 6)
      .map(([empId, v]) => ({
        employee: `E${empId}`,
        score: (v.total / v.count).toFixed(2)
      }));
  }, [evaluations]);

  if (loading)
    return (
      <div className='text-muted-foreground text-sm'>
        {t('dashboard.loading')}
      </div>
    );
  if (error) return <div className='text-sm text-red-600'>{error}</div>;

  return (
    <PageContainer scrollable={true} className='space-y-6 w-full'>
      <div className='flex flex-col gap-6 w-full'>
        <div className='flex items-center justify-between'>
          <h1 className='text-primary text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl'>
            {t('dashboard.title')}
          </h1>
        </div>

        {/* Metrics cards */}
        <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
          <MetricCard
            label={t('dashboard.metrics.activeEmployees')}
            value={activeEmployees.length}
            trend={hiringTrend.slice(-2).map((d) => d.hires)}
          />
          <MetricCard
            label={t('dashboard.metrics.departments')}
            value={departments.length}
          />
          <MetricCard
            label={t('dashboard.metrics.pendingLeaves')}
            value={pendingLeavesCount}
          />
          <MetricCard
            label={t('dashboard.metrics.avgEvaluation')}
            value={averageEvaluation}
          />
        </div>

        {/* Charts grid */}
        <div className='grid grid-cols-1 gap-6 xl:grid-cols-3'>
          <ChartBox
            title={t('dashboard.sections.hiringTrend')}
            subtitle={t('dashboard.metrics.payrollGrowth')}
          >
            <ResponsiveContainer width='100%' height={240}>
              <LineChart data={hiringTrend}>
                <XAxis dataKey='month' tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line
                  type='monotone'
                  dataKey='hires'
                  stroke='#6366F1'
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartBox>
          <ChartBox
            title={t('dashboard.sections.payrollDistribution')}
            subtitle={t('dashboard.metrics.netPayroll')}
          >
            <ResponsiveContainer width='100%' height={240}>
              <BarChart data={payrollByDept}>
                <XAxis dataKey='dept' tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip formatter={(v) => `€ ${Number(v).toLocaleString()}`} />
                <Bar dataKey='net' radius={[6, 6, 0, 0]} fill='#10B981'>
                  {payrollByDept.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className='text-muted-foreground mt-2 text-xs'>
              € {totalNetPayroll.toLocaleString()}
            </div>
          </ChartBox>
          <ChartBox
            title={t('dashboard.sections.leaveStatus')}
            subtitle={t('dashboard.metrics.pendingLeaves')}
          >
            <ResponsiveContainer width='100%' height={240}>
              <PieChart>
                <Pie
                  data={leaveStatusData}
                  dataKey='value'
                  nameKey='status'
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                >
                  {leaveStatusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartBox>
        </div>

        <div className='grid grid-cols-1 gap-6 xl:grid-cols-2'>
          <ChartBox
            title={t('dashboard.sections.performanceScores')}
            subtitle={t('dashboard.metrics.avgEvaluation')}
          >
            <ResponsiveContainer width='100%' height={300}>
              <RadarChart data={performanceData} outerRadius={95}>
                <PolarGrid />
                <PolarAngleAxis dataKey='employee' />
                <PolarRadiusAxis angle={30} domain={[0, 5]} />
                <Radar
                  name='Score'
                  dataKey='score'
                  stroke='#8B5CF6'
                  fill='#8B5CF6'
                  fillOpacity={0.5}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </ChartBox>
          <div className='grid gap-6'>
            <ListBox
              title={t('dashboard.sections.recentLeaves')}
              items={leaves
                .slice(0, 5)
                .map((l) => ({
                  id: l.id,
                  primary: `#${l.id}`,
                  secondary: l.status
                }))}
            />
            <ListBox
              title={t('dashboard.sections.recentPayslips')}
              items={publishedPayslips
                .slice(0, 5)
                .map((p) => ({
                  id: p.id,
                  primary: `${p.period} #${p.id}`,
                  secondary: `€ ${p.net}`
                }))}
              footer={`€ ${totalNetPayroll.toLocaleString()}`}
            />
            <ListBox
              title={t('dashboard.sections.evaluations')}
              items={evaluations
                .slice(0, 5)
                .map((ev) => ({
                  id: ev.id,
                  primary: `E${ev.employeeId}`,
                  secondary: ev.score.toString()
                }))}
            />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

function MetricCard({
  label,
  value,
  trend,
  icon
}: {
  label: string;
  value: number | string;
  trend?: number[];
  icon?: React.ReactNode;
}) {
  return (
    <div className='group relative overflow-hidden rounded-2xl border bg-gradient-to-br from-neutral-50 to-neutral-100 p-4 shadow-sm hover:shadow-lg transition-transform transform hover:-translate-y-1 dark:from-gray-900 dark:to-gray-800'>
      <div className='flex items-start justify-between'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20'>
            {icon ?? (
              <svg width='20' height='20' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg' aria-hidden>
                <path d='M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5z' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'/>
                <path d='M20 21v-1a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v1' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'/>
              </svg>
            )}
          </div>
        <div>
          <div className='text-muted-foreground text-xs tracking-wide uppercase'>
            {label}
          </div>
          <div className='mt-1 text-2xl font-semibold'>{value}</div>
        </div>
        </div>
        {trend && trend.length === 2 && (
          <div
            className={`text-sm font-medium flex items-center gap-2 ${trend[1] >= trend[0] ? 'text-green-600' : 'text-red-600'}`}
          >
            <span className='text-xs'>
              {trend[1] >= trend[0] ? '▲' : '▼'}
            </span>
            <span>{trend[1] - trend[0] || 0}</span>
          </div>
        )}
      </div>
      <div className='absolute inset-0 pointer-events-none bg-gradient-to-tr from-indigo-500/10 via-transparent to-pink-500/0 opacity-0 transition-opacity group-hover:opacity-30' />
    </div>
  );
}

function ChartBox({
  title,
  subtitle,
  children
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className='flex flex-col rounded-xl border bg-white/60 p-4 shadow-sm backdrop-blur-sm dark:bg-gray-900/60'>
      <div className='mb-3 flex items-center justify-between'>
        <h2 className='text-sm font-medium'>{title}</h2>
        {subtitle && (
          <span className='text-muted-foreground text-xs'>{subtitle}</span>
        )}
      </div>
      <div className='flex-1'>{children}</div>
    </div>
  );
}

function ListBox({
  title,
  items,
  footer
}: {
  title: string;
  items: { id: number; primary: string; secondary: string }[];
  footer?: string;
}) {
  return (
    <div className='rounded-xl border bg-white p-4 shadow-sm dark:bg-gray-900'>
      <h3 className='mb-3 text-sm font-medium'>{title}</h3>
      <ul className='space-y-2 text-sm'>
        {items.map((item) => (
          <li
            key={item.id}
            className='flex justify-between rounded-md border px-3 py-2 transition-colors hover:bg-neutral-50 dark:hover:bg-gray-800'
          >
            <span>{item.primary}</span>
            <span className='font-medium text-indigo-600 dark:text-indigo-400'>
              {item.secondary}
            </span>
          </li>
        ))}
        {items.length === 0 && <li className='text-muted-foreground'>—</li>}
      </ul>
      {footer && (
        <div className='text-muted-foreground mt-3 text-xs'>{footer}</div>
      )}
    </div>
  );
}
