import * as React from 'react';
import { ExternalLink, AlertCircle, CheckCircle2, Activity, RefreshCw } from 'lucide-react';
import { DOMAIN_INTEGRATIONS, DomainIntegration, DomainStatus } from '../../data/domainIntegrations';

const STATUS_CONFIG: Record<DomainStatus, { label: string; badgeClass: string; icon: React.ComponentType<{ className?: string }> }> = {
  online: {
    label: 'Operational',
    badgeClass: 'bg-green-500/10 text-green-500 border border-green-500/30',
    icon: CheckCircle2
  },
  degraded: {
    label: 'Degraded',
    badgeClass: 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/30',
    icon: Activity
  },
  offline: {
    label: 'Offline',
    badgeClass: 'bg-red-500/10 text-red-500 border border-red-500/30',
    icon: AlertCircle
  },
  pending: {
    label: 'Pending',
    badgeClass: 'bg-blue-500/10 text-blue-400 border border-blue-500/30',
    icon: RefreshCw
  }
};

const statusChip = (status: DomainStatus) => STATUS_CONFIG[status];

export function DomainIntegrator() {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-display font-bold">Cross-Domain Integration Map</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Status overview of every satellite domain, automation environment, and content hub that feeds the Blaze Intelligence command center.
        </p>
      </div>

      {DOMAIN_INTEGRATIONS.map((integration) => (
        <DomainCard key={integration.domain} integration={integration} />
      ))}
    </div>
  );
}

function DomainCard({ integration }: { integration: DomainIntegration }) {
  const status = statusChip(integration.status);
  const StatusIcon = status.icon;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200/60 dark:border-gray-800/60 p-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${status.badgeClass}`}>
              <StatusIcon className="w-4 h-4" />
              {status.label}
            </span>
            <a
              href={integration.domain}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-sm font-medium text-blaze-orange hover:text-blaze-orange-light"
            >
              {integration.domain.replace(/^https?:\/\//, '')}
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {integration.owner && (
            <span className="text-xs uppercase tracking-wide text-gray-400">
              Managed by {integration.owner}
            </span>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{integration.label}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{integration.description}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {integration.capabilities.map(capability => (
            <span
              key={capability}
              className="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full"
            >
              {capability}
            </span>
          ))}
        </div>

        {integration.notes && (
          <div className="p-3 bg-blaze-orange/10 border border-blaze-orange/20 rounded-lg text-xs text-blaze-orange">
            {integration.notes}
          </div>
        )}

        {integration.actions && integration.actions.length > 0 && (
          <div className="flex flex-wrap gap-3 pt-2">
            {integration.actions.map(action => (
              <a
                key={`${integration.domain}-${action.label}`}
                href={action.url}
                target="_blank"
                rel="noreferrer"
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  action.type === 'primary'
                    ? 'bg-blaze-orange text-white hover:bg-blaze-orange-light'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {action.label}
                <ExternalLink className="w-4 h-4" />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
