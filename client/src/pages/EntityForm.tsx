import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export default function EntityForm() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/entities/:id/edit");
  const isEdit = !!params?.id;

  const [formData, setFormData] = useState({
    companyName: "",
    companyAddress: "",
    googleBusinessProfileUrl: "",
    websiteUrl: "",
    industry: "",
    prContactFirstName: "",
    prContactLastName: "",
    prEmail: "",
    facebookUrl: "",
    twitterUrl: "",
    redditUrl: "",
  });

  const { data: entity, isLoading } = trpc.entities.get.useQuery(
    { id: params?.id || "" },
    { enabled: isEdit }
  );

  const utils = trpc.useUtils();
  const createMutation = trpc.entities.create.useMutation({
    onSuccess: () => {
      utils.entities.list.invalidate();
      toast.success("Entity created successfully");
      setLocation("/entities");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create entity");
    },
  });

  const updateMutation = trpc.entities.update.useMutation({
    onSuccess: () => {
      utils.entities.list.invalidate();
      toast.success("Entity updated successfully");
      setLocation("/entities");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update entity");
    },
  });

  useEffect(() => {
    if (entity) {
      setFormData({
        companyName: entity.companyName || "",
        companyAddress: entity.companyAddress || "",
        googleBusinessProfileUrl: entity.googleBusinessProfileUrl || "",
        websiteUrl: entity.websiteUrl || "",
        industry: entity.industry || "",
        prContactFirstName: entity.prContactFirstName || "",
        prContactLastName: entity.prContactLastName || "",
        prEmail: entity.prEmail || "",
        facebookUrl: entity.facebookUrl || "",
        twitterUrl: entity.twitterUrl || "",
        redditUrl: entity.redditUrl || "",
      });
    }
  }, [entity]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.companyName.trim()) {
      toast.error("Company name is required");
      return;
    }

    if (isEdit && params?.id) {
      updateMutation.mutate({ id: params.id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isEdit && isLoading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4" />
          <Card>
            <CardHeader>
              <div className="h-6 bg-muted rounded w-1/3" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-10 bg-muted rounded" />
              ))}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/entities")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {isEdit ? "Edit Entity" : "New Entity"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isEdit ? "Update entity information" : "Add a new company or brand"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>
                Enter the details for this entity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => handleChange("companyName", e.target.value)}
                  placeholder="Acme Corporation"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  value={formData.industry}
                  onChange={(e) => handleChange("industry", e.target.value)}
                  placeholder="Technology, Healthcare, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyAddress">Company Address</Label>
                <Textarea
                  id="companyAddress"
                  value={formData.companyAddress}
                  onChange={(e) => handleChange("companyAddress", e.target.value)}
                  placeholder="123 Main St, City, State, ZIP"
                  rows={3}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="websiteUrl">Website URL</Label>
                  <Input
                    id="websiteUrl"
                    type="url"
                    value={formData.websiteUrl}
                    onChange={(e) => handleChange("websiteUrl", e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="googleBusinessProfileUrl">Google Business Profile</Label>
                  <Input
                    id="googleBusinessProfileUrl"
                    type="url"
                    value={formData.googleBusinessProfileUrl}
                    onChange={(e) => handleChange("googleBusinessProfileUrl", e.target.value)}
                    placeholder="https://g.page/..."
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-4">PR Contact</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="prContactFirstName">First Name</Label>
                    <Input
                      id="prContactFirstName"
                      value={formData.prContactFirstName}
                      onChange={(e) => handleChange("prContactFirstName", e.target.value)}
                      placeholder="John"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prContactLastName">Last Name</Label>
                    <Input
                      id="prContactLastName"
                      value={formData.prContactLastName}
                      onChange={(e) => handleChange("prContactLastName", e.target.value)}
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <Label htmlFor="prEmail">PR Email</Label>
                  <Input
                    id="prEmail"
                    type="email"
                    value={formData.prEmail}
                    onChange={(e) => handleChange("prEmail", e.target.value)}
                    placeholder="pr@example.com"
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-4">Social Media</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="facebookUrl">Facebook URL</Label>
                    <Input
                      id="facebookUrl"
                      type="url"
                      value={formData.facebookUrl}
                      onChange={(e) => handleChange("facebookUrl", e.target.value)}
                      placeholder="https://facebook.com/..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="twitterUrl">Twitter/X URL</Label>
                    <Input
                      id="twitterUrl"
                      type="url"
                      value={formData.twitterUrl}
                      onChange={(e) => handleChange("twitterUrl", e.target.value)}
                      placeholder="https://twitter.com/..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="redditUrl">Reddit URL</Label>
                    <Input
                      id="redditUrl"
                      type="url"
                      value={formData.redditUrl}
                      onChange={(e) => handleChange("redditUrl", e.target.value)}
                      placeholder="https://reddit.com/r/..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {isEdit ? "Update Entity" : "Create Entity"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/entities")}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  );
}

