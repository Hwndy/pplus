import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/api-client';

interface Options<TVars, TResult> {
  mutationFn: (vars: TVars) => Promise<TResult>;
  successMessage?: string | ((result: TResult, vars: TVars) => string);
  /** Query keys (prefixes) to refetch after success. */
  invalidate?: QueryKey[];
  onSuccess?: (result: TResult, vars: TVars) => void;
}

/**
 * Mutation that reports success/failure with a toast and refreshes the
 * affected queries — the single pattern for every create/update/delete.
 * The error is re-thrown so forms and dialogs can react (stay open, map field errors).
 */
export function useMutationWithToast<TVars = void, TResult = unknown>({
  mutationFn, successMessage, invalidate = [], onSuccess,
}: Options<TVars, TResult>) {
  const queryClient = useQueryClient();
  return useMutation<TResult, Error, TVars>({
    mutationFn,
    onSuccess: async (result, vars) => {
      await Promise.all(invalidate.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
      if (successMessage) toast.success(typeof successMessage === 'function' ? successMessage(result, vars) : successMessage);
      onSuccess?.(result, vars);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
