import passport from "passport";
//import jwt from 'jsonwebtoken';

export const authenticateJWT = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          status: "error",
          message: "Token expirado",
        });
      }
      if (err.name === "JsonWebTokenError") {
        return res.status(401).json({
          status: "error",
          message: "Token inválido",
        });
      }
      return res.status(401).json({
        status: "error",
        message: "Error de autenticación",
      });
    }
    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "No autorizado",
      });
    }
    req.user = user;
    next();
  })(req, res, next);
};

export const authenticateCurrent = passport.authenticate("current", {
  session: false,
});

export const handleAuthError = (err, req, res, next) => {
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      status: "error",
      message: "Sesión expirada, por favor vuelva a iniciar sesión",
    });
  }
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      status: "error",
      message: "Token inválido",
    });
  }
  if (err) {
    return res.status(401).json({
      status: "error",
      message: "No autorizado",
    });
  }
  next();
};
