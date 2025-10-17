import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Building2, Plus, Pencil, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function Entities() {
  const { data: entities, isLoading } = trpc.entities.list.useQuery();
  const utils = trpc.useUtils();
  const deleteMutation = trpc.entities.delete.useMutation({
    onSuccess: () => {
      utils.entities.list.invalidate();
      toast.success("Entity deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete entity");
    },
  });

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this entity?")) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Entities</h1>
            <p className="text-muted-foreground mt-1">
              Manage your companies and brands
            </p>
          </div>
          <Link href="/entities/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Entity
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2 mt-2" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : entities && entities.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {entities.map((entity) => (
              <Card key={entity.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{entity.companyName}</CardTitle>
                        {entity.industry && (
                          <CardDescription>{entity.industry}</CardDescription>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {entity.websiteUrl && (
                      <p className="text-muted-foreground truncate">
                        {entity.websiteUrl}
                      </p>
                    )}
                    {entity.prEmail && (
                      <p className="text-muted-foreground truncate">
                        {entity.prEmail}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Link href={`/entities/${entity.id}/edit`}>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDelete(entity.id)}
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
              <Building2 className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No entities yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create your first entity to get started with press releases
              </p>
              <Link href="/entities/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Entity
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

