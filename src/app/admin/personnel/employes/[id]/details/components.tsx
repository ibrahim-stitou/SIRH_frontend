"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export const SectionCard: React.FC<{ title: string; description?: string; className?: string; children: React.ReactNode }> = ({ title, description, className, children }) => (
  <Card className={cn('p-4 md:p-6 space-y-3', className)}>
    <div>
      <h3 className="text-base md:text-lg font-semibold tracking-tight">{title}</h3>
      {description && <p className="text-xs md:text-sm text-muted-foreground">{description}</p>}
    </div>
    <div className="space-y-3">{children}</div>
  </Card>
);

export const InfoRow: React.FC<{ label: string; value?: React.ReactNode }>= ({ label, value }) => (
  <div className="flex items-start justify-between gap-4 border-b last:border-b-0 py-2">
    <span className="text-xs md:text-sm text-muted-foreground">{label}</span>
    <span className="text-sm md:text-base font-medium text-foreground text-right break-words max-w-[60%]">{value ?? '—'}</span>
  </div>
);

export const AnimatedTabContent: React.FC<{ active: boolean; children: React.ReactNode }>= ({ active, children }) => (
  <AnimatePresence mode="wait">
    {active && (
      <motion.div
        key="tab"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="space-y-4"
      >
        {children}
      </motion.div>
    )}
  </AnimatePresence>
);

