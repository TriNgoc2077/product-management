const Cart = require("../../models/cart.model");
module.exports.cartId = async (req, res, next) => {
    if (!req.cookies.cartId) {
        const cart = new Cart();
        console.log(cart);
        await cart.save();
                
        const expires = 1000 * 3600 * 24 * 365;
        res.cookie("cartId", cart.id, {
            expires: new Date(Date.now() + expires)
        });
        res.locals.miniCart = cart;

    } else {
        const cart = await Cart.findOne(
            { _id: req.cookies.cartId },
        );
        res.locals.miniCart = cart;
    }
    next();
}