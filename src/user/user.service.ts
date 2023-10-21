export interface UserType {
  username: string;
  password: string;
}

export interface IUserCollection {}

class UserService {
  constructor(private collections: IUserCollection) {}
  loginUser(credentials: UserType) {}
  registerUser(user: UserType) {}
  searchUser(query: string) {}
  getUserProfile(userId: string) {}
}

export default UserService;
