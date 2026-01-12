import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

interface FlashcardsLoadingSkeletonProps {
  count?: number;
}

/**
 * Loading skeleton component for flashcards list
 * Displays animated placeholders while data is being fetched
 */
export default function FlashcardsLoadingSkeleton({ count = 5 }: FlashcardsLoadingSkeletonProps) {
  return (
    <div className="space-y-4" role="status" aria-label="Loading flashcards">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="bg-card">
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-4">
              {/* Header with source badge */}
              <div className="flex items-start justify-between gap-4">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-9 w-20" />
              </div>

              {/* Front text */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-5 w-full" />
              </div>

              {/* Divider */}
              <div className="h-px bg-border" />

              {/* Back text */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-20 w-full" />
              </div>

              {/* Metadata */}
              <div className="flex justify-between items-center">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      <span className="sr-only">Loading flashcards...</span>
    </div>
  );
}
