const faq = require("../controllers/faq.controller");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

module.exports = (app) => {
    app.post("/api/v1/admin/faq", isAuthenticatedUser, authorizeRoles("admin"), faq.create);
    app.patch("/api/v1/admin/faq/:id",isAuthenticatedUser, authorizeRoles("admin"),faq.update);
    app.get("/api/v1/admin/faq/:id", faq.getId);
    app.get("/api/v1/admin/faq", faq.get);
    app.delete("/api/v1/admin/faq/:id",isAuthenticatedUser, authorizeRoles("admin"),faq.delete);
    app.get("/api/v1/faq/:id", faq.getId);
    app.get("/api/v1/faq", faq.get);
};
