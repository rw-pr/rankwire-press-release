import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useLocation, useRoute } from "wouter";
import { ArrowLeft, Pencil, Download, Send } from "lucide-react";
import { toast } from "sonner";

const statusColors = {
  draft: "bg-gray-500",
  published: "bg-green-500",
  reporting: "bg-blue-500",
};

export default function PressReleaseView() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/press-releases/:id/view");
  
  const { data, isLoading } = trpc.pressReleases.get.useQuery(
    { id: params?.id || "" },
    { enabled: !!params?.id }
  );

  const { data: rssData, refetch: generateRSS } = trpc.rss.generate.useQuery(
    { pressReleaseId: params?.id },
    { enabled: false }
  );

  const submitMutation = trpc.rss.submit.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit RSS feed");
    },
  });

  const formatDate = (date: Date | string | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateline = () => {
    if (!data) return "";
    const parts = [];
    if (data.datelineCity) parts.push(data.datelineCity);
    if (data.datelineState) parts.push(data.datelineState);
    if (data.datelineDate) parts.push(`– ${formatDate(data.datelineDate)} –`);
    return parts.join(", ");
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-4 max-w-4xl">
          <div className="h-8 bg-muted rounded w-1/4" />
          <Card>
            <CardHeader>
              <div className="h-8 bg-muted rounded w-3/4" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-muted rounded" />
              ))}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (!data) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Press release not found</h2>
          <Button onClick={() => setLocation("/press-releases")}>
            Back to Press Releases
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/press-releases")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">Press Release</h1>
              {data.prId && (
                <Badge variant="outline" className="font-mono text-base">
                  {data.prId}
                </Badge>
              )}
              <Badge className={statusColors[data.status]}>
                {data.status}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            {data.status === "draft" && (
              <Button onClick={() => setLocation(`/press-releases/${data.id}/edit`)}>
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
            {data.status === "published" && (
              <>
                <Button
                  variant="outline"
                  onClick={async () => {
                    const result = await generateRSS();
                    if (result.data?.rssContent) {
                      const blob = new Blob([result.data.rssContent], { type: "application/rss+xml" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `press-release-${data.id}.xml`;
                      a.click();
                      URL.revokeObjectURL(url);
                      toast.success("RSS feed downloaded");
                    }
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download RSS
                </Button>
                <Button
                  onClick={() => {
                    submitMutation.mutate({ pressReleaseId: data.id });
                  }}
                  disabled={submitMutation.isPending}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Submit to RSS
                </Button>
              </>
            )}
          </div>
        </div>

        <Card>
          <CardHeader className="space-y-4">
            <div>
              <CardTitle className="text-3xl mb-2">{data.headline}</CardTitle>
              {data.subheadline && (
                <p className="text-xl text-muted-foreground">{data.subheadline}</p>
              )}
            </div>
            {formatDateline() && (
              <p className="text-sm font-medium">{formatDateline()}</p>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {data.leadParagraph && (
              <div>
                <h3 className="font-semibold mb-2">Lead Paragraph</h3>
                <p className="text-muted-foreground">{data.leadParagraph}</p>
              </div>
            )}

            {data.bodyContent && (
              <div>
                <h3 className="font-semibold mb-2">Body</h3>
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: data.bodyContent }}
                />
              </div>
            )}

            {data.boilerplate && (
              <div className="border-t pt-6">
                <h3 className="font-semibold mb-2">Boilerplate</h3>
                <p className="text-muted-foreground">{data.boilerplate}</p>
              </div>
            )}

            {data.callToAction && (
              <div>
                <h3 className="font-semibold mb-2">Call to Action</h3>
                <p className="text-muted-foreground">{data.callToAction}</p>
              </div>
            )}

            {(data.mediaContactName || data.mediaContactEmail) && (
              <div className="border-t pt-6">
                <h3 className="font-semibold mb-3">Media Contact</h3>
                <div className="space-y-1 text-sm">
                  {data.mediaContactName && <p>{data.mediaContactName}</p>}
                  {data.mediaContactTitle && <p className="text-muted-foreground">{data.mediaContactTitle}</p>}
                  {data.mediaContactEmail && <p>{data.mediaContactEmail}</p>}
                  {data.mediaContactPhone && <p>{data.mediaContactPhone}</p>}
                  {data.mediaContactWebsite && (
                    <a href={data.mediaContactWebsite} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {data.mediaContactWebsite}
                    </a>
                  )}
                </div>
              </div>
            )}

            {(data.authorName || data.authorEmail) && (
              <div className="border-t pt-6">
                <h3 className="font-semibold mb-3">Author</h3>
                <div className="space-y-1 text-sm">
                  {data.authorName && <p>{data.authorName}</p>}
                  {data.authorTitle && <p className="text-muted-foreground">{data.authorTitle}</p>}
                  {data.authorCompany && <p className="text-muted-foreground">{data.authorCompany}</p>}
                  {data.authorEmail && <p>{data.authorEmail}</p>}
                  {data.authorSocialHandle && <p className="text-muted-foreground">{data.authorSocialHandle}</p>}
                </div>
              </div>
            )}

            {(data.metaTitle || data.metaDescription || data.keywords) && (
              <div className="border-t pt-6">
                <h3 className="font-semibold mb-3">SEO Metadata</h3>
                <div className="space-y-2 text-sm">
                  {data.metaTitle && (
                    <div>
                      <span className="font-medium">Meta Title:</span> {data.metaTitle}
                    </div>
                  )}
                  {data.metaDescription && (
                    <div>
                      <span className="font-medium">Meta Description:</span> {data.metaDescription}
                    </div>
                  )}
                  {data.keywords && (
                    <div>
                      <span className="font-medium">Keywords:</span> {data.keywords}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="border-t pt-6 text-sm text-muted-foreground">
              <div className="flex gap-6">
                <div>
                  <span className="font-medium">Created:</span> {formatDate(data.createdAt)}
                </div>
                {data.publishedAt && (
                  <div>
                    <span className="font-medium">Published:</span> {formatDate(data.publishedAt)}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

