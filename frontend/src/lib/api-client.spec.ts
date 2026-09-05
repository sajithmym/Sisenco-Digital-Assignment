import { beforeEach, describe, expect, it, vi } from "vitest";

const axiosMocks = vi.hoisted(() => {
  let requestHandler: ((config: Record<string, any>) => Record<string, any>) | undefined;
  let responseErrorHandler: ((error: any) => Promise<unknown>) | undefined;
  const client = Object.assign(vi.fn(), {
    defaults: { baseURL: "http://localhost:5000/api/v1" },
    interceptors: {
      request: {
        use: vi.fn((fulfilled: (config: Record<string, any>) => Record<string, any>) => {
          requestHandler = fulfilled;
          return 1;
        }),
      },
      response: {
        use: vi.fn(
          (_fulfilled: unknown, rejected: (error: any) => Promise<unknown>) => {
            responseErrorHandler = rejected;
            return 1;
          },
        ),
      },
    },
  });
  const axios = {
    create: vi.fn((config) => {
      client.defaults = config;
      return client;
    }),
    post: vi.fn(),
  };
  return {
    axios,
    client,
    request: (config: Record<string, any>) => requestHandler!(config),
    reject: (error: any) => responseErrorHandler!(error),
  };
});

vi.mock("axios", () => ({ default: axiosMocks.axios }));

import apiClient, { clearSession, setAccessToken } from "./api-client";

describe("apiClient session handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearSession();
    window.history.replaceState({}, "", "/dashboard");
  });

  it("uses JSON, browser credentials, and CSRF protection by default", () => {
    const defaults = (apiClient as unknown as { defaults: unknown }).defaults;

    expect(defaults).toMatchObject({
      baseURL: "http://localhost:5000/api/v1",
    });
    expect(defaults).toMatchObject({
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "weekly-report-web",
      },
    });
  });

  it("attaches only the in-memory access token to outgoing requests", () => {
    const config = { headers: {} as Record<string, string> };
    setAccessToken("access-token");
    expect(axiosMocks.request(config).headers.Authorization).toBe(
      "Bearer access-token",
    );

    clearSession();
    expect(axiosMocks.request({ headers: {} }).headers.Authorization).toBeUndefined();
  });

  it("refreshes once, retries a failed protected request, and updates its authorization header", async () => {
    axiosMocks.axios.post.mockResolvedValue({
      data: { data: { accessToken: "fresh-token" } },
    });
    axiosMocks.client.mockResolvedValue({ data: { data: { id: "report-1" } } });
    const originalRequest = { url: "/reports/report-1", headers: {} };

    await expect(
      axiosMocks.reject({ response: { status: 401 }, config: originalRequest }),
    ).resolves.toEqual({ data: { data: { id: "report-1" } } });

    expect(axiosMocks.axios.post).toHaveBeenCalledWith(
      "http://localhost:5000/api/v1/auth/refresh",
      undefined,
      {
        withCredentials: true,
        headers: { "X-Requested-With": "weekly-report-web" },
      },
    );
    expect(originalRequest).toMatchObject({
      _retry: true,
      headers: { Authorization: "Bearer fresh-token" },
    });
    expect(axiosMocks.client).toHaveBeenCalledWith(originalRequest);
  });

  it("shares a single refresh request between simultaneous unauthorized responses", async () => {
    let resolveRefresh!: (value: unknown) => void;
    axiosMocks.axios.post.mockReturnValue(
      new Promise((resolve) => {
        resolveRefresh = resolve;
      }),
    );
    axiosMocks.client.mockResolvedValue({ data: { data: "retried" } });

    const first = axiosMocks.reject({
      response: { status: 401 },
      config: { url: "/reports/one", headers: {} },
    });
    const second = axiosMocks.reject({
      response: { status: 401 },
      config: { url: "/reports/two", headers: {} },
    });
    expect(axiosMocks.axios.post).toHaveBeenCalledOnce();

    resolveRefresh({ data: { data: { accessToken: "shared-token" } } });
    await expect(Promise.all([first, second])).resolves.toHaveLength(2);
    expect(axiosMocks.client).toHaveBeenCalledTimes(2);
  });

  it("does not refresh login, registration, refresh, logout, or already retried requests", async () => {
    const errors = [
      { response: { status: 401 }, config: { url: "/auth/login", headers: {} } },
      { response: { status: 401 }, config: { url: "/auth/register", headers: {} } },
      { response: { status: 401 }, config: { url: "/auth/refresh", headers: {} } },
      { response: { status: 401 }, config: { url: "/auth/logout", headers: {} } },
      { response: { status: 401 }, config: { url: "/reports", _retry: true, headers: {} } },
    ];

    for (const error of errors)
      await expect(axiosMocks.reject(error)).rejects.toBe(error);
    expect(axiosMocks.axios.post).not.toHaveBeenCalled();
  });

  it("clears the access token when refresh fails", async () => {
    setAccessToken("old-token");
    window.history.replaceState({}, "", "/login");
    axiosMocks.axios.post.mockRejectedValue(new Error("refresh expired"));

    await expect(
      axiosMocks.reject({ response: { status: 401 }, config: { url: "/reports", headers: {} } }),
    ).rejects.toThrow("refresh expired");

    expect(axiosMocks.request({ headers: {} }).headers.Authorization).toBeUndefined();
  });
});
