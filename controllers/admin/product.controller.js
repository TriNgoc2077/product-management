const Product = require("../../models/product.model");

const filterStatusHelpers = require("../../helpers/filterStatus");
const searchHelpers = require("../../helpers/search");
const paginationHelper = require("../../helpers/pagination");

// [GET] /admin/products
module.exports.index = async (req, res) => {
    //req.query: (require) query attributes in url, ex:localhost....?status="active"
    
    //filter
    const filterStatus = filterStatusHelpers(req.query);

    const find = {
        deleted: false
    };
    if (req.query.status) {
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

    const products = 
        await Product
            .find(find)
            .limit(objectPagination.limitItem)
            .skip(objectPagination.skip);

    res.render("admin/pages/products/index.pug", {
        titlePage: "Product List",
        products: products,
        filterStatus: filterStatus,
        keyword: objectSearch.keyword,
        pagination: objectPagination
    });
}

//[GET] /admin/products/change-status/:status/:id
//To change the state, necessary to access to database and change data
//. but url can only accessed using get method
module.exports.changeStatus = async (req, res) => {
    const status = req.params.status;
    const id = req.params.id;
    
    await Product.updateOne({ _id: id }, { status: status });

    res.redirect("back");
}