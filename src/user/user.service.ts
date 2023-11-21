import { Prisma, User } from "@prisma/client";
import {
  DuplicateUsernameError,
  InvalidCredentials,
  UserNotFound,
} from "../utils/errors";
import { Optional } from "types";
import { Dependencies } from "../infrastructure/di";
type Credentials = Optional<User, "id">;

export interface UserType {
  username: string;
  password: string;
}

export interface IUserCollection {}

class UserService {
  private userRepository: Dependencies["userRepository"];

  constructor({ userRepository }: Pick<Dependencies, "userRepository">) {
    this.userRepository = userRepository;
  }

  async loginUser({ username, password }: Credentials) {
    const user = await this.userRepository.get({ username, password });
    if (!user) throw new InvalidCredentials();
    return user;
  }

  async registerUser(user: Credentials) {
    try {
      const res = await this.userRepository.create({ user });
      return res;
    } catch (err: any) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        throw new DuplicateUsernameError();
      } else {
        throw err;
      }
    }
  }

  async getUserProfile({ id }: { id: number }): Promise<User> {
    const user = await this.userRepository.getById({ id });
    if (!user) throw new UserNotFound();
    return user;
  }
  async deleteUser({ id }: { id: number }) {
    const user = await this.userRepository.delete({ id });
  }
}

export default UserService;
