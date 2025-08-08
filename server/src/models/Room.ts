import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Room extends Model {
  public id!: number;
  public title!: string;
  public description!: string;
}

Room.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'rooms',
    timestamps: false,
  }
);

export default Room;