import { ApiResponse } from "./api-response.dto";

describe("ApiResponse", () => {
  it("creates success, created, paginated, and error envelopes with stable metadata", () => {
    const success = ApiResponse.success({ id: "record-1" }, "Fetched");
    const created = ApiResponse.created({ id: "record-2" });
    const paginated = ApiResponse.paginated(
      [{ id: "record-3" }],
      { page: 2, limit: 10, total: 11, totalPages: 2 },
    );
    const error = ApiResponse.error(409, "Duplicate", "DUPLICATE_RECORD");

    expect(success).toMatchObject({
      success: true,
      statusCode: 200,
      message: "Fetched",
      data: { id: "record-1" },
    });
    expect(created).toMatchObject({ success: true, statusCode: 201 });
    expect(paginated).toMatchObject({
      success: true,
      statusCode: 200,
      data: [{ id: "record-3" }],
      meta: { page: 2, limit: 10, total: 11, totalPages: 2 },
    });
    expect(error).toMatchObject({
      success: false,
      statusCode: 409,
      message: "Duplicate",
      data: null,
      code: "DUPLICATE_RECORD",
    });
    for (const response of [success, created, paginated, error])
      expect(new Date(response.timestamp).toISOString()).toBe(response.timestamp);
  });
});
