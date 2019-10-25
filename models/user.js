'use strict';
module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        id: {
            allowNull: false,
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        username: {
            type: DataTypes.STRING,
            unique: true
        },
        email: {
            type: DataTypes.STRING,
            unique: true,
            validate: {
                isEmail: true,
                customValidator(value) {
                    if (value === null && this.email === null) {
                        throw new Error("Provide either username or email or both");
                    }
                }
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        role: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        },
        signup_type: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false
        },
    }, {
        underscored: true,
        // defaultScope: {
        //     attributes: {exclude: ['password']}
        // }
    });
    User.associate = function (models) {
        // associations can be defined here
    };
    return User;
};
