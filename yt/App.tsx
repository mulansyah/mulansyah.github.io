import React, { useCallback, useMemo, useRef, useState } from "react";

const BASE_URL =
  "https://zdfhtdpvzkiagpzxkrdw.supabase.co/functions/v1/yt-storyboard";

const TOTAL_TESTS = 28;

type TestStatus =
  | "PASS"
  | "FAIL"
  | "BLOCKED"
  | "RUNNING"
  | "SKIPPED"
  | "IDLE";

type TestResult = {
  id: number;
  name: string;
  method: string;
  endpoint: string;
  expected: string;
  actual?: number;
  status: TestStatus;
  request?: unknown;
  response?: unknown;
  error?: string;
  assertion?: string;
};

type ApiResult = {
  status: number;
  data: unknown;
  raw: string;
};

type TestContext = {
  prefix: string;

  projectA?: string;
  projectB?: string;
  projectC?: string;
  projectD?: string;
  projectE?: string;

  sceneA1?: string;
  sceneA2?: string;
  sceneA3?: string;

  sceneB1?: string;

  assetA1?: string;
  assetA2?: string;
  assetA3?: string;
  assetB1?: string;

  consistencyA?: string;
};

type CleanupResult = {
  label: string;
  ok: boolean;
  error?: string;
};

const initialContext = (): TestContext => ({
  prefix: "",
});

function makePrefix() {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);

  return `contract-v4-${Date.now()}-${random}`;
}

function extractId(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;

  const d = data as Record<string, any>;

  return (
    d.id ??
    d.project_id ??
    d.projectId ??
    d.scene_id ??
    d.sceneId ??
    d.asset_id ??
    d.assetId ??
    d.consistency_id ??
    d.consistencyId ??
    d.project?.id ??
    d.scene?.id ??
    d.asset?.id ??
    d.consistency?.id
  );
}

function getErrorMessage(data: unknown, raw: string) {
  if (data && typeof data === "object") {
    const d = data as Record<string, any>;

    return (
      d.error?.message ??
      d.message ??
      d.error ??
      d.details ??
      d.code ??
      raw
    );
  }

  return raw || "Unknown error";
}

function hasErrorCode(data: unknown, code: string) {
  if (!data || typeof data !== "object") return false;

  const d = data as Record<string, any>;

  return (
    d.code === code ||
    d.error_code === code ||
    d.error?.code === code ||
    d.error?.error_code === code
  );
}

function getScenesFromResponse(data: unknown): any[] {
  if (Array.isArray(data)) return data;

  if (!data || typeof data !== "object") return [];

  const d = data as Record<string, any>;

  if (Array.isArray(d.scenes)) return d.scenes;
  if (Array.isArray(d.data)) return d.data;
  if (Array.isArray(d.storyboard?.scenes)) return d.storyboard.scenes;
  if (Array.isArray(d.project?.scenes)) return d.project.scenes;

  return [];
}

function getTotalDuration(data: unknown): number | undefined {
  if (!data || typeof data !== "object") return undefined;

  const d = data as Record<string, any>;

  return (
    d.total_duration_seconds ??
    d.totalDurationSeconds ??
    d.storyboard?.total_duration_seconds ??
    d.storyboard?.totalDurationSeconds ??
    d.project?.total_duration_seconds ??
    d.project?.target_duration_seconds
  );
}

function normalizePath(path: string) {
  return path.startsWith("/") ? path : `/${path}`;
}

