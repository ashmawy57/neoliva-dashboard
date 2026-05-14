'use client';

import Link from 'next/link';
import { UserX, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import type { OperationalAlert, AlertSeverity, AlertType } from '@/services/alerts.service';

// ─── Styling maps ────────────────────────────────────────────────────────────

const SEVERITY_STYLES: Record<AlertSeverity, {
  card:   string;
  badge:  string;
  icon:   string;
  cta:    string;
  dot:    string;
}> = {
  HIGH: {
    card:  'border-red-200 bg-red-50/60',
    badge: 'bg-red-100 text-red-700 border-red-200',
    icon:  'bg-red-100 text-red-600',
    cta:   'text-red-700 hover:text-red-900 hover:bg-red-100',
    dot:   'bg-red-500 animate-pulse',
  },
  MEDIUM: {
    card:  'border-orange-200 bg-orange-50/60',
    badge: 'bg-orange-100 text-orange-700 border-orange-200',
    icon:  'bg-orange-100 text-orange-600',
    cta:   'text-orange-700 hover:text-orange-900 hover:bg-orange-100',
    dot:   'bg-orange-400 animate-pulse',
  },
  LOW: {
    card:  'border-yellow-200 bg-yellow-50/60',
    badge: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    icon:  'bg-yellow-100 text-yellow-600',
    cta:   'text-yellow-700 hover:text-yellow-900 hover:bg-yellow-100',
    dot:   'bg-yellow-400',
  },
};

const TYPE_META: Record<AlertType, {
  label: string;
  Icon:  React.ElementType;
}> = {
  NO_SHOW:         { label: 'No-Show',          Icon: UserX         },
  OVERDUE:         { label: 'Invoice Overdue',   Icon: Clock         },
  TREATMENT_DELAY: { label: 'Treatment Delayed', Icon: AlertTriangle },
};

// ─── Component ───────────────────────────────────────────────────────────────

interface AlertCardProps {
  alert: OperationalAlert;
}

export function AlertCard({ alert }: AlertCardProps) {
  const { type, severity, count, message, actionUrl } = alert;
  const styles = SEVERITY_STYLES[severity];
  const { label, Icon } = TYPE_META[type];

  return (
    <div className={`relative flex items-start gap-4 rounded-2xl border p-4 transition-shadow hover:shadow-md ${styles.card}`}>
      {/* Severity dot */}
      <span className={`absolute right-4 top-4 h-2 w-2 rounded-full ${styles.dot}`} />

      {/* Icon */}
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${styles.icon}`}>
        <Icon className="h-5 w-5" />
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Type badge */}
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${styles.badge}`}>
            {label}
          </span>
          {/* Severity badge */}
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles.badge}`}>
            {severity}
          </span>
          {/* Count pill */}
          <span className="ml-auto text-2xl font-bold tabular-nums text-gray-800 leading-none">
            {count}
          </span>
        </div>

        <p className="text-sm text-gray-700 leading-snug">{message}</p>

        {/* CTA */}
        <Link
          href={actionUrl}
          className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold transition-colors ${styles.cta}`}
        >
          View Details
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
