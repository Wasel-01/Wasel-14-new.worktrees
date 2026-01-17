import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { appMetadata, isDevelopment } from '../utils/config';
import { Button } from './ui/button';

/**
 * Staging Environment Banner
 * Displays a warning banner in staging/development environments
 */
export function StagingBanner() {
  const [dismissed, setDismissed] = useState(() => {
    // Check if user has dismissed the banner in this session
    return sessionStorage.getItem('stagingBannerDismissed') === 'true';
  });

  const handleDismiss = () => {
    sessionStorage.setItem('stagingBannerDismissed', 'true');
    setDismissed(true);
  };

  // Only show in non-production environments
  if (appMetadata.environment === 'production' || dismissed) {
    return null;
  }

  return (
    <div className="bg-amber-500 text-white px-4 py-2 flex items-center justify-between gap-4 shadow-md z-50">
      <div className="flex items-center gap-2 flex-1">
        <AlertTriangle className="size-5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">
            {isDevelopment ? 'Development' : 'Staging'} Environment
          </p>
          <p className="text-xs opacity-90">
            You're viewing {appMetadata.name} v{appMetadata.version}. 
            This is not the production version.
          </p>
        </div>
      </div>
      <Button
        onClick={handleDismiss}
        variant="ghost"
        size="sm"
        className="text-white hover:bg-amber-600 flex-shrink-0"
      >
        <X className="size-4" />
        <span className="sr-only">Dismiss</span>
      </Button>
    </div>
  );
}
