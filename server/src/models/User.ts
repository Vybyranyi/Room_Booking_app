import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface UserAttributes {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'Admin' | 'User';
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

export class User extends Model<UserAttributes, UserCreationAttributes> {
  get id(): number {
    return this.getDataValue('id');
  }
  get name(): string {
    return this.getDataValue('name');
  }
  get email(): string {
    return this.getDataValue('email');
  }
  get password(): string {
    return this.getDataValue('password');
  }
  get role(): 'Admin' | 'User' {
    return this.getDataValue('role');
  }

  public toJSON(): Omit<UserAttributes, 'password'> {
    const values = Object.assign({}, this.get()) as any;
    delete values.password;
    return values;
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('Admin', 'User'),
      defaultValue: 'User',
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: false,
  }
);
