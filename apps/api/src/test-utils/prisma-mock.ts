/** Jest mock of PrismaService for unit tests. Each model exposes jest.fn()s; */
/* `$transaction` resolves an array of operations (or runs a callback).        */

type ModelMock = {
  findMany: jest.Mock;
  findUnique: jest.Mock;
  findFirst: jest.Mock;
  create: jest.Mock;
  createMany: jest.Mock;
  update: jest.Mock;
  upsert: jest.Mock;
  delete: jest.Mock;
  count: jest.Mock;
};

function model(): ModelMock {
  return {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    createMany: jest.fn(),
    update: jest.fn(),
    upsert: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  };
}

export interface PrismaMock {
  question: ModelMock;
  questionTranslation: ModelMock;
  answer: ModelMock;
  answerTranslation: ModelMock;
  remedy: ModelMock;
  remedyTranslation: ModelMock;
  language: ModelMock;
  user: ModelMock;
  userResponse: ModelMock;
  userChart: ModelMock;
  chartConfig: ModelMock;
  admin: ModelMock;
  importJob: ModelMock;
  $transaction: jest.Mock;
}

export function createPrismaMock(): PrismaMock {
  const m: Partial<PrismaMock> = {
    question: model(),
    questionTranslation: model(),
    answer: model(),
    answerTranslation: model(),
    remedy: model(),
    remedyTranslation: model(),
    language: model(),
    user: model(),
    userResponse: model(),
    userChart: model(),
    chartConfig: model(),
    admin: model(),
    importJob: model(),
  };
  m.$transaction = jest.fn(async (arg: unknown) =>
    Array.isArray(arg) ? Promise.all(arg) : (arg as (p: PrismaMock) => unknown)(m as PrismaMock),
  );
  return m as PrismaMock;
}
