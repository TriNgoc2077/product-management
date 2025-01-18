const mongoose = require('mongoose');
const generate = require("../helpers/generate");

const userSchema = new mongoose.Schema(
    {
        fullName: String,
        email: String,
        password: String,
        userToken: {
            type: String, 
            default: generate.generateRandomString(20)
        },
        cartId: String,
        wishlistId: String,
        phone: String,
        address: String,
        birthday: String,
        bio: String,
        avatar: String,
        listFriend: [
            {
                user_id: String,
                room_chat_id: String,
            }
        ],
        acceptFriend: Array,
        requestFriend: Array,
        online: String,
        status: {
            type: String,
            default: "active"
        },
        deletedAt: Date,
        deleted: {
            type: Boolean,
            default: false
        },
    },
    {
        timestamps: true
    }
);

const User = mongoose.model('User', userSchema, "users");

module.exports = User;