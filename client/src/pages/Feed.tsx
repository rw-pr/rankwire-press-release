import { trpc } from "@/lib/trpc";
import { useEffect } from "react";

export default function Feed() {
  const { data, isLoading } = trpc.rss.publicFeed.useQuery();

  useEffect(() => {
    if (data?.rssContent) {
      // Set the content type and serve the RSS XML
      const blob = new Blob([data.rssContent], { type: 'application/rss+xml' });
      const url = URL.createObjectURL(blob);
      window.location.href = url;
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading RSS feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-bold mb-4">RSS Feed</h1>
        <p className="text-muted-foreground mb-4">
          This is the RSS feed endpoint. Subscribe to this URL in your RSS reader.
        </p>
        {data?.rssContent && (
          <pre className="text-left bg-muted p-4 rounded-lg overflow-auto max-h-96 text-xs">
            {data.rssContent}
          </pre>
        )}
      </div>
    </div>
  );
}

