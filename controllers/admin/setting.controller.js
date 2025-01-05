const generalSetting = require("../../models/general-settings.model");
//[GET] admin/setting/general
module.exports.general = async (req, res) => {
    const record = await generalSetting.findOne({});
    res.render("admin/pages/settings/general", {
        titlePage: "General Setting" ,
        generalSetting: record
    });
}
//[PATCH] admin/setting/general
module.exports.generalPatch = async (req, res) => {
    try {
        await generalSetting.updateOne(
            {},
            req.body
        );
        req.flash("success", "Update successfully !");
        res.redirect("back");
    } catch(error) {
        console.log(error);
    }
    
}