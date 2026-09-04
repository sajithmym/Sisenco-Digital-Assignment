"use client";

import { useEffect, useState } from "react";
import { usersApi } from "@/services/users.api";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { USER_ROLE_LABELS } from "@/constants";
import { PAGINATION_SETTINGS } from "@/lib/settings";
import type { User, PaginatedResponse } from "@/types";

export default function ManagerUsersPage() {
  const [data, setData] = useState<PaginatedResponse<User> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await usersApi.getAll({ page: PAGINATION_SETTINGS.defaultPage, limit: PAGINATION_SETTINGS.managerListLimit });
      setData(result);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (userId: string, isActive: boolean) => {
    try {
      await usersApi.updateStatus(userId, !isActive);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update user");
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={fetchUsers} />;

  const users = data?.data || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="Manage team members and their roles"
      />

      <div className="space-y-3">
        {users.map((user) => (
          <Card key={user.id}>
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <div className="flex gap-2 mt-1">
                  <Badge variant={user.role === "MANAGER" ? "default" : "secondary"}>
                    {USER_ROLE_LABELS[user.role] || user.role}
                  </Badge>
                  <Badge variant={user.isActive ? "success" : "destructive"}>
                    {user.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {user._count?.reports || 0} reports
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleStatus(user.id, user.isActive)}
                >
                  {user.isActive ? "Deactivate" : "Activate"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
