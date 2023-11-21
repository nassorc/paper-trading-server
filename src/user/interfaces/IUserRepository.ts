import User from "../user";

export interface IUserRepository {
  create(params: { user: User }): Promise<{ id: number }>;
  delete(params: { id: number }): Promise<void>;
  getById(params: { id: number }): Promise<User | null>;
  getByUsername(params: { username: string }): Promise<User | null>;
}
