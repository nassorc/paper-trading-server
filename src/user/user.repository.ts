import { Dependencies } from "../infrastructure/di";
import { IUserRepository } from "./interfaces/IUserRepository";
import User from "./user";

class UserRepository implements IUserRepository {
  private db: Dependencies["db"];
  constructor({ db }: Pick<Dependencies, "db">) {
    this.db = db;
  }
  async create({ user }: { user: User }) {
    const res = await this.db.user.create({
      data: {
        ...user,
        wallet: {
          create: {},
        },
        portfolio: {
          create: {},
        },
        watchlist: {
          create: {},
        },
      },
    });
    return { id: res.id };
  }
  async delete({ id }: { id: number }) {
    await this.db.user.delete({
      where: { id },
    });
  }
  async getById({ id }: { id: number }) {
    const user = await this.db.user.findFirst({
      where: { id },
    });
    if (!user) return null;
    return user;
  }
  async getByUsername({ username }: { username: string }) {
    const user = await this.db.user.findFirst({
      where: { username },
    });
    if (!user) return null;
    return user;
  }
  async get(query: any) {
    const user = await this.db.user.findFirst({
      where: { ...query },
    });
    if (!user) return null;
    return user;
  }
  toEntity(user: { id?: number; username: string; password: string }) {
    return new User(user);
  }
}
export default UserRepository;
