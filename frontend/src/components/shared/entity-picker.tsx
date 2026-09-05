"use client";
import { useCallback, useId, useState } from "react";
import { projectsApi } from "@/services/projects.api";
import { usersApi } from "@/services/users.api";
import { useResource } from "@/lib/use-resource";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination } from "./pagination";

export function EntityPicker({
  kind,
  value,
  onChange,
  selectedLabel,
  includeArchived = false,
  emptyLabel,
}: {
  kind: "project" | "member";
  value: string;
  onChange: (value: string) => void;
  selectedLabel?: string;
  includeArchived?: boolean;
  emptyLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<{ id: string; name: string }>();
  const id = useId();
  const loader = useCallback(async () => {
    const response =
      kind === "project"
        ? await projectsApi.getAll({
            page,
            limit: 20,
            search: search || undefined,
            isActive: includeArchived ? undefined : true,
          })
        : await usersApi.getAll({
            page,
            limit: 20,
            search: search || undefined,
            role: "TEAM_MEMBER",
          });
    return {
      data: response.data.map((item) => ({
        id: item.id,
        name:
          item.name +
          ("description" in item && !item.isActive ? " (archived)" : ""),
      })),
      meta: response.meta,
    };
  }, [kind, page, search, includeArchived]);
  const { data, loading, error, reload } = useResource(loader);
  const choose = (option?: { id: string; name: string }) => {
    setSelected(option);
    onChange(option?.id || "");
    setOpen(false);
  };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start overflow-hidden text-ellipsis"
          aria-label={`Select ${kind}`}
        >
          {value
            ? selected?.id === value
              ? selected.name
              : selectedLabel || `Selected ${kind}`
            : emptyLabel}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 max-w-[calc(100vw-2rem)] space-y-3"
        align="start"
      >
        <label htmlFor={id} className="text-sm font-medium">
          Search {kind === "project" ? "projects" : "members"}
        </label>
        <Input
          id={id}
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Search by name"
        />
        <div className="max-h-64 space-y-1 overflow-auto">
          <Button
            type="button"
            variant="ghost"
            className="w-full justify-start"
            onClick={() => choose()}
          >
            {emptyLabel}
          </Button>
          {loading ? (
            <p className="p-2 text-sm">Loading…</p>
          ) : error ? (
            <div>
              <p role="alert">{error}</p>
              <Button type="button" onClick={reload}>
                Retry
              </Button>
            </div>
          ) : data?.data.length ? (
            data.data.map((option) => (
              <Button
                key={option.id}
                type="button"
                variant={value === option.id ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => choose(option)}
              >
                {option.name}
              </Button>
            ))
          ) : (
            <p className="p-2 text-sm">No matches.</p>
          )}
        </div>
        {data && <Pagination meta={data.meta} onPage={setPage} />}
      </PopoverContent>
    </Popover>
  );
}