function App() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState<
    "Idle" | "Running" | "Cleaning Up" | "Completed" | "Failed"
  >("Idle");

  const [connection, setConnection] = useState<
    "Unknown" | "Online" | "Blocked"
  >("Unknown");

  const [logs, setLogs] = useState<string[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [cleanup, setCleanup] = useState<CleanupResult[]>([]);
  const [cleanupRan, setCleanupRan] = useState(false);
  const [cleanupFailed, setCleanupFailed] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const contextRef = useRef<TestContext>(initialContext());

  const addLog = useCallback((message: string) => {
    const time = new Date().toLocaleTimeString([], {
      hour12: false,
    });

    setLogs((prev) => [...prev, `${time} ${message}`]);
  }, []);

  const updateResult = useCallback(
    (id: number, patch: Partial<TestResult>) => {
      setResults((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
      );
    },
    []
  );

  const api = useCallback(
    async (
      method: string,
      path: string,
      body?: unknown
    ): Promise<ApiResult> => {
      const controller = abortRef.current;

      const response = await fetch(`${BASE_URL}${normalizePath(path)}`, {
        method,
        headers:
          body === undefined
            ? {}
            : {
                "Content-Type": "text/plain;charset=UTF-8",
              },
        body:
          body === undefined
            ? undefined
            : JSON.stringify(body),
        signal: controller?.signal,
      });

      const raw = await response.text();

      let data: unknown = null;

      if (raw) {
        try {
          data = JSON.parse(raw);
        } catch {
          data = raw;
        }
      }

      setConnection("Online");

      return {
        status: response.status,
        data,
        raw,
      };
    },
    []
  );

  const runRequest = useCallback(
    async (
      id: number,
      method: string,
      endpoint: string,
      expected: string,
      body?: unknown,
      assertion?: (result: ApiResult) => {
        ok: boolean;
        message: string;
      }
    ) => {
      updateResult(id, {
        status: "RUNNING",
        method,
        endpoint,
        expected,
        request: body,
      });

      addLog(`${method} ${endpoint}`);

      try {
        const result = await api(method, endpoint, body);

        const statusMatches =
          String(result.status) === String(expected);

        let assertionResult = {
          ok: true,
          message: `HTTP ${result.status} matched expected ${expected}`,
        };

        if (assertion) {
          assertionResult = assertion(result);
        }

        const ok = statusMatches && assertionResult.ok;

        updateResult(id, {
          actual: result.status,
          response: result.data,
          status: ok ? "PASS" : "FAIL",
          error: ok
            ? undefined
            : getErrorMessage(result.data, result.raw),
          assertion: assertionResult.message,
        });

        addLog(
          `${ok ? "PASS" : "FAIL"} #${id} ${method} ${endpoint} → ${
            result.status
          }`
        );

        return {
          kind: ok ? ("PASS" as const) : ("FAIL" as const),
          result,
        };
      } catch (error) {
        const isAbort =
          error instanceof DOMException &&
          error.name === "AbortError";

        setConnection("Blocked");

        updateResult(id, {
          status: "BLOCKED",
          error: isAbort
            ? "Request aborted by Stop."
            : error instanceof Error
            ? error.message
            : String(error),
          assertion:
            "HTTP request could not be executed in the browser runtime.",
        });

        addLog(`BLOCKED #${id} ${method} ${endpoint}`);

        return {
          kind: "BLOCKED" as const,
          result: undefined,
        };
      }
    },
    [addLog, api, updateResult]
  );

  const tests = useMemo<TestResult[]>(
    () => [
      {
        id: 1,
        name: "Root endpoint",
        method: "GET",
        endpoint: "/",
        expected: "200",
        status: "IDLE",
      },
      {
        id: 2,
        name: "List projects",
        method: "GET",
        endpoint: "/projects",
        expected: "200",
        status: "IDLE",
      },
      {
        id: 3,
        name: "Reject invalid project duration",
        method: "POST",
        endpoint: "/projects",
        expected: "400",
        status: "IDLE",
      },
      {
        id: 4,
        name: "Create Project A",
        method: "POST",
        endpoint: "/projects",
        expected: "201",
        status: "IDLE",
      },
      {
        id: 5,
        name: "Create Project B",
        method: "POST",
        endpoint: "/projects",
        expected: "201",
        status: "IDLE",
      },
      {
        id: 6,
        name: "Get Project A",
        method: "GET",
        endpoint: "",
        expected: "200",
        status: "IDLE",
      },
      {
        id: 7,
        name: "Reject invalid timing",
        method: "POST",
        endpoint: "",
        expected: "400",
        status: "IDLE",
      },
      {
        id: 8,
        name: "Create Scene A1",
        method: "POST",
        endpoint: "",
        expected: "201",
        status: "IDLE",
      },
      {
        id: 9,
        name: "Create Scene A2",
        method: "POST",
        endpoint: "",
        expected: "201",
        status: "IDLE",
      },
      {
        id: 10,
        name: "Scene-total-duration invariant",
        method: "POST",
        endpoint: "",
        expected: "400",
        status: "IDLE",
      },
      {
        id: 11,
        name: "Cross-project scene isolation",
        method: "GET",
        endpoint: "",
        expected: "409",
        status: "IDLE",
      },
      {
        id: 12,
        name: "Create Scene B1",
        method: "POST",
        endpoint: "",
        expected: "201",
        status: "IDLE",
      },
      {
        id: 13,
        name: "Create generated image asset",
        method: "POST",
        endpoint: "",
        expected: "201",
        status: "IDLE",
      },
      {
        id: 14,
        name: "Reject cross-project generated image",
        method: "PATCH",
        endpoint: "",
        expected: "409",
        status: "IDLE",
      },
      {
        id: 15,
        name: "Reject wrong generated-image asset type",
        method: "POST",
        endpoint: "",
        expected: "409",
        status: "IDLE",
      },
      {
        id: 16,
        name: "Create valid consistency reference",
        method: "POST",
        endpoint: "",
        expected: "201",
        status: "IDLE",
      },
      {
        id: 17,
        name: "Reject cross-project consistency reference",
        method: "POST",
        endpoint: "",
        expected: "409",
        status: "IDLE",
      },
      {
        id: 18,
        name: "Complete Project A scene set",
        method: "POST/PATCH",
        endpoint: "/projects/:projectA/scenes + assets",
        expected: "201/200",
        status: "IDLE",
      },
      {
        id: 19,
        name: "Complete storyboard",
        method: "POST",
        endpoint: "",
        expected: "200",
        status: "IDLE",
      },
      {
        id: 20,
        name: "Get complete storyboard",
        method: "GET",
        endpoint: "",
        expected: "200",
        status: "IDLE",
      },
      {
        id: 21,
        name: "Project ready",
        method: "PATCH",
        endpoint: "",
        expected: "200",
        status: "IDLE",
      },
      {
        id: 22,
        name: "Archive project",
        method: "PATCH",
        endpoint: "",
        expected: "200",
        status: "IDLE",
      },
      {
        id: 23,
        name: "Reject invalid lifecycle transition",
        method: "PATCH",
        endpoint: "",
        expected: "409",
        status: "IDLE",
      },
      {
        id: 24,
        name: "Reject storyboard duration mismatch",
        method: "POST",
        endpoint: "",
        expected: "400",
        status: "IDLE",
      },
      {
        id: 25,
        name: "Reject storyboard without generated images",
        method: "POST",
        endpoint: "",
        expected: "400",
        status: "IDLE",
      },
      {
        id: 26,
        name: "Reject target duration conflict",
        method: "PATCH",
        endpoint: "",
        expected: "409",
        status: "IDLE",
      },
      {
        id: 27,
        name: "Delete Scene B1",
        method: "DELETE",
        endpoint: "",
        expected: "200",
        status: "IDLE",
      },
      {
        id: 28,
        name: "Delete test projects",
        method: "DELETE",
        endpoint: "/projects/:projectA + :projectB + :projectC",
        expected: "200",
        status: "IDLE",
      },
    ],
    []
  );

  const initialize = () => {
    const prefix = makePrefix();

    contextRef.current = {
      prefix,
    };

    setResults(
      tests.map((test) => ({
        ...test,
        status: "IDLE",
        actual: undefined,
        request: undefined,
        response: undefined,
        error: undefined,
        assertion: undefined,
      }))
    );

    setCleanup([]);
    setCleanupRan(false);
    setCleanupFailed(false);
    setLogs([]);
    setExpanded(null);
    setConnection("Unknown");
    setStatus("Idle");
  };

  const createProjectBody = (prefix: string, suffix: string) => ({
    title: `${prefix}-${suffix}`,
    input_type: "idea",
    input_text: `Contract Test ${suffix}`,
    platform: "youtube_shorts",
    aspect_ratio: "9:16",
    target_duration_seconds: 15,
  });

  const sceneBody = (
    number: number,
    start: number,
    end: number
  ) => ({
    scene_number: number,
    duration_seconds: end - start,
    start_time: start,
    end_time: end,
    visual_description: `Contract test scene ${number}`,
    image_prompt: `Contract test image scene ${number}`,
    image_to_image_prompt: `Contract test image-to-image scene ${number}`,
    animate_image_prompt: `Contract test animate image scene ${number}`,
    image_to_video_prompt: `Contract test image-to-video scene ${number}`,
    status: "draft",
  });

  const assetBody = (
    projectId: string,
    sceneId: string | null,
    type: string,
    file: string
  ) => ({
    scene_id: sceneId,
    asset_type: type,
    storage_path: `projects/${projectId}/${file}`,
    mime_type: "image/png",
    metadata: {
      test: true,
    },
  });

  const runAllTests = async () => {
    if (running) return;

    initialize();

    const prefix = makePrefix();

    contextRef.current = {
      prefix,
    };

    const controller = new AbortController();
    abortRef.current = controller;

    setRunning(true);
    setStatus("Running");

    addLog("Starting contract test");
    addLog(`Test prefix: ${prefix}`);

    setResults(
      tests.map((test) => ({
        ...test,
        status: "IDLE",
      }))
    );

    let stopped = false;
    let blockedAt: number | null = null;

    const execute = async (
      id: number,
      method: string,
      endpoint: string,
      expected: string,
      body?: unknown,
      assertion?: (result: ApiResult) => {
        ok: boolean;
        message: string;
      }
    ) => {
      if (controller.signal.aborted) {
        stopped = true;
        blockedAt = id;

        updateResult(id, {
          status: "BLOCKED",
          method,
          endpoint,
          expected,
          request: body,
          error: "Execution stopped.",
        });

        return {
          kind: "BLOCKED" as const,
          result: undefined,
        };
      }

      return runRequest(
        id,
        method,
        endpoint,
        expected,
        body,
        assertion
      );
    };

    const markRemainingSkipped = (from: number) => {
      setResults((prev) =>
        prev.map((item) =>
          item.id >= from && item.status === "IDLE"
            ? {
                ...item,
                status: "SKIPPED",
                assertion: "Skipped because execution was stopped.",
              }
            : item
        )
      );
    };

    try {
      // 01
      let r = await execute(1, "GET", "/", "200");
      if (r.kind === "BLOCKED") stopped = true;

      if (!stopped) {
        // 02
        r = await execute(2, "GET", "/projects", "200");
        if (r.kind === "BLOCKED") stopped = true;
      }

      if (!stopped) {
        // 03
        r = await execute(
          3,
          "POST",
          "/projects",
          "400",
          {
            ...createProjectBody(prefix, "invalid-project"),
            target_duration_seconds: 10,
          }
        );
        if (r.kind === "BLOCKED") stopped = true;
      }

      if (!stopped) {
        // 04
        r = await execute(
          4,
          "POST",
          "/projects",
          "201",
          createProjectBody(prefix, "project-A"),
          (x) => {
            const id = extractId(x.data);

            if (id) {
              contextRef.current.projectA = id;
            }

            return {
              ok: Boolean(id),
              message: id
                ? `Project A created: ${id}`
                : "HTTP 201 received but project ID was missing.",
            };
          }
        );

        if (r.kind === "BLOCKED") stopped = true;
      }

      if (!stopped && !contextRef.current.projectA) {
        updateResult(4, {
          status: "FAIL",
          assertion: "Project A ID could not be extracted.",
        });
        stopped = true;
      }

      if (!stopped) {
        // 05
        r = await execute(
          5,
          "POST",
          "/projects",
          "201",
          createProjectBody(prefix, "project-B"),
          (x) => {
            const id = extractId(x.data);

            if (id) {
              contextRef.current.projectB = id;
            }

            return {
              ok: Boolean(id),
              message: id
                ? `Project B created: ${id}`
                : "HTTP 201 received but project ID was missing.",
            };
          }
        );

        if (r.kind === "BLOCKED") stopped = true;
      }

      if (!stopped) {
        // 06
        r = await execute(
          6,
          "GET",
          `/projects/${contextRef.current.projectA}`,
          "200"
        );

        if (r.kind === "BLOCKED") stopped = true;
      }

      if (!stopped) {
        // 07
        r = await execute(
          7,
          "POST",
          `/projects/${contextRef.current.projectA}/scenes`,
          "400",
          {
            ...sceneBody(1, 0, 6),
            duration_seconds: 5,
          }
        );

        if (r.kind === "BLOCKED") stopped = true;
      }

      if (!stopped) {
        // 08
        r = await execute(
          8,
          "POST",
          `/projects/${contextRef.current.projectA}/scenes`,
          "201",
          sceneBody(1, 0, 5),
          (x) => {
            const id = extractId(x.data);

            if (id) contextRef.current.sceneA1 = id;

            return {
              ok: Boolean(id),
              message: id
                ? `Scene A1 created: ${id}`
                : "HTTP 201 but scene ID missing.",
            };
          }
        );

        if (r.kind === "BLOCKED") stopped = true;
      }

      if (!stopped) {
        // 09
        r = await execute(
          9,
          "POST",
          `/projects/${contextRef.current.projectA}/scenes`,
          "201",
          sceneBody(2, 5, 10),
          (x) => {
            const id = extractId(x.data);

            if (id) contextRef.current.sceneA2 = id;

            return {
              ok: Boolean(id),
              message: id
                ? `Scene A2 created: ${id}`
                : "HTTP 201 but scene ID missing.",
            };
          }
        );

        if (r.kind === "BLOCKED") stopped = true;
      }

      if (!stopped) {
        // 10
        r = await execute(
          10,
          "POST",
          `/projects/${contextRef.current.projectA}/scenes`,
          "400",
          sceneBody(3, 10, 16)
        );

        if (r.kind === "BLOCKED") stopped = true;
      }

      if (!stopped) {
        // 11
        r = await execute(
          11,
          "GET",
          `/projects/${contextRef.current.projectB}/scenes/${contextRef.current.sceneA1}`,
          "409",
          undefined,
          (x) => ({
            ok: hasErrorCode(x.data, "PROJECT_SCOPE_MISMATCH"),
            message: hasErrorCode(
              x.data,
              "PROJECT_SCOPE_MISMATCH"
            )
              ? "PROJECT_SCOPE_MISMATCH confirmed."
              : "Expected PROJECT_SCOPE_MISMATCH error code.",
          })
        );

        if (r.kind === "BLOCKED") stopped = true;
      }

      if (!stopped) {
        // 12
        r = await execute(
          12,
          "POST",
          `/projects/${contextRef.current.projectB}/scenes`,
          "201",
          sceneBody(1, 0, 5),
          (x) => {
            const id = extractId(x.data);

            if (id) contextRef.current.sceneB1 = id;

            return {
              ok: Boolean(id),
              message: id
                ? `Scene B1 created: ${id}`
                : "HTTP 201 but scene ID missing.",
            };
          }
        );

        if (r.kind === "BLOCKED") stopped = true;
      }

      if (!stopped) {
        // 13
        r = await execute(
          13,
          "POST",
          `/projects/${contextRef.current.projectA}/assets`,
          "201",
          assetBody(
            contextRef.current.projectA!,
            contextRef.current.sceneA1!,
            "generated_image",
            `scenes/scene-001/image.png`
          ),
          (x) => {
            const id = extractId(x.data);

            if (id) contextRef.current.assetA1 = id;

            return {
              ok: Boolean(id),
              message: id
                ? `Asset A1 created: ${id}`
                : "HTTP 201 but asset ID missing.",
            };
          }
        );

        if (r.kind === "BLOCKED") stopped = true;
      }

      if (!stopped) {
        // 14
        r = await execute(
          14,
          "PATCH",
          `/projects/${contextRef.current.projectB}/scenes/${contextRef.current.sceneB1}`,
          "409",
          {
            generated_image_asset_id:
              contextRef.current.assetA1,
          },
          (x) => ({
            ok: hasErrorCode(
              x.data,
              "PROJECT_SCOPE_MISMATCH"
            ),
            message: hasErrorCode(
              x.data,
              "PROJECT_SCOPE_MISMATCH"
            )
              ? "PROJECT_SCOPE_MISMATCH confirmed."
              : "Expected PROJECT_SCOPE_MISMATCH error code.",
          })
        );

        if (r.kind === "BLOCKED") stopped = true;
      }

      let referenceAsset: string | undefined;

      if (!stopped) {
        // 15
        r = await execute(
          15,
          "POST",
          `/projects/${contextRef.current.projectA}/assets`,
          "409",
          {
            ...assetBody(
              contextRef.current.projectA!,
              null,
              "reference_image",
              "reference.png"
            ),
          }
        );

        /*
         * Test 15 is intentionally two HTTP operations:
         * create reference asset, then attempt generated-image usage.
         *
         * The creation itself must succeed before the negative assertion.
         */
        if (
          r.kind === "PASS" &&
          r.result
        ) {
          referenceAsset = extractId(r.result.data);

          if (!referenceAsset) {
            updateResult(15, {
              status: "FAIL",
              assertion:
                "Reference asset creation returned 201 but no asset ID.",
            });
          } else {
            const patch = await execute(
              15,
              "PATCH",
              `/projects/${contextRef.current.projectA}/scenes/${contextRef.current.sceneA1}`,
              "409",
              {
                generated_image_asset_id: referenceAsset,
              },
              (x) => ({
                ok: hasErrorCode(
                  x.data,
                  "INVALID_GENERATED_IMAGE_ASSET"
                ),
                message: hasErrorCode(
                  x.data,
                  "INVALID_GENERATED_IMAGE_ASSET"
                )
                  ? "INVALID_GENERATED_IMAGE_ASSET confirmed."
                  : "Expected INVALID_GENERATED_IMAGE_ASSET error code.",
              })
            );

            if (patch.kind === "BLOCKED") stopped = true;
          }
        }
      }

      if (!stopped) {
        // 16
        r = await execute(
          16,
          "POST",
          `/projects/${contextRef.current.projectA}/consistency`,
          "201",
          {
            type: "character",
            name: "Test Character",
            description: "Contract test character",
            reference_asset_id: referenceAsset,
            metadata: {},
          },
          (x) => {
            const id = extractId(x.data);

            if (id) contextRef.current.consistencyA = id;

            return {
              ok: Boolean(id),
              message: id
                ? `Consistency reference created: ${id}`
                : "HTTP 201 but consistency ID missing.",
            };
          }
        );

        if (r.kind === "BLOCKED") stopped = true;
      }

      let referenceAssetB: string | undefined;

      if (!stopped) {
        // 17a — create Project B reference asset.
        const reference = await api(
          "POST",
          `/projects/${contextRef.current.projectB}/assets`,
          assetBody(
            contextRef.current.projectB!,
            null,
            "reference_image",
            "project-b-reference.png"
          )
        );

        if (reference.status !== 201) {
          updateResult(17, {
            status: reference.status === 0 ? "BLOCKED" : "FAIL",
            method: "POST",
            endpoint: `/projects/${contextRef.current.projectB}/assets`,
            expected: "201 → then 409",
            actual: reference.status,
            response: reference.data,
            error: getErrorMessage(
              reference.data,
              reference.raw
            ),
          });
        } else {
          referenceAssetB = extractId(reference.data);

          if (!referenceAssetB) {
            updateResult(17, {
              status: "FAIL",
              method: "POST",
              endpoint: `/projects/${contextRef.current.projectA}/consistency`,
              expected: "409",
              assertion:
                "Project B reference asset returned 201 without an ID.",
            });
          } else {
            r = await execute(
              17,
              "POST",
              `/projects/${contextRef.current.projectA}/consistency`,
              "409",
              {
                type: "character",
                name: "Cross Project Character",
                description: "Contract test",
                reference_asset_id: referenceAssetB,
                metadata: {},
              },
              (x) => ({
                ok: hasErrorCode(
                  x.data,
                  "PROJECT_SCOPE_MISMATCH"
                ),
                message: hasErrorCode(
                  x.data,
                  "PROJECT_SCOPE_MISMATCH"
                )
                  ? "PROJECT_SCOPE_MISMATCH confirmed."
                  : "Expected PROJECT_SCOPE_MISMATCH error code.",
              })
            );

            if (r.kind === "BLOCKED") stopped = true;
          }
        }
      }

      if (!stopped) {
        // 18 — A3
        r = await execute(
          18,
          "POST",
          `/projects/${contextRef.current.projectA}/scenes`,
          "201",
          sceneBody(3, 10, 15),
          (x) => {
            const id = extractId(x.data);

            if (id) contextRef.current.sceneA3 = id;

            return {
              ok: Boolean(id),
              message: id
                ? `Scene A3 created: ${id}`
                : "Scene A3 ID missing.",
            };
          }
        );

        if (r.kind === "BLOCKED") stopped = true;
      }

      if (!stopped) {
        // 18 — A2 asset
        const a2 = await api(
          "POST",
          `/projects/${contextRef.current.projectA}/assets`,
          assetBody(
            contextRef.current.projectA!,
            contextRef.current.sceneA2!,
            "generated_image",
            "scenes/scene-002/image.png"
          )
        );

        if (a2.status !== 201) {
          updateResult(18, {
            status: "FAIL",
            actual: a2.status,
            response: a2.data,
            error: getErrorMessage(a2.data, a2.raw),
            assertion: "Scene A2 asset creation failed.",
          });
          stopped = true;
        } else {
          contextRef.current.assetA2 = extractId(a2.data);
        }
      }

      if (!stopped) {
        // 18 — A3 asset
        const a3 = await api(
          "POST",
          `/projects/${contextRef.current.projectA}/assets`,
          assetBody(
            contextRef.current.projectA!,
            contextRef.current.sceneA3!,
            "generated_image",
            "scenes/scene-003/image.png"
          )
        );

        if (a3.status !== 201) {
          updateResult(18, {
            status: "FAIL",
            actual: a3.status,
            response: a3.data,
            error: getErrorMessage(a3.data, a3.raw),
            assertion: "Scene A3 asset creation failed.",
          });
          stopped = true;
        } else {
          contextRef.current.assetA3 = extractId(a3.data);
        }
      }

      if (!stopped) {
        // 18 — Patch A1
        const p1 = await api(
          "PATCH",
          `/projects/${contextRef.current.projectA}/scenes/${contextRef.current.sceneA1}`,
          {
            generated_image_asset_id:
              contextRef.current.assetA1,
          }
        );

        if (p1.status !== 200) {
          updateResult(18, {
            status: "FAIL",
            actual: p1.status,
            response: p1.data,
            error: getErrorMessage(p1.data, p1.raw),
            assertion: "Scene A1 generated image patch failed.",
          });
          stopped = true;
        }
      }

      if (!stopped) {
        // 18 — Patch A2
        const p2 = await api(
          "PATCH",
          `/projects/${contextRef.current.projectA}/scenes/${contextRef.current.sceneA2}`,
          {
            generated_image_asset_id:
              contextRef.current.assetA2,
          }
        );

        if (p2.status !== 200) {
          updateResult(18, {
            status: "FAIL",
            actual: p2.status,
            response: p2.data,
            error: getErrorMessage(p2.data, p2.raw),
            assertion: "Scene A2 generated image patch failed.",
          });
          stopped = true;
        }
      }

      if (!stopped) {
        // 18 — Patch A3
        const p3 = await api(
          "PATCH",
          `/projects/${contextRef.current.projectA}/scenes/${contextRef.current.sceneA3}`,
          {
            generated_image_asset_id:
              contextRef.current.assetA3,
          }
        );

        if (p3.status !== 200) {
          updateResult(18, {
            status: "FAIL",
            actual: p3.status,
            response: p3.data,
            error: getErrorMessage(p3.data, p3.raw),
            assertion: "Scene A3 generated image patch failed.",
          });
          stopped = true;
        } else {
          updateResult(18, {
            status: "PASS",
            actual: 200,
            assertion:
              "A3 created, A2/A3 assets created, and all three scene patches returned 200.",
          });

          addLog("PASS #18 complete storyboard scene set");
        }
      }

      if (!stopped) {
        // 19
        r = await execute(
          19,
          "POST",
          `/projects/${contextRef.current.projectA}/storyboard`,
          "200",
          {
            scenes: [
              {
                scene_number: 1,
                start_time: 0,
                end_time: 5,
                duration_seconds: 5,
                visual_description: "Contract test scene 1",
                image_prompt: "Contract test image scene 1",
                image_to_image_prompt:
                  "Contract test image-to-image scene 1",
                animate_image_prompt:
                  "Contract test animate image scene 1",
                image_to_video_prompt:
                  "Contract test image-to-video scene 1",
                generated_image_asset_id:
                  contextRef.current.assetA1,
              },
              {
                scene_number: 2,
                start_time: 5,
                end_time: 10,
                duration_seconds: 5,
                visual_description: "Contract test scene 2",
                image_prompt: "Contract test image scene 2",
                image_to_image_prompt:
                  "Contract test image-to-image scene 2",
                animate_image_prompt:
                  "Contract test animate image scene 2",
                image_to_video_prompt:
                  "Contract test image-to-video scene 2",
                generated_image_asset_id:
                  contextRef.current.assetA2,
              },
              {
                scene_number: 3,
                start_time: 10,
                end_time: 15,
                duration_seconds: 5,
                visual_description: "Contract test scene 3",
                image_prompt: "Contract test image scene 3",
                image_to_image_prompt:
                  "Contract test image-to-image scene 3",
                animate_image_prompt:
                  "Contract test animate image scene 3",
                image_to_video_prompt:
                  "Contract test image-to-video scene 3",
                generated_image_asset_id:
                  contextRef.current.assetA3,
              },
            ],
          }
        );

        if (r.kind === "BLOCKED") stopped = true;
      }

      if (!stopped) {
        // 20
        r = await execute(
          20,
          "GET",
          `/projects/${contextRef.current.projectA}/storyboard`,
          "200",
          undefined,
          (x) => {
            const scenes = getScenesFromResponse(x.data);
            const total = getTotalDuration(x.data);

            const numbers = scenes
              .map(
                (scene) =>
                  scene.scene_number ??
                  scene.sceneNumber
              )
              .sort((a, b) => a - b);

            const exactNumbers =
              JSON.stringify(numbers) ===
              JSON.stringify([1, 2, 3]);

            const durationOK =
              total === 15 ||
              scenes.reduce(
                (sum, scene) =>
                  sum +
                  Number(
                    scene.duration_seconds ??
                      scene.durationSeconds ??
                      0
                  ),
                0
              ) === 15;

            const ok =
              scenes.length === 3 &&
              exactNumbers &&
              durationOK;

            return {
              ok,
              message: ok
                ? "Exactly 3 scenes, numbers 1/2/3, total duration 15."
                : `Storyboard invariant failed: scenes=${scenes.length}, numbers=${JSON.stringify(
                    numbers
                  )}, total=${total}`,
            };
          }
        );

        if (r.kind === "BLOCKED") stopped = true;
      }

      if (!stopped) {
        // 21
        r = await execute(
          21,
          "PATCH",
          `/projects/${contextRef.current.projectA}`,
          "200",
          {
            status: "ready",
          }
        );

        if (r.kind === "BLOCKED") stopped = true;
      }

      if (!stopped) {
        // 22
        r = await execute(
          22,
          "PATCH",
          `/projects/${contextRef.current.projectA}`,
          "200",
          {
            status: "archived",
          }
        );

        if (r.kind === "BLOCKED") stopped = true;
      }

      if (!stopped) {
        // 23
        r = await execute(
          23,
          "PATCH",
          `/projects/${contextRef.current.projectB}`,
          "409",
          {
            status: "archived",
          }
        );

        if (r.kind === "BLOCKED") stopped = true;
      }

      if (!stopped) {
        // 24
        r = await execute(
          24,
          "POST",
          `/projects/${contextRef.current.projectB}/storyboard`,
          "400",
          {
            scenes: [
              {
                scene_number: 1,
                start_time: 0,
                end_time: 5,
                duration_seconds: 5,
                visual_description: "Contract test",
                image_prompt: "Contract test",
                image_to_image_prompt: "Contract test",
                animate_image_prompt: "Contract test",
                image_to_video_prompt: "Contract test",
              },
              {
                scene_number: 2,
                start_time: 5,
                end_time: 10,
                duration_seconds: 5,
                visual_description: "Contract test",
                image_prompt: "Contract test",
                image_to_image_prompt: "Contract test",
                animate_image_prompt: "Contract test",
                image_to_video_prompt: "Contract test",
              },
            ],
          }
        );

        if (r.kind === "BLOCKED") stopped = true;
      }

      if (!stopped) {
        // 25
        r = await execute(
          25,
          "POST",
          `/projects/${contextRef.current.projectB}/storyboard`,
          "400",
          {
            scenes: [
              {
                scene_number: 1,
                start_time: 0,
                end_time: 5,
                duration_seconds: 5,
                visual_description: "Contract test",
                image_prompt: "Contract test",
                image_to_image_prompt: "Contract test",
                animate_image_prompt: "Contract test",
                image_to_video_prompt: "Contract test",
              },
              {
                scene_number: 2,
                start_time: 5,
                end_time: 10,
                duration_seconds: 5,
                visual_description: "Contract test",
                image_prompt: "Contract test",
                image_to_image_prompt: "Contract test",
                animate_image_prompt: "Contract test",
                image_to_video_prompt: "Contract test",
              },
              {
                scene_number: 3,
                start_time: 10,
                end_time: 15,
                duration_seconds: 5,
                visual_description: "Contract test",
                image_prompt: "Contract test",
                image_to_image_prompt: "Contract test",
                animate_image_prompt: "Contract test",
                image_to_video_prompt: "Contract test",
              },
            ],
          }
        );

        if (r.kind === "BLOCKED") stopped = true;
      }

      if (!stopped) {
        // 26 — Project C
        r = await execute(
          26,
          "POST",
          "/projects",
          "201",
          {
            ...createProjectBody(prefix, "project-C"),
            target_duration_seconds: 30,
          },
          (x) => {
            const id = extractId(x.data);

            if (id) contextRef.current.projectC = id;

            return {
              ok: Boolean(id),
              message: id
                ? `Project C created: ${id}`
                : "Project C ID missing.",
            };
          }
        );

        if (r.kind === "BLOCKED") stopped = true;
      }

      if (!stopped && contextRef.current.projectC) {
        // 26 — scenes totaling 30
        const s1 = await api(
          "POST",
          `/projects/${contextRef.current.projectC}/scenes`,
          sceneBody(1, 0, 15)
        );

        const s2 = await api(
          "POST",
          `/projects/${contextRef.current.projectC}/scenes`,
          sceneBody(2, 15, 30)
        );

        if (s1.status !== 201 || s2.status !== 201) {
          updateResult(26, {
            status: "FAIL",
            actual:
              s1.status !== 201
                ? s1.status
                : s2.status,
            response:
              s1.status !== 201
                ? s1.data
                : s2.data,
            assertion:
              "Project C could not establish a 30-second storyboard.",
          });

          stopped = true;
        }
      }

      if (!stopped && contextRef.current.projectC) {
        r = await execute(
          26,
          "PATCH",
          `/projects/${contextRef.current.projectC}`,
          "409",
          {
            target_duration_seconds: 15,
          },
          (x) => ({
            ok: hasErrorCode(
              x.data,
              "TARGET_DURATION_CONFLICT"
            ),
            message: hasErrorCode(
              x.data,
              "TARGET_DURATION_CONFLICT"
            )
              ? "TARGET_DURATION_CONFLICT confirmed."
              : "Expected TARGET_DURATION_CONFLICT error code.",
          })
        );

        if (r.kind === "BLOCKED") stopped = true;
      }

      if (!stopped) {
        // 27
        r = await execute(
          27,
          "DELETE",
          `/projects/${contextRef.current.projectB}/scenes/${contextRef.current.sceneB1}`,
          "200"
        );

        if (r.kind === "BLOCKED") stopped = true;
      }

      if (stopped && blockedAt !== null) {
        markRemainingSkipped(blockedAt + 1);
      }
    } finally {
      setStatus("Cleaning Up");
      addLog("Starting cleanup");

      const ctx = contextRef.current;

      const projects = [
        ["Project A", ctx.projectA],
        ["Project B", ctx.projectB],
        ["Project C", ctx.projectC],
        ["Project D", ctx.projectD],
        ["Project E", ctx.projectE],
      ] as const;

      const cleanupResults: CleanupResult[] = [];

      for (const [label, projectId] of projects) {
        if (!projectId) continue;

        try {
          const response = await api(
            "DELETE",
            `/projects/${projectId}`
          );

          if (response.status === 200) {
            cleanupResults.push({
              label,
              ok: true,
            });

            addLog(`${label} deleted`);
          } else {
            cleanupResults.push({
              label,
              ok: false,
              error: `${response.status}: ${getErrorMessage(
                response.data,
                response.raw
              )}`,
            });

            addLog(`${label} cleanup failed`);
          }
        } catch (error) {
          cleanupResults.push({
            label,
            ok: false,
            error:
              error instanceof Error
                ? error.message
                : String(error),
          });

          addLog(`${label} cleanup blocked`);
        }
      }

      setCleanup(cleanupResults);
      setCleanupRan(true);

      const failedCleanup = cleanupResults.some(
        (item) => !item.ok
      );

      setCleanupFailed(failedCleanup);

      if (failedCleanup) {
        addLog("⚠ Cleanup incomplete");
      } else {
        addLog("Cleanup completed");
      }

      setRunning(false);

      const finalResults = results;

      /*
       * Result counts are calculated from React state after the
       * asynchronous test operations have settled on the next render.
       * The UI's final lock condition independently derives from the
       * displayed results, so no partial state can claim success.
       */

      setStatus(failedCleanup ? "Failed" : "Completed");
      addLog("Test completed");

      abortRef.current = null;
    }
  };

  const stop = () => {
    if (!running) return;

    addLog("Stop requested");

    abortRef.current?.abort();

    setStatus("Cleaning Up");
  };

  const reset = () => {
    if (running) return;

    contextRef.current = initialContext();

    setResults(
      tests.map((test) => ({
        ...test,
        status: "IDLE",
        actual: undefined,
        request: undefined,
        response: undefined,
        error: undefined,
        assertion: undefined,
      }))
    );

    setLogs([]);
    setCleanup([]);
    setCleanupRan(false);
    setCleanupFailed(false);
    setExpanded(null);
    setConnection("Unknown");
    setStatus("Idle");
  };

  const counts = useMemo(() => {
    return results.reduce(
      (acc, result) => {
        if (result.status === "PASS") acc.pass++;
        if (result.status === "FAIL") acc.fail++;
        if (result.status === "BLOCKED") acc.blocked++;
        if (result.status === "SKIPPED") acc.skipped++;

        return acc;
      },
      {
        pass: 0,
        fail: 0,
        blocked: 0,
        skipped: 0,
      }
    );
  }, [results]);

  const completedCount =
    counts.pass +
    counts.fail +
    counts.blocked +
    counts.skipped;

  const locked =
    counts.pass === 28 &&
    counts.fail === 0 &&
    counts.blocked === 0 &&
    counts.skipped === 0 &&
    cleanupRan &&
    cleanupFailed === false &&
    cleanup.every((item) => item.ok);

  const statusClass = (status: TestStatus) => {
    switch (status) {
      case "PASS":
        return "pass";
      case "FAIL":
        return "fail";
      case "BLOCKED":
        return "blocked";
      case "RUNNING":
        return "running";
      case "SKIPPED":
        return "skipped";
      default:
        return "idle";
    }
  };

  return (
    <div className="app">
      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #080b10;
          color: #e8edf5;
          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        button {
          font: inherit;
        }

        .app {
          min-height: 100vh;
          padding: 20px;
          background:
            radial-gradient(
              circle at top right,
              rgba(70, 100, 160, 0.12),
              transparent 35%
            ),
            #080b10;
        }

        .shell {
          max-width: 1280px;
          margin: 0 auto;
        }

        .header {
          border: 1px solid #202734;
          border-radius: 12px;
          padding: 18px;
          background: #0d1118;
          margin-bottom: 14px;
        }

        .title-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
        }

        h1 {
          margin: 0;
          font-size: 21px;
          letter-spacing: -0.02em;
        }

        .subtitle {
          margin-top: 4px;
          color: #8993a4;
          font-size: 13px;
        }

        .connection {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-size: 12px;
          color: #aab4c3;
        }

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #5b6575;
        }

        .dot.online {
          background: #43d17c;
        }

        .dot.blocked {
          background: #ef5f66;
        }

        .url {
          margin-top: 14px;
          padding: 10px 12px;
          border-radius: 8px;
          background: #080b10;
          border: 1px solid #1c2330;
          color: #9ca8ba;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 12px;
          overflow: auto;
        }

        .controls {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 14px;
        }

        button {
          border: 1px solid #2b3544;
          border-radius: 7px;
          background: #121823;
          color: #e8edf5;
          padding: 9px 13px;
          cursor: pointer;
          font-weight: 600;
          font-size: 13px;
        }

        button:hover:not(:disabled) {
          background: #18202c;
        }

        button.primary {
          background: #e8edf5;
          color: #080b10;
          border-color: #e8edf5;
        }

        button.danger {
          color: #ff9da2;
        }

        button:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .meta-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-bottom: 14px;
        }

        .card {
          border: 1px solid #202734;
          background: #0d1118;
          border-radius: 10px;
          padding: 13px;
        }

        .label {
          color: #7f8998;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .value {
          margin-top: 5px;
          font-size: 17px;
          font-weight: 700;
        }

        .progress {
          height: 5px;
          background: #1b222e;
          border-radius: 99px;
          overflow: hidden;
          margin-top: 8px;
        }

        .progress > div {
          height: 100%;
          background: #e8edf5;
          transition: width 0.2s ease;
        }

        .table-wrap {
          border: 1px solid #202734;
          border-radius: 10px;
          overflow: hidden;
          background: #0d1118;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }

        th {
          text-align: left;
          color: #778292;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          background: #0a0e14;
          padding: 10px;
          border-bottom: 1px solid #202734;
        }

        td {
          padding: 10px;
          border-bottom: 1px solid #171d27;
          vertical-align: top;
        }

        tr.test-row {
          cursor: pointer;
        }

        tr.test-row:hover {
          background: #111721;
        }

        .number {
          width: 38px;
          color: #667181;
        }

        .method {
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-weight: 700;
          color: #c5cfdd;
        }

        .endpoint {
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          color: #8793a5;
          word-break: break-all;
        }

        .status {
          display: inline-flex;
          min-width: 68px;
          justify-content: center;
          border-radius: 5px;
          padding: 4px 7px;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.05em;
          border: 1px solid #2a3340;
        }

        .status.pass {
          color: #61dc91;
          border-color: #255d3b;
          background: #0d2116;
        }

        .status.fail {
          color: #ff858c;
          border-color: #693139;
          background: #241013;
        }

        .status.blocked {
          color: #ffb66d;
          border-color: #71451e;
          background: #26180c;
        }

        .status.running {
          color: #d3dded;
          border-color: #465267;
          background: #151c28;
        }

        .status.skipped {
          color: #8993a4;
          background: #10151c;
        }

        .status.idle {
          color: #677181;
        }

        .details {
          background: #080b10;
        }

        .details-inner {
          padding: 13px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .detail-block {
          border: 1px solid #1c2430;
          border-radius: 7px;
          overflow: hidden;
        }

        .detail-title {
          padding: 8px 10px;
          background: #0e141c;
          color: #8490a1;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        pre {
          margin: 0;
          padding: 10px;
          max-height: 260px;
          overflow: auto;
          color: #aeb8c8;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 11px;
          line-height: 1.5;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .assertion {
          grid-column: 1 / -1;
          padding: 9px 10px;
          border: 1px solid #1c2430;
          border-radius: 7px;
          color: #9ba6b7;
          font-size: 12px;
        }

        .error {
          color: #ff8d94;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-top: 14px;
        }

        .summary {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
        }

        .summary-item {
          padding: 10px;
          background: #080b10;
          border: 1px solid #1c2330;
          border-radius: 7px;
        }

        .summary-item strong {
          display: block;
          font-size: 18px;
          margin-top: 3px;
        }

        .final {
          margin-top: 14px;
          padding: 14px;
          border-radius: 9px;
          border: 1px solid #283241;
          background: #0b1017;
        }

        .final.locked {
          border-color: #28623d;
          background: #0c1911;
        }

        .final.not-locked {
          border-color: #5d3035;
          background: #1a0d0f;
        }

        .final-label {
          color: #7e8999;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .final-value {
          margin-top: 4px;
          font-weight: 800;
          font-size: 18px;
        }

        .cleanup {
          margin-top: 14px;
        }

        .cleanup-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #171d27;
          font-size: 12px;
        }

        .cleanup-ok {
          color: #61dc91;
        }

        .cleanup-fail {
          color: #ff858c;
        }

        .logs {
          margin-top: 14px;
        }

        .log-box {
          margin-top: 9px;
          border: 1px solid #202734;
          border-radius: 8px;
          background: #080b10;
          max-height: 260px;
          overflow: auto;
        }

        .log-line {
          padding: 5px 10px;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 11px;
          color: #8f9aaa;
          border-bottom: 1px solid #121821;
        }

        @media (max-width: 850px) {
          .meta-grid,
          .summary {
            grid-template-columns: repeat(2, 1fr);
          }

          .footer-grid {
            grid-template-columns: 1fr;
          }

          .details-inner {
            grid-template-columns: 1fr;
          }

          .assertion {
            grid-column: auto;
          }

          .table-wrap {
            overflow-x: auto;
          }

          table {
            min-width: 850px;
          }
        }
      `}</style>

      <div className="shell">
        <section className="header">
          <div className="title-row">
            <div>
              <h1>yt-storyboard v4</h1>
              <div className="subtitle">
                API Contract Test Runner
              </div>
            </div>

            <div className="connection">
              <span
                className={`dot ${
                  connection === "Online"
                    ? "online"
                    : connection === "Blocked"
                    ? "blocked"
                    : ""
                }`}
              />
              {connection}
            </div>
          </div>

          <div className="url">{BASE_URL}</div>

          <div className="controls">
            <button
              className="primary"
              disabled={running}
              onClick={runAllTests}
            >
              Run Full Contract Test
            </button>

            <button
              className="danger"
              disabled={!running}
              onClick={stop}
            >
              Stop
            </button>

            <button
              disabled={running}
              onClick={reset}
            >
              Reset
            </button>
          </div>
        </section>

        <section className="meta-grid">
          <div className="card">
            <div className="label">Status</div>
            <div className="value">{status}</div>
          </div>

          <div className="card">
            <div className="label">Progress</div>
            <div className="value">
              {completedCount} / {TOTAL_TESTS}
            </div>
            <div className="progress">
              <div
                style={{
                  width: `${Math.min(
                    100,
                    (completedCount / TOTAL_TESTS) * 100
                  )}%`,
                }}
              />
            </div>
          </div>

          <div className="card">
            <div className="label">Prefix</div>
            <div
              className="value"
              style={{
                fontSize: 12,
                fontFamily:
                  "ui-monospace, SFMono-Regular, Menlo, monospace",
                wordBreak: "break-all",
              }}
            >
              {contextRef.current.prefix || "—"}
            </div>
          </div>

          <div className="card">
            <div className="label">Tests</div>
            <div className="value">
              {counts.pass} / {TOTAL_TESTS} PASS
            </div>
          </div>
        </section>

        <section className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Test</th>
                <th>Method</th>
                <th>Endpoint</th>
                <th>Expected</th>
                <th>Actual</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {results.map((test) => (
                <React.Fragment key={test.id}>
                  <tr
                    className="test-row"
                    onClick={() =>
                      setExpanded(
                        expanded === test.id
                          ? null
                          : test.id
                      )
                    }
                  >
                    <td className="number">{test.id}</td>
                    <td>{test.name}</td>
                    <td className="method">
                      {test.method}
                    </td>
                    <td className="endpoint">
                      {test.endpoint || "—"}
                    </td>
                    <td>{test.expected}</td>
                    <td>{test.actual ?? "—"}</td>
                    <td>
                      <span
                        className={`status ${statusClass(
                          test.status
                        )}`}
                      >
                        {test.status}
                      </span>
                    </td>
                  </tr>

                  {expanded === test.id && (
                    <tr>
                      <td
                        colSpan={7}
                        className="details"
                      >
                        <div className="details-inner">
                          <div className="detail-block">
                            <div className="detail-title">
                              Request Body
                            </div>
                            <pre>
                              {test.request === undefined
                                ? "—"
                                : JSON.stringify(
                                    test.request,
                                    null,
                                    2
                                  )}
                            </pre>
                          </div>

                          <div className="detail-block">
                            <div className="detail-title">
                              Response
                            </div>
                            <pre>
                              {test.response === undefined
                                ? "—"
                                : JSON.stringify(
                                    test.response,
                                    null,
                                    2
                                  )}
                            </pre>
                          </div>

                          {test.assertion && (
                            <div className="assertion">
                              <strong>
                                Assertion:
                              </strong>{" "}
                              {test.assertion}
                            </div>
                          )}

                          {test.error && (
                            <div className="assertion error">
                              <strong>Error:</strong>{" "}
                              {test.error}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </section>

        <div className="footer-grid">
          <section className="card">
            <div className="label">Contract Summary</div>

            <div
              className="summary"
              style={{ marginTop: 10 }}
            >
              <div className="summary-item">
                PASS
                <strong>{counts.pass}</strong>
              </div>

              <div className="summary-item">
                FAIL
                <strong>{counts.fail}</strong>
              </div>

              <div className="summary-item">
                BLOCKED
                <strong>{counts.blocked}</strong>
              </div>

              <div className="summary-item">
                TOTAL
                <strong>{TOTAL_TESTS}</strong>
              </div>
            </div>

            <div
              className={`final ${
                locked
                  ? "locked"
                  : "not-locked"
              }`}
            >
              <div className="final-label">
                Final Result
              </div>

              <div className="final-value">
                {locked
                  ? "API CONTRACT LOCKED"
                  : "API CONTRACT NOT LOCKED"}
              </div>
            </div>
          </section>

          <section className="card">
            <div className="label">Cleanup</div>

            <div className="cleanup">
              {!cleanupRan ? (
                <div
                  style={{
                    color: "#667181",
                    marginTop: 10,
                    fontSize: 12,
                  }}
                >
                  Cleanup has not run.
                </div>
              ) : cleanup.length === 0 ? (
                <div
                  style={{
                    color: "#667181",
                    marginTop: 10,
                    fontSize: 12,
                  }}
                >
                  Cleanup completed. No test resources were created.
                </div>
              ) : (
                cleanup.map((item) => (
                  <div
                    className="cleanup-row"
                    key={item.label}
                  >
                    <span>{item.label}</span>
                    <span
                      className={
                        item.ok
                          ? "cleanup-ok"
                          : "cleanup-fail"
                      }
                    >
                      {item.ok
                        ? "✓ deleted"
                        : "⚠ failed"}
                    </span>
                  </div>
                ))
              )}

              {cleanupFailed && (
                <div
                  style={{
                    marginTop: 10,
                    color: "#ff858c",
                    fontSize: 12,
                  }}
                >
                  ⚠ Cleanup incomplete
                </div>
              )}
            </div>
          </section>
        </div>

        <section className="logs card">
          <button
            onClick={() => setShowLogs((v) => !v)}
          >
            {showLogs
              ? "Hide Execution Log"
              : "Show Execution Log"}
          </button>

          {showLogs && (
            <div className="log-box">
              {logs.length === 0 ? (
                <div className="log-line">
                  No execution log.
                </div>
              ) : (
                logs.map((line, index) => (
                  <div
                    className="log-line"
                    key={index}
                  >
                    {line}
                  </div>
                ))
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default App;
