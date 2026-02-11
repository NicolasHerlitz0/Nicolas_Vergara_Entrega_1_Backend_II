import { Router } from "express";
import passport from "passport";
import { productDBManager } from "../dao/productDBManager.js";
import { cartDBManager } from "../dao/cartDBManager.js";

const router = Router();
const ProductService = new productDBManager();
const CartService = new cartDBManager(ProductService);

router.get("/", (req, res, next) => {
  passport.authenticate("current", { session: false }, (err, user, info) => {
    if (err || !user) return res.redirect("/login");
    return res.redirect("/products");
  })(req, res, next);
});

router.get("/login", (req, res) => {
  res.render("login", { title: "Login", style: "index.css" });
});

router.get("/register", (req, res) => {
  res.render("register", { title: "Registro", style: "index.css" });
});

router.get("/profile", (req, res, next) => {
  passport.authenticate("current", { session: false }, (err, user, info) => {
    if (err || !user) return res.redirect("/login");
    return res.render("profile", { title: "Perfil", style: "index.css" });
  })(req, res, next);
});

router.get("/products", async (req, res) => {
  const products = await ProductService.getAllProducts(req.query);

  res.render("index", {
    title: "Productos",
    style: "index.css",
    products: JSON.parse(JSON.stringify(products.docs)),
    prevLink: {
      exist: products.prevLink ? true : false,
      link: products.prevLink,
    },
    nextLink: {
      exist: products.nextLink ? true : false,
      link: products.nextLink,
    },
  });
});

router.get("/realtimeproducts", async (req, res) => {
  const products = await ProductService.getAllProducts(req.query);
  res.render("realTimeProducts", {
    title: "Productos",
    style: "index.css",
    products: JSON.parse(JSON.stringify(products.docs)),
  });
});

router.get("/cart/:cid", async (req, res) => {
  try {
    const response = await CartService.getProductsFromCartByID(req.params.cid);

    res.render("cart", {
      title: "Carrito",
      style: "index.css",
      products: JSON.parse(JSON.stringify(response.products)),
    });
  } catch (error) {
    console.error("Error al obtener carrito:", error.message);
    res.render("notFound", {
      title: "Carrito no encontrado",
      style: "index.css",
      message: "El carrito no existe o fue eliminado",
    });
  }
});

export default router;
