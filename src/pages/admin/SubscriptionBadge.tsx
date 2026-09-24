import { Badge } from '@/components/ui/badge';
import { SUBSCRIPTION_VARIANT, subscriptionLabel, type SubscriptionState } from './subscription';

/** Coloured badge for a monitoring period: scheduled, active, expiring, ending this week or expired. */
export function SubscriptionBadge({ state, className }: { state: SubscriptionState; className?: string }) {
  return (
    <Badge variant={SUBSCRIPTION_VARIANT[state.status]} className={className}>
      {subscriptionLabel(state)}
    </Badge>
  );
}
