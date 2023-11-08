import resetDb from "./reset_db";

beforeEach(async () => {
  jest.clearAllMocks();
  await resetDb();
});
