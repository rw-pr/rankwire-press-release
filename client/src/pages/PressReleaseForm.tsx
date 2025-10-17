import DashboardLayout from "@/components/DashboardLayout";
import TiptapEditor from "@/components/TiptapEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export default function PressReleaseForm() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/press-releases/:id/edit");
  const isEdit = !!params?.id;

  const [formData, setFormData] = useState({
    entityId: "",
    headline: "",
    subheadline: "",
    datelineCity: "",
    datelineState: "",
    datelineDate: "",
    leadParagraph: "",
    bodyContent: "",
    boilerplate: "",
    callToAction: "",
    mediaContactName: "",
    mediaContactTitle: "",
    mediaContactEmail: "",
    mediaContactPhone: "",
    mediaContactWebsite: "",
    authorName: "",
    authorTitle: "",
    authorCompany: "",
    authorEmail: "",
    authorSocialHandle: "",
    metaTitle: "",
    metaDescription: "",
    keywords: "",
  });

  const { data: entities } = trpc.entities.list.useQuery();
  const { data: pressRelease, isLoading } = trpc.pressReleases.get.useQuery(
    { id: params?.id || "" },
    { enabled: isEdit }
  );

  const utils = trpc.useUtils();
  const createMutation = trpc.pressReleases.create.useMutation({
    onSuccess: () => {
      utils.pressReleases.list.invalidate();
      toast.success("Press release created successfully");
      setLocation("/press-releases");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create press release");
    },
  });

  const updateMutation = trpc.pressReleases.update.useMutation({
    onSuccess: () => {
      utils.pressReleases.list.invalidate();
      toast.success("Press release updated successfully");
      setLocation("/press-releases");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update press release");
    },
  });

  const publishMutation = trpc.pressReleases.publish.useMutation({
    onSuccess: () => {
      utils.pressReleases.list.invalidate();
      toast.success("Press release published successfully");
      setLocation("/press-releases");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to publish press release");
    },
  });

  useEffect(() => {
    if (pressRelease) {
      setFormData({
        entityId: pressRelease.entityId || "",
        headline: pressRelease.headline || "",
        subheadline: pressRelease.subheadline || "",
        datelineCity: pressRelease.datelineCity || "",
        datelineState: pressRelease.datelineState || "",
        datelineDate: pressRelease.datelineDate ? new Date(pressRelease.datelineDate).toISOString().split('T')[0] : "",
        leadParagraph: pressRelease.leadParagraph || "",
        bodyContent: pressRelease.bodyContent || "",
        boilerplate: pressRelease.boilerplate || "",
        callToAction: pressRelease.callToAction || "",
        mediaContactName: pressRelease.mediaContactName || "",
        mediaContactTitle: pressRelease.mediaContactTitle || "",
        mediaContactEmail: pressRelease.mediaContactEmail || "",
        mediaContactPhone: pressRelease.mediaContactPhone || "",
        mediaContactWebsite: pressRelease.mediaContactWebsite || "",
        authorName: pressRelease.authorName || "",
        authorTitle: pressRelease.authorTitle || "",
        authorCompany: pressRelease.authorCompany || "",
        authorEmail: pressRelease.authorEmail || "",
        authorSocialHandle: pressRelease.authorSocialHandle || "",
        metaTitle: pressRelease.metaTitle || "",
        metaDescription: pressRelease.metaDescription || "",
        keywords: pressRelease.keywords || "",
      });
    }
  }, [pressRelease]);

  const handleSubmit = (e: React.FormEvent, publish = false) => {
    e.preventDefault();
    
    if (!formData.headline.trim()) {
      toast.error("Headline is required");
      return;
    }

    if (formData.headline.length > 70) {
      toast.error("Headline must be 70 characters or less");
      return;
    }

    if (formData.subheadline && formData.subheadline.length > 120) {
      toast.error("Subheadline must be 120 characters or less");
      return;
    }

    const data = {
      ...formData,
      datelineDate: formData.datelineDate ? new Date(formData.datelineDate) : undefined,
    };

    if (isEdit && params?.id) {
      if (publish) {
        publishMutation.mutate({ id: params.id });
      } else {
        updateMutation.mutate({ id: params.id, ...data });
      }
    } else {
      createMutation.mutate(data);
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
      <div className="max-w-5xl space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/press-releases")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {isEdit ? "Edit Press Release" : "New Press Release"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isEdit ? "Update press release information" : "Create a new press release"}
            </p>
          </div>
        </div>

        <form onSubmit={(e) => handleSubmit(e, false)}>
          <div className="space-y-6">
            {/* Entity Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Entity</CardTitle>
                <CardDescription>Select the company or brand for this press release</CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={formData.entityId} onValueChange={(value) => handleChange("entityId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an entity" />
                  </SelectTrigger>
                  <SelectContent>
                    {entities?.map((entity) => (
                      <SelectItem key={entity.id} value={entity.id}>
                        {entity.companyName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Core Content */}
            <Card>
              <CardHeader>
                <CardTitle>Core Content</CardTitle>
                <CardDescription>Main press release information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="headline">Headline * (max 70 characters)</Label>
                  <Input
                    id="headline"
                    value={formData.headline}
                    onChange={(e) => handleChange("headline", e.target.value)}
                    placeholder="Acme Corp Unveils AI-Powered Thermostat to Cut Energy Bills"
                    maxLength={70}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.headline.length}/70 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subheadline">Subheadline (max 120 characters)</Label>
                  <Input
                    id="subheadline"
                    value={formData.subheadline}
                    onChange={(e) => handleChange("subheadline", e.target.value)}
                    placeholder="New platform improves delivery efficiency by up to 30 percent"
                    maxLength={120}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.subheadline.length}/120 characters
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="datelineCity">Dateline City</Label>
                    <Input
                      id="datelineCity"
                      value={formData.datelineCity}
                      onChange={(e) => handleChange("datelineCity", e.target.value)}
                      placeholder="NEW YORK"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="datelineState">Dateline State</Label>
                    <Input
                      id="datelineState"
                      value={formData.datelineState}
                      onChange={(e) => handleChange("datelineState", e.target.value)}
                      placeholder="NY"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="datelineDate">Dateline Date</Label>
                    <Input
                      id="datelineDate"
                      type="date"
                      value={formData.datelineDate}
                      onChange={(e) => handleChange("datelineDate", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="leadParagraph">Lead Paragraph</Label>
                  <Textarea
                    id="leadParagraph"
                    value={formData.leadParagraph}
                    onChange={(e) => handleChange("leadParagraph", e.target.value)}
                    placeholder="Covers Who, What, When, Where, Why in 1-2 direct sentences"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Body Content (400-600 words recommended)</Label>
                  <TiptapEditor
                    content={formData.bodyContent}
                    onChange={(content) => handleChange("bodyContent", content)}
                    placeholder="Write the main body of your press release here..."
                    minWords={400}
                    maxWords={600}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="boilerplate">Boilerplate</Label>
                  <Textarea
                    id="boilerplate"
                    value={formData.boilerplate}
                    onChange={(e) => handleChange("boilerplate", e.target.value)}
                    placeholder="About [Company] - Brief company description (no marketing fluff)"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="callToAction">Call to Action (Optional)</Label>
                  <Textarea
                    id="callToAction"
                    value={formData.callToAction}
                    onChange={(e) => handleChange("callToAction", e.target.value)}
                    placeholder="Visit www.example.com/demo to learn more"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Media Contact */}
            <Card>
              <CardHeader>
                <CardTitle>Media Contact (Optional)</CardTitle>
                <CardDescription>Contact information for media inquiries</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="mediaContactName">Name</Label>
                    <Input
                      id="mediaContactName"
                      value={formData.mediaContactName}
                      onChange={(e) => handleChange("mediaContactName", e.target.value)}
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mediaContactTitle">Title</Label>
                    <Input
                      id="mediaContactTitle"
                      value={formData.mediaContactTitle}
                      onChange={(e) => handleChange("mediaContactTitle", e.target.value)}
                      placeholder="PR Manager"
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="mediaContactEmail">Email</Label>
                    <Input
                      id="mediaContactEmail"
                      type="email"
                      value={formData.mediaContactEmail}
                      onChange={(e) => handleChange("mediaContactEmail", e.target.value)}
                      placeholder="media@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mediaContactPhone">Phone</Label>
                    <Input
                      id="mediaContactPhone"
                      value={formData.mediaContactPhone}
                      onChange={(e) => handleChange("mediaContactPhone", e.target.value)}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mediaContactWebsite">Website</Label>
                  <Input
                    id="mediaContactWebsite"
                    type="url"
                    value={formData.mediaContactWebsite}
                    onChange={(e) => handleChange("mediaContactWebsite", e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Author & Metadata */}
            <Card>
              <CardHeader>
                <CardTitle>Author & Metadata</CardTitle>
                <CardDescription>Attribution and SEO information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="authorName">Author Name</Label>
                    <Input
                      id="authorName"
                      value={formData.authorName}
                      onChange={(e) => handleChange("authorName", e.target.value)}
                      placeholder="Jane Smith"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="authorTitle">Author Title</Label>
                    <Input
                      id="authorTitle"
                      value={formData.authorTitle}
                      onChange={(e) => handleChange("authorTitle", e.target.value)}
                      placeholder="Content Manager"
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="authorCompany">Author Company</Label>
                    <Input
                      id="authorCompany"
                      value={formData.authorCompany}
                      onChange={(e) => handleChange("authorCompany", e.target.value)}
                      placeholder="Acme Corp"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="authorEmail">Author Email</Label>
                    <Input
                      id="authorEmail"
                      type="email"
                      value={formData.authorEmail}
                      onChange={(e) => handleChange("authorEmail", e.target.value)}
                      placeholder="author@example.com"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="authorSocialHandle">Author Social Handle</Label>
                  <Input
                    id="authorSocialHandle"
                    value={formData.authorSocialHandle}
                    onChange={(e) => handleChange("authorSocialHandle", e.target.value)}
                    placeholder="@JaneSmithPR"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="metaTitle">Meta Title</Label>
                  <Input
                    id="metaTitle"
                    value={formData.metaTitle}
                    onChange={(e) => handleChange("metaTitle", e.target.value)}
                    placeholder="SEO-optimized title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea
                    id="metaDescription"
                    value={formData.metaDescription}
                    onChange={(e) => handleChange("metaDescription", e.target.value)}
                    placeholder="SEO-optimized description"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                  <Input
                    id="keywords"
                    value={formData.keywords}
                    onChange={(e) => handleChange("keywords", e.target.value)}
                    placeholder="technology, innovation, AI"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {isEdit ? "Update Draft" : "Save as Draft"}
              </Button>
              {isEdit && pressRelease?.status === "draft" && (
                <Button
                  type="button"
                  variant="default"
                  onClick={(e) => handleSubmit(e, true)}
                  disabled={publishMutation.isPending}
                >
                  Publish
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation("/press-releases")}
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

