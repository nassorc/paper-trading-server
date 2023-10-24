import { Prisma, PrismaClient, User } from "@prisma/client";
import { Optional } from "types";

type Credentials = Optional<User, "id">;

export interface UserType {
  username: string;
  password: string;
}

export interface IUserCollection {}

class UserService {
  constructor(private userCollection: Prisma.UserDelegate) {}

  async loginUser(credentials: Credentials): Promise<Credentials> {
    const user = await this.userCollection.findFirst({
      where: {
        username: {
          equals: credentials.username,
        },
        password: {
          equals: credentials.password,
        },
      },
    });
    if (!user) throw new Error("UserNotFound");
    return user;
  }

  async registerUser(user: Credentials): Promise<User> {
    const UNIQUE_CONSTRAINT_FAILED = "P2002";
    const { username, password } = user;

    const res = await this.userCollection.create({
      data: {
        username,
        password,
        wallet: {
          create: {},
        },
        portfolio: {
          create: {},
        },
      },
    });
    return res;
  }

  async registerUserWithWallet(user: Credentials) {
    // TODO?: use Wallet Serivce to create the wallet
    const newUserWithWallet = await this.userCollection.create({
      data: {
        ...user,
        wallet: {
          create: {
            funds: 0,
          },
        },
        portfolio: {
          create: {},
        },
      },
    });
  }
  async getUserById(userId: number): Promise<User> {
    const user = await this.userCollection.findFirst({
      where: {
        id: {
          equals: userId,
        },
      },
      include: {
        portfolio: {
          include: {
            stocks: true,
          },
        },
        wallet: true,
      },
    });
    console.log(user);
    if (!user) throw new Error("UserNotFound");
    return user;
  }
  async getUserProfile(username: string): Promise<User> {
    const user = await this.userCollection.findFirst({
      where: {
        username: {
          equals: username,
        },
      },
    });
    if (!user) throw new Error("UserNotFound");
    return user;
  }
}

export default UserService;
