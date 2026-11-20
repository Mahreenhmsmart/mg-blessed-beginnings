import { useEffect, useRef } from 'react';
import { WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { initConnectionListener, verifyConnection } from '@/store/slices/connectionSlice';
import { cn } from '@/utils/cn';

export default function ConnectionBanner() {
  const dispatch = useAppDispatch();
  const { isConnected, isReconnecting, lastFailedEndpoint } = useAppSelector(
    (s) => s.connection,
  );
  const prevConnectedRef = useRef(isConnected);

  // Subscribe to apiClient connection state events once on mount
  useEffect(() => {
    initConnectionListener(dispatch);
  }, [dispatch]);

  // Auto-dismiss when connectivity is restored (animate out after brief confirmation)
  const justRestored = !isConnected ? false : prevConnectedRef.current === false;
  useEffect(() => {
    prevConnectedRef.current = isConnected;
  }, [isConnected]);

  const handleRetry = () => {
    dispatch(verifyConnection());
  };

  // Show banner when disconnected or briefly after reconnection as confirmation
  if (isConnected && !justRestored) return null;

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 z-[60] flex items-center justify-center gap-3 px-4 py-2.5 text-sm font-medium shadow-md transition-all duration-300',
        isConnected
          ? 'bg-success/10 text-success border-b border-success/20'
          : 'bg-destructive/10 text-destructive border-b border-destructive/20',
      )}
      role="alert"
      data-icod-id="src_components_connectionbanner_tsx_5f18">
      {isConnected ? (
        <>
          <CheckCircle2
            className="h-4 w-4 shrink-0"
            data-icod-id="src_components_connectionbanner_tsx_eb1e" />
          <span data-icod-id="src_components_connectionbanner_tsx_21d5">Connection restored</span>
        </>
      ) : (
        <>
          <WifiOff
            className="h-4 w-4 shrink-0"
            data-icod-id="src_components_connectionbanner_tsx_b169" />
          <span
            className="text-center"
            data-icod-id="src_components_connectionbanner_tsx_4317">
            Backend connection lost{lastFailedEndpoint ? ` (${lastFailedEndpoint})` : ''}.
            Attempting to reconnect...
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRetry}
            loading={isReconnecting}
            className="shrink-0 h-7 text-xs"
            data-icod-id="src_components_connectionbanner_tsx_4783">
            {!isReconnecting && <RefreshCw
              className="mr-1.5 h-3 w-3"
              data-icod-id="src_components_connectionbanner_tsx_98e8" />}
            Retry
          </Button>
        </>
      )}
    </div>
  );
}
