'use client';
import React, { useEffect, useState, useMemo } from 'react';
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

// Mock data generator
const generateMockData = () => {
  const departments: Department[] = [
    { id: 1, name: 'Engineering' },
    { id: 2, name: 'Marketing' },
    { id: 3, name: 'Sales' },
    { id: 4, name: 'HR' }
  ];

  const employees: Employee[] = Array.from({ length: 45 }, (_, i) => ({
    id: i + 1,
    status: Math.random() > 0.1 ? 'active' : 'inactive',
    departmentId: Math.floor(Math.random() * 4) + 1,
    salaryBase: 30000 + Math.floor(Math.random() * 70000),
    hireDate: new Date(2020 + Math.floor(Math.random() * 5), Math.floor(Math.random() * 12), 1).toISOString()
  }));

  const leaves: Leave[] = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    status: ['pending', 'approved', 'rejected'][Math.floor(Math.random() * 3)],
    type: 'vacation'
  }));

  const payslips: Payslip[] = Array.from({ length: 30 }, (_, i) => ({
    id: i + 1,
    net: 2000 + Math.floor(Math.random() * 4000),
    gross: 3000 + Math.floor(Math.random() * 6000),
    status: 'published',
    period: `2024-${String((i % 12) + 1).padStart(2, '0')}`,
    employeeId: Math.floor(Math.random() * 45) + 1
  }));

  const evaluations: Evaluation[] = Array.from({ length: 25 }, (_, i) => ({
    id: i + 1,
    employeeId: Math.floor(Math.random() * 45) + 1,
    score: 3 + Math.random() * 2
  }));

  return { employees, departments, leaves, payslips, evaluations };
};

