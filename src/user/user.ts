type ConstructorType = {
  id?: number;
  username: string;
  password: string;
};
class User {
  public id?: number;
  public username: string;
  public password: string;
  constructor({ id, username, password }: ConstructorType) {
    this.id = id;
    this.username = username;
    this.password = password;
  }
}

export default User;
