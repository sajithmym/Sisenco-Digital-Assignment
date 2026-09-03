"use client";

import { useEffect, useState } from "react";
import { projectsApi } from "@/services/projects.api";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import type { Project, PaginatedResponse } from "@/types";

export default function ManagerProjectsPage() {
  const [data, setData] = useState<PaginatedResponse<Project> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", description: "" });
  const [creating, setCreating] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await projectsApi.getAll({ page: 1, limit: 50 });
      setData(result);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async () => {
    if (!newProject.name.trim()) return;
    setCreating(true);
    try {
      await projectsApi.create(newProject);
      setNewProject({ name: "", description: "" });
      setDialogOpen(false);
      fetchProjects();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to create project");
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={fetchProjects} />;

  const projects = data?.data || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Project Management"
        description="Manage projects and their status"
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Project</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={newProject.name}
                    onChange={(e) =>
                      setNewProject({ ...newProject, name: e.target.value })
                    }
                    placeholder="Project name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={newProject.description}
                    onChange={(e) =>
                      setNewProject({ ...newProject, description: e.target.value })
                    }
                    placeholder="Project description"
                  />
                </div>
                <Button onClick={handleCreate} disabled={creating}>
                  {creating ? "Creating..." : "Create"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="space-y-3">
        {projects.map((project) => (
          <Card key={project.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{project.name}</p>
                {project.description && (
                  <p className="text-sm text-muted-foreground">
                    {project.description}
                  </p>
                )}
              </div>
              <Badge variant={project.isActive ? "success" : "secondary"}>
                {project.isActive ? "Active" : "Inactive"}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