export default function OverviewDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setData(generateMockData());
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Hiring trend
  const hiringTrend = useMemo(() => {
    if (!data?.employees) return [];
    const hires: Record<string, number> = {};
    data.employees.forEach((e: Employee) => {
      if (!e.hireDate) return;
      const d = new Date(e.hireDate);
      const year = d.getUTCFullYear();
      const month = String(d.getUTCMonth() + 1).padStart(2, '0');
      const key = `${year}-${month}`;
      hires[key] = (hires[key] || 0) + 1;
    });
    const sortedKeys = Object.keys(hires).sort().slice(-6);
    return sortedKeys.map((k) => ({ month: k, hires: hires[k] }));
  }, [data?.employees]);

  // Payroll by department
  const payrollByDept = useMemo(() => {
    if (!data?.payslips || !data?.employees || !data?.departments) return [];
    const publishedPayslips = data.payslips.filter((p: Payslip) => p.status === 'published');
    const map: Record<number, number> = {};
    publishedPayslips.forEach((p: Payslip) => {
      const emp = data.employees.find((e: Employee) => e.id === p.employeeId);
      if (!emp) return;
      map[emp.departmentId] = (map[emp.departmentId] || 0) + (p.net || 0);
    });
    return Object.entries(map)
      .map(([deptId, net]) => ({
        dept: data.departments.find((d: Department) => d.id === Number(deptId))?.name || `Dept ${deptId}`,
        net
      }))
      .sort((a, b) => b.net - a.net);
  }, [data?.payslips, data?.employees, data?.departments]);

  // Leave status
  const leaveStatusData = useMemo(() => {
    if (!data?.leaves) return [];
    const counts: Record<string, number> = {};
    data.leaves.forEach((l: Leave) => (counts[l.status] = (counts[l.status] || 0) + 1));
    return Object.entries(counts).map(([status, value]) => ({ status, value }));
  }, [data?.leaves]);

  // Performance radar
  const performanceData = useMemo(() => {
    if (!data?.evaluations) return [];
    const scores: Record<number, { total: number; count: number }> = {};
    data.evaluations.forEach((ev: Evaluation) => {
      scores[ev.employeeId] = scores[ev.employeeId] || { total: 0, count: 0 };
      scores[ev.employeeId].total += ev.score;
      scores[ev.employeeId].count += 1;
    });
    return Object.entries(scores)
      .slice(0, 6)
      .map(([empId, v]) => ({
        employee: `E${empId}`,
        score: parseFloat((v.total / v.count).toFixed(2))
      }));
  }, [data?.evaluations]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  const { employees, departments, leaves, payslips, evaluations } = data;

  const activeEmployees = employees.filter((e: Employee) => e.status === 'active');
  const pendingLeavesCount = leaves.filter((l: Leave) => l.status === 'pending').length;
  const publishedPayslips = payslips.filter((p: Payslip) => p.status === 'published');
  const totalNetPayroll = publishedPayslips.reduce((s: number, p: Payslip) => s + (p.net || 0), 0);
  const averageEvaluation = evaluations.length
    ? (evaluations.reduce((s: number, ev: Evaluation) => s + (ev.score || 0), 0) / evaluations.length).toFixed(1)
    : 'N/A';

  return (
    <PageContainer scrollable={true}>
      <div className=" w-full p-0 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
        <div className="mx-auto sm:p-6 lg:p-8">
          {/* Metrics cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              label="Active Employees"
              value={activeEmployees.length}
              trend={hiringTrend.slice(-2).map((d) => d.hires)}
              gradient="from-blue-500 to-cyan-500"
              icon={<UsersIcon />}
            />
            <MetricCard
              label="Departments"
              value={departments.length}
              gradient="from-purple-500 to-pink-500"
              icon={<BuildingIcon />}
            />
            <MetricCard
              label="Pending Leaves"
              value={pendingLeavesCount}
              gradient="from-amber-500 to-orange-500"
              icon={<CalendarIcon />}
            />
            <MetricCard
              label="Avg Evaluation"
              value={averageEvaluation}
              gradient="from-emerald-500 to-teal-500"
              icon={<StarIcon />}
            />
          </div>

          {/* Charts grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
            <ChartBox title="Hiring Trend" subtitle="Last 6 months">
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={hiringTrend}>
                  <defs>
                    <linearGradient id="colorHires" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis allowDecimals={false} stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="hires"
                    stroke="#6366F1"
                    strokeWidth={3}
                    dot={{ r: 5, fill: '#6366F1', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 7 }}
                    fill="url(#colorHires)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartBox>

            <ChartBox title="Payroll Distribution" subtitle={`Total: MAD${totalNetPayroll.toLocaleString()}`}>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={payrollByDept}>
                  <XAxis dataKey="dept" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    formatter={(v) => `MAD${Number(v).toLocaleString()}`}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Bar dataKey="net" radius={[8, 8, 0, 0]}>
                    {payrollByDept.map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartBox>

            <ChartBox title="Leave Status" subtitle={`${leaves.length} total requests`}>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={leaveStatusData}
                    dataKey="value"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {leaveStatusData.map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartBox>
          </div>

          {/* Bottom section */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <ChartBox title="Performance Scores" subtitle="Top 6 employees">
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={performanceData} outerRadius={100}>
                  <PolarGrid stroke="#cbd5e1" />
                  <PolarAngleAxis dataKey="employee" tick={{ fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fontSize: 10 }} />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="#8B5CF6"
                    fill="#8B5CF6"
                    fillOpacity={0.6}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </ChartBox>

            <div className="grid gap-6">
              <ListBox
                title="Recent Leaves"
                items={leaves.slice(0, 5).map((l: Leave) => ({
                  id: l.id,
                  primary: `Leave Request #${l.id}`,
                  secondary: l.status
                }))}
              />
              <ListBox
                title="Recent Payslips"
                items={publishedPayslips.slice(0, 5).map((p: Payslip) => ({
                  id: p.id,
                  primary: `${p.period}`,
                  secondary: `MAD${p.net.toLocaleString()}`
                }))}
              />
            </div>
          </div>
        </div>
      </div>

    </PageContainer>
     );
}

function DashboardSkeleton() {
  return (
    <PageContainer scrollable={true}>  <div className="min-h-screen w-full p-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      <div className="mx-auto  p-4 sm:p-6 lg:p-8 animate-pulse">
        {/* Metrics skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-white/50 dark:bg-slate-900/50" />
          ))}
        </div>

        {/* Charts skeleton */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-80 rounded-2xl bg-white/50 dark:bg-slate-900/50" />
          ))}
        </div>

        {/* Bottom section skeleton */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="h-96 rounded-2xl bg-white/50 dark:bg-slate-900/50" />
          <div className="space-y-6">
            <div className="h-44 rounded-2xl bg-white/50 dark:bg-slate-900/50" />
            <div className="h-44 rounded-2xl bg-white/50 dark:bg-slate-900/50" />
          </div>
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
                      gradient,
                      icon
                    }: {
  label: string;
  value: number | string;
  trend?: number[];
  gradient: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-white/20 dark:border-slate-700/50">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${gradient} mb-4 shadow-lg`}>
            <div className="text-white">{icon}</div>
          </div>
          <div className="text-slate-600 dark:text-slate-400 text-sm font-medium uppercase tracking-wide mb-2">
            {label}
          </div>
          <div className="text-4xl font-bold text-slate-900 dark:text-white">
            {value}
          </div>
        </div>

        {trend && trend.length === 2 && (
          <div className={`flex flex-col items-end ${trend[1] >= trend[0] ? 'text-emerald-600' : 'text-rose-600'}`}>
            <span className="text-2xl">{trend[1] >= trend[0] ? '↑' : '↓'}</span>
            <span className="text-sm font-semibold">{Math.abs(trend[1] - trend[0])}</span>
          </div>
        )}
      </div>
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
    <div className="rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-white/20 dark:border-slate-700/50">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{title}</h2>
        {subtitle && (
          <p className="text-sm text-slate-600 dark:text-slate-400">{subtitle}</p>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}

function ListBox({
                   title,
                   items
                 }: {
  title: string;
  items: { id: number; primary: string; secondary: string }[];
}) {
  return (
    <div className="rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 shadow-lg border border-white/20 dark:border-slate-700/50">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{title}</h3>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-center p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-colors duration-200"
          >
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {item.primary}
            </span>
            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
              {item.secondary}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Icons
function UsersIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );
}