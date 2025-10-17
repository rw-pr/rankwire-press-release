import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { FileText, Plus, Pencil, Trash2, Eye } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

const statusColors = {
  draft: "bg-gray-500",
  published: "bg-green-500",
  reporting: "bg-blue-500",
};

export default function PressReleases() {
  const { data: pressReleases, isLoading } = trpc.pressReleases.list.useQuery();
  const utils = trpc.useUtils();
  const deleteMutation = trpc.pressReleases.delete.useMutation({
    onSuccess: () => {
      utils.pressReleases.list.invalidate();
      toast.success("Press release deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete press release");
    },
  });

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this press release?")) {
      deleteMutation.mutate({ id });
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Press Releases</h1>
            <p className="text-muted-foreground mt-1">
              Manage your press releases
            </p>
          </div>
          <Link href="/press-releases/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Press Release
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2 mt-2" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : pressReleases && pressReleases.length > 0 ? (
          <div className="space-y-4">
            {pressReleases.map((pr) => (
              <Card key={pr.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="w-5 h-5 text-primary" />
                        <Badge className={statusColors[pr.status]}>
                          {pr.status}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl mb-1">{pr.headline}</CardTitle>
                      {pr.subheadline && (
                        <CardDescription className="text-base">
                          {pr.subheadline}
                        </CardDescription>
                      )}
                      <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
                        {pr.createdAt && (
                          <span>Created: {formatDate(pr.createdAt)}</span>
                        )}
                        {pr.publishedAt && (
                          <span>Published: {formatDate(pr.publishedAt)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Link href={`/press-releases/${pr.id}/view`}>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                    </Link>
                    {pr.status === "draft" && (
                      <Link href={`/press-releases/${pr.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Pencil className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      </Link>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(pr.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No press releases yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create your first press release to get started
              </p>
              <Link href="/press-releases/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Press Release
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

