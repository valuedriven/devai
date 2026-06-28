const ALL_MODELS = [
  'customer',
  'category',
  'product',
  'order',
  'orderItem',
  'payment',
  'auditLog',
] as const;
const ALL_METHODS = [
  'create',
  'findMany',
  'findUnique',
  'findFirst',
  'update',
  'delete',
  'count',
] as const;

type PrismaModelKey = (typeof ALL_MODELS)[number];
type ModelMethod = (typeof ALL_METHODS)[number];

export type MockPrismaService = Record<
  PrismaModelKey,
  Record<ModelMethod, jest.Mock>
> & {
  $transaction: jest.Mock;
  $queryRaw: jest.Mock;
};

export function createMockPrismaService(): MockPrismaService {
  const modelMocks = {} as Record<
    PrismaModelKey,
    Record<ModelMethod, jest.Mock>
  >;

  for (const model of ALL_MODELS) {
    modelMocks[model] = {} as Record<ModelMethod, jest.Mock>;
    for (const method of ALL_METHODS) {
      modelMocks[model][method] = jest.fn();
    }
  }

  return {
    ...modelMocks,
    $transaction: jest.fn(),
    $queryRaw: jest.fn(),
  };
}
