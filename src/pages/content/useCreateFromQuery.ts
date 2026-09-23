import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Opens a page's create dialog when it is visited with `?new=1` (quick actions
 * on the dashboard link here), then removes the parameter from the URL.
 */
export function useCreateFromQuery(enabled: boolean, open: () => void) {
  const [searchParams, setSearchParams] = useSearchParams();
  const openRef = useRef(open);
  openRef.current = open;

  useEffect(() => {
    if (searchParams.get('new') !== '1') return;
    if (enabled) openRef.current();
    const next = new URLSearchParams(searchParams);
    next.delete('new');
    setSearchParams(next, { replace: true });
  }, [enabled, searchParams, setSearchParams]);
}
