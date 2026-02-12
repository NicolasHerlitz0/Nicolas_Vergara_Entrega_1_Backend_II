import { Router } from "express";
import passport from "passport";
import { generateToken } from "../config/passport.config.js";
import { authenticateCurrent } from "../middlewares/auth.middleware.js"; //futuro
import { userDBManager } from "../dao/userDBManager.js";
import { cartModel } from "../dao/models/cartModel.js";

const router = Router();
const UserManager = new userDBManager();

router.post(
  "/register",
  passport.authenticate("register", { session: false }),
  async (req, res) => {
    try {
      const newCart = await cartModel.create({ products: [] });

      const user = await UserManager.updateUser(req.user._id, {
        cart: newCart._id,
      });

      const token = generateToken(user);

      res.cookie("tokens", token, {
        maxAge: 30 * 1000, // 30s
        //maxAge: 2 * 60 * 1000, // 2m
        httpOnly: true,
        secure: false,
      });

      res.status(201).json({
        status: "success",
        message: "Usuario registrado exitosamente",
        user: {
          id: user._id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          age: user.age,
          role: user.role,
        },
        token,
      });
    } catch (error) {
      res.status(400).json({
        status: "error",
        message: error.message,
      });
    }
  },
);

router.post(
  "/login",
  passport.authenticate("login", { session: false }),
  async (req, res) => {
    try {
      const token = generateToken(req.user);

      res.cookie("tokens", token, {
        maxAge: 30 * 1000, // 30s
        //maxAge: 2 * 60 * 1000, // 2m
        httpOnly: true,
        secure: false,
      });

      res.json({
        status: "success",
        message: "Login exitoso",
        user: {
          id: req.user._id,
          first_name: req.user.first_name,
          last_name: req.user.last_name,
          email: req.user.email,
          age: req.user.age,
          role: req.user.role,
        },
        token,
      });
    } catch (error) {
      res.status(400).json({
        status: "error",
        message: error.message,
      });
    }
  },
);

router.get("/current", (req, res, next) => {
  passport.authenticate(
    "current",
    { session: false },
    async (err, user, info) => {
      if (err) {
        return res.status(401).json({ status: "error", message: err.message });
      }
      if (!user) {
        return res
          .status(401)
          .json({
            status: "error",
            message: info?.message || "Usuario no autenticado",
          });
      }

      try {
        const fullUser = await UserManager.getUserByID(user._id);
        if (!fullUser)
          return res
            .status(401)
            .json({ status: "error", message: "Usuario no autenticado" });

        return res.json({
          status: "success",
          user: {
            id: fullUser._id,
            first_name: fullUser.first_name,
            last_name: fullUser.last_name,
            email: fullUser.email,
            age: fullUser.age,
            cart: fullUser.cart,
            role: fullUser.role,
          },
        });
      } catch (e) {
        return res
          .status(500)
          .json({ status: "error", message: "Error interno" });
      }
    },
  )(req, res, next);
});

router.post("/logout", (req, res) => {
  const token = req.cookies.tokens;
  let userId = null;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.id;
    } catch (e) {}
  }

  res.clearCookie("tokens");

  res.json({
    status: "success",
    message: "Sesión cerrada",
  });
});

//Router de desarrollo temporal

// Temporal para eliminar usuario por ID (solo para desarrollo, sin protección)
router.delete("/user/:uid", async (req, res) => {
  try {
    const user = await UserManager.deleteUser(req.params.uid);
    res.json({
      status: "success",
      message: "Usuario eliminado",
      payload: user,
    });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
});

// Temporal para obtener todos los usuarios (solo para desarrollo)
router.get("/users", async (req, res) => {
  try {
    const users = await UserManager.getAllUsers();
    res.json({ status: "success", payload: users });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
});

export default router;
