import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import Room from './Room';

class Booking extends Model {
  public id!: number;
  public startTime!: Date;
  public endTime!: Date;
  public creatorId!: number;
  public roomId!: number;
  public participants!: number[];
}

Booking.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    creatorId: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: 'id',
      },
      allowNull: false,
    },
    roomId: {
      type: DataTypes.INTEGER,
      references: {
        model: Room,
        key: 'id',
      },
      allowNull: false,
    },
    participants: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      defaultValue: [],
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'bookings',
    timestamps: false,
  }
);

export default Booking;