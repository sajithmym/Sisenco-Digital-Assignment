"use client";
import { useEffect, useState } from "react";

/** Ignore stale responses when filters change or the view unmounts. */
export function useResource<T>(loader: () => Promise<T>) {
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState<{
    loader: typeof loader;
    revision: number;
    data?: T;
    error?: string;
  }>();
  useEffect(() => {
    let active = true;
    loader().then(
      (data) => {
        if (active) setState({ loader, revision, data });
      },
      (error) => {
        if (active)
          setState({
            loader,
            revision,
            error:
              error?.response?.data?.message ||
              error?.message ||
              "Could not load data.",
          });
      },
    );
    return () => {
      active = false;
    };
  }, [loader, revision]);
  const current = state?.loader === loader && state?.revision === revision;
  return {
    data: current ? state.data : undefined,
    error: current ? state.error : undefined,
    loading: !current,
    reload: () => setRevision((value) => value + 1),
  };
}
