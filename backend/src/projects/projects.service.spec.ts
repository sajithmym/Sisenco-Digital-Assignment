import { NotFoundException } from "@nestjs/common";
import { ProjectsService } from "./projects.service";

describe("ProjectsService", () => {
  const createService = () => {
    const prisma = {
      project: {
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    return { service: new ProjectsService(prisma as never), prisma };
  };

  it("paginates case-insensitive project search results", async () => {
    const { service, prisma } = createService();
    const projects = [{ id: "project-1", name: "Client Portal", isActive: true }];
    prisma.project.findMany.mockResolvedValue(projects);
    prisma.project.count.mockResolvedValue(3);

    await expect(
      service.findAll({ page: 2, limit: 1, search: "  client ", isActive: true }),
    ).resolves.toMatchObject({
      data: projects,
      meta: { page: 2, limit: 1, total: 3, totalPages: 3 },
    });
    expect(prisma.project.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          isActive: true,
          name: { contains: "client", mode: "insensitive" },
        },
        skip: 1,
        take: 1,
        orderBy: { createdAt: "desc" },
      }),
    );
  });

  it("does not add a name filter for blank searches", async () => {
    const { service, prisma } = createService();
    prisma.project.findMany.mockResolvedValue([]);
    prisma.project.count.mockResolvedValue(0);

    await service.findAll({ page: 1, limit: 20, search: "   " });

    expect(prisma.project.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: {}, skip: 0, take: 20 }),
    );
  });

  it("returns projects by id and reports missing records", async () => {
    const { service, prisma } = createService();
    const project = { id: "project-1", name: "Client Portal" };
    prisma.project.findUnique.mockResolvedValueOnce(project).mockResolvedValueOnce(null);

    await expect(service.findById(project.id)).resolves.toBe(project);
    await expect(service.findById("missing")).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("creates, updates, and soft-deletes projects", async () => {
    const { service, prisma } = createService();
    const created = { id: "project-1", name: "Client Portal" };
    prisma.project.create.mockResolvedValue(created);
    prisma.project.findUnique.mockResolvedValue(created);
    prisma.project.update
      .mockResolvedValueOnce({ ...created, name: "Renamed" })
      .mockResolvedValueOnce({ ...created, isActive: false });

    await expect(
      service.create({ name: "Client Portal", description: "A portal" }),
    ).resolves.toBe(created);
    expect(prisma.project.create).toHaveBeenCalledWith({
      data: { name: "Client Portal", description: "A portal" },
    });

    await expect(service.update(created.id, { name: "Renamed" })).resolves.toMatchObject({
      name: "Renamed",
    });
    await expect(service.remove(created.id)).resolves.toMatchObject({
      isActive: false,
    });
    expect(prisma.project.update).toHaveBeenLastCalledWith({
      where: { id: created.id },
      data: { isActive: false },
    });
  });

  it.each(["update", "remove"])("rejects %s for a missing project", async (method) => {
    const { service, prisma } = createService();
    prisma.project.findUnique.mockResolvedValue(null);

    const action =
      method === "update"
        ? service.update("missing", { name: "Replacement" })
        : service.remove("missing");

    await expect(action).rejects.toThrow("Project not found");
    expect(prisma.project.update).not.toHaveBeenCalled();
  });
});
