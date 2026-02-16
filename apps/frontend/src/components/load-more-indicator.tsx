import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";

type LoadMoreIndicatorProps = {
  isLoading: boolean;
  hasNextPage?: boolean;
  hasItems?: boolean;
  loadingLabel?: string;
  endLabel?: string;
};

export function LoadMoreIndicator({
  isLoading,
  hasNextPage,
  hasItems = false,
  loadingLabel = "Loading more...",
  endLabel,
}: LoadMoreIndicatorProps) {
  if (isLoading) {
    return (
      <Badge
        variant='secondary'
        className='flex items-center gap-2'
      >
        <Spinner className='h-3 w-3' />
        {loadingLabel}
      </Badge>
    );
  }

  if (endLabel && hasNextPage === false && hasItems) {
    return <p className='text-sm text-muted-foreground'>{endLabel}</p>;
  }

  return null;
}
