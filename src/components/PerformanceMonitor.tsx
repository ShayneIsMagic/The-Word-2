'use client';

import { useEffect, useState } from 'react';
import { useServiceWorker } from '@/hooks/useServiceWorker';
import { WifiIcon, SignalSlashIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface PerformanceMetrics {
  loadTime: number;
  memoryUsage: number;
  isOnline: boolean;
  isInstalled: boolean;
}

export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    memoryUsage: 0,
    isOnline: true,
    isInstalled: false,
  });
  const [showDetails, setShowDetails] = useState(false);
  const { isOnline, isInstalled } = useServiceWorker();

  useEffect(() => {
    // Measure page load time
    if (typeof window !== 'undefined') {
      const loadTime = performance.now();
      setMetrics(prev => ({ ...prev, loadTime }));

                    // Monitor memory usage (if available)
       if ('memory' in performance) {
         const memory = (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory;
         if (memory) {
           setMetrics(prev => ({ 
             ...prev, 
             memoryUsage: memory.usedJSHeapSize / 1024 / 1024 // Convert to MB
           }));
         }
       }

      // Update online status
      setMetrics(prev => ({ ...prev, isOnline, isInstalled }));
    }
  }, [isOnline, isInstalled]);

     const getPerformanceColor = (loadTime: number) => {
     if (loadTime < 1000) return 'text-lds-green-600 dark:text-lds-green-400';
     if (loadTime < 3000) return 'text-yellow-600 dark:text-yellow-400';
     return 'text-lds-600 dark:text-lds-400';
   };

     const getMemoryColor = (memory: number) => {
     if (memory < 50) return 'text-lds-green-600 dark:text-lds-green-400';
     if (memory < 100) return 'text-yellow-600 dark:text-yellow-400';
     return 'text-lds-600 dark:text-lds-400';
   };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center space-x-2 mb-2">
          <CheckCircleIcon className="h-4 w-4 text-lds-green-600 dark:text-lds-green-400" />
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            Performance
          </span>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            {showDetails ? 'Hide' : 'Show'}
          </button>
        </div>

        {showDetails && (
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Load Time:</span>
              <span className={getPerformanceColor(metrics.loadTime)}>
                {metrics.loadTime.toFixed(0)}ms
              </span>
            </div>
            
            {metrics.memoryUsage > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Memory:</span>
                <span className={getMemoryColor(metrics.memoryUsage)}>
                  {metrics.memoryUsage.toFixed(1)}MB
                </span>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Status:</span>
              <div className="flex items-center space-x-1">
                                 {metrics.isOnline ? (
                   <WifiIcon className="h-3 w-3 text-lds-green-600 dark:text-lds-green-400" />
                 ) : (
                   <SignalSlashIcon className="h-3 w-3 text-lds-600 dark:text-lds-400" />
                 )}
                 <span className={metrics.isOnline ? 'text-lds-green-600 dark:text-lds-green-400' : 'text-lds-600 dark:text-lds-400'}>
                  {metrics.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
            
            {metrics.isInstalled && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">PWA:</span>
                <span className="text-lds-green-600 dark:text-lds-green-400">Installed</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 