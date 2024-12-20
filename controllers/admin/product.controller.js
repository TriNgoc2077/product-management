const Product = require("../../models/product.model");
const ProductCategory = require("../../models/product-category.model");
const filterStatusHelpers = require("../../helpers/filterStatus");
const searchHelpers = require("../../helpers/search");
const paginationHelper = require("../../helpers/pagination");
const systemConfig = require("../../config/system");
const createTreeHelper = require("../../helpers/createTree");

// [GET] /admin/products
module.exports.index = async (req, res) => {
    //req.query: (require) query attributes in url, ex:localhost....?status="active"
    
    //filter
    const filterStatus = filterStatusHelpers(req.query);

    const find = {
        deleted: false
    };
    if (req.query.status === "deleted"){
        find.deleted = true;
    } else if (req.query.status) {
        find.status = req.query.status;
    } 
    //find
    const objectSearch = searchHelpers(req.query);

    if (objectSearch.regex) {
        find.title = objectSearch.regex;
    }
    
    //Pagination
    const countProducts = await Product.countDocuments(find);

    let objectPagination = paginationHelper(
        {
            currentPage: 1,
            limitItem: 4
        },
        req.query,
        countProducts
    );
    //End pagination

    // sort
    let sort = {};
    if (req.query.sortKey && req.query.sortValue) {
        sort[req.query.sortKey] = req.query.sortValue;
    } else {
        sort.position = "asc";
    }
    // end sort


    if (find.title !== undefined) {
        objectPagination.skip = 0;
    }
    const products = 
        await Product
            .find(find)
            .sort(sort) // desc: giamdan, asc: tang dan
            .limit(objectPagination.limitItem)
            .skip(objectPagination.skip);

    // for (const product of products) {
    //     console.log(product);
    //     if (!product.slug) {
    //         product.slug = slugify(product.title, { lower: true });
    //         await product.save();
    //     }
    // }

    res.render("admin/pages/products/index.pug", {
        titlePage: "Product List",
        products: products,
        filterStatus: filterStatus,
        keyword: objectSearch.keyword,
        pagination: objectPagination
    });
}

//[PATCH] /admin/products/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
    const status = req.params.status;
    const id = req.params.id;
    
    await Product.updateOne({ _id: id }, { status: status });

    req.flash("success", "Update status product successfully !");
    res.redirect("back");
}

//[PATCH] /admin/products/change-multi
module.exports.changeMulti = async (req, res) => {
    const type = req.body.type;
    const ids = req.body.ids.split(", ");
    console.log(ids);
    if (type == "active") {
        await Product.updateMany(
            { _id: { $in: ids } }, 
            { status: "active" }
        );
        req.flash("success", `Update status of ${ids.length} products successfully !`);
    } else if (type == "inactive") {    
        await Product.updateMany(
            { _id: { $in: ids } },
            { status: "inactive" }
        );
        req.flash("success", `Update status of ${ids.length} products successfully !`);
    } else if (type == "delete-all") {
        await Product.updateMany(
            { _id: ids },
            { 
                deleted: true,
                deletedAt: new Date() 
            }
        )
        req.flash("success", `Delete ${ids.length} products successfully !`);
    } else if (type == "change-position") {
        for (const item of ids) {
            let [id, position] = item.split("-");
            position = parseInt(position);
            // console.log(item.split("-"));
            await Product.updateOne(
                { _id: id },
                { position: position }
            );
        }
        req.flash("success", `Change position successfully !`);

    }
    res.redirect("back");
}

//[DELETE] /admin/products/delete/:id
module.exports.deleteItem = async (req, res) => {
    const id = req.params.id;

    await Product.updateOne(
        { _id: id }, 
        { 
            deleted: true,
            deletedAt: new Date() 
        }        
    );
    req.flash("success", `Delete successfully !`);
    res.redirect("back");
}

//[POST] //admin/products/restore/:id
module.exports.restoreItem = async (req, res) => {
    const id = req.params.id;

    await Product.updateOne(
        { _id: id }, 
        { 
            deleted: false
        }        
    );
    req.flash("success", `Restore successfully !`);
    res.redirect("back");
}

//[GET] //admin/products/create
module.exports.create = async (req, res) => {
    const records = await ProductCategory.find({ deleted: false });
    const newRecords = createTreeHelper.createTree(records);
    res.render("admin/pages/products/create", {
        pageTitle: "Add new product",
        category: newRecords
    });
}
//[POST] //admin/products/create
module.exports.createPost = async (req, res) => {
    // console.log(req.file);
    // console.log(req.body);
    req.body.price = parseInt(req.body.price);
    req.body.discountPercentage = parseInt(req.body.discountPercentage);
    req.body.stock = parseInt(req.body.stock);
    if (req.body.position == ""){
        const countProducts = await Product.countDocuments();
        req.body.position = countProducts + 1;
    } else {
        req.body.position = parseInt(req.body.position);
    }


    const product = new Product(req.body);
    await Product.bulkSave([product]);

    res.redirect(`${systemConfig.prefixAdmin}/products`);
}

//[GET] //admin/products/edit/:id
module.exports.edit = async (req, res) => {
    // console.log(req.params.id);
    
    try {
        const find = {
            deleted: false,
            _id: req.params.id
        };

        const product = await Product.findOne(find);
        // console.log(product);
        const records = await ProductCategory.find({ deleted: false });
        const newRecords = createTreeHelper.createTree(records);
        
        res.render("admin/pages/products/edit.pug", {
            pageTitle: "Edit product",
            product: product,
            category: newRecords
        });
    } catch(error) {
        res.redirect(`${systemConfig.prefixAdmin}/products`);
    }
}

//[PATCH] //admin/products/edit/:id
module.exports.editPatch = async (req, res) => {
    // console.log(req.body);
    req.body.price = parseInt(req.body.price);
    req.body.discountPercentage = parseInt(req.body.discountPercentage);
    req.body.stock = parseInt(req.body.stock);
    req.body.position = parseInt(req.body.position);
    if (req.file) {
        req.body.thumbnail = `/uploads/${req.file.filename}`;
    }

    try {
        await Product.updateOne(
            { _id: req.params.id }, 
            req.body
        );
        req.flash("success", "Update Successfully!");
    } catch(error) {
        console.log(error);
        req.flash("error", "Update Failed !");
    }

    res.redirect("back");
}

//[GET] //admin/products/edit/:id
module.exports.detail = async (req, res) => {
    // console.log(req.params.id);
    
    try {
        const find = {
            deleted: false,
            status: "active",
            _id: req.params.id
        };

        const product = await Product.findOne(find);
        // console.log(product);

        res.render("admin/pages/products/detail.pug", {
            pageTitle: product.title,
            product: product
        });
    } catch(error) {
        res.redirect(`${systemConfig.prefixAdmin}/products`);
    }
}

