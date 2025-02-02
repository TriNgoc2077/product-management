const mongoose = require('mongoose');
const slug = require("mongoose-slug-updater");

mongoose.plugin(slug);

const productSchema = new mongoose.Schema(
    {
        
        title: String,
        product_category_id: {
            type: String,
            default: ""
        },
        description: String,
        price: Number,
        discountPercentage: Number,
        stock: Number,
        thumbnail: String,
        status: String,
        featured: String,
        position: Number,
        slug: {
            type: String,
            slug: "title",
            unique: true
        },
        // deletedAt: Date,
        review: [
            {
                userAvatar: String, 
                userFullname: String,
                content: String,
                createdAt: {
                    type: Date, 
                    default: Date.now
                }
            }
        ],
        deleted: {
            type: Boolean,
            default: false
        },
        deletedBy: [
            {
                account_id: String,
                deleteAt: Date
            },
        ],
        createdBy: {
            account_id: String,
            createAt: {
                type: Date,
                default: Date.now
            }
        },
        updatedBy: [
            {
                account_id: Array,
                updateAt: Date,
            }
        ]
    },
    {
        timestamps: true
    }
);

const Product = mongoose.model('Product', productSchema, "product");

module.exports = Product;