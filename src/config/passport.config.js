import passport from "passport";
import LocalStrategy from "passport-local";
import JWTStrategy from "passport-jwt";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { userDBManager } from "../dao/userDBManager.js";

const UserManager = new userDBManager();

passport.use(
  "login",
  new LocalStrategy.Strategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const user = await UserManager.getUserByEmail(email);

        if (!user) {
          return done(null, false, { message: "Usuario no encontrado" });
        }

        const isPasswordValid = bcrypt.compareSync(password, user.password);

        if (!isPasswordValid) {
          return done(null, false, { message: "Contraseña inválida" });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    },
  ),
);

passport.use(
  "register",
  new LocalStrategy.Strategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      try {
        // Verificar usuario
        const existingUser = await UserManager.getUserByEmail(email);

        if (existingUser) {
          return done(null, false, { message: "El usuario ya existe" });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);

        const newUser = {
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          email: email,
          age: req.body.age,
          password: hashedPassword,
          role: "user",
        };

        const user = await UserManager.createUser(newUser);
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    },
  ),
);

const opts = {
  jwtFromRequest: JWTStrategy.ExtractJwt.fromExtractors([
    (req) => {
      if (req && req.cookies && req.cookies.tokens) {
        return req.cookies.tokens;
      }

      const authHeader = req.get("Authorization");
      if (authHeader) {
        return authHeader.replace("Bearer ", "");
      }
      return null;
    },
  ]),
  secretOrKey: process.env.JWT_SECRET || "tunSecreto",
};

passport.use(
  "jwt",
  new JWTStrategy.Strategy(opts, async (jwt_payload, done) => {
    try {
      const user = await UserManager.getUserByID(jwt_payload.id);

      if (!user) {
        return done(null, false);
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }),
);

passport.use(
  "current",
  new JWTStrategy.Strategy(opts, async (jwt_payload, done) => {
    try {
      const user = await UserManager.getUserByID(jwt_payload.id);

      if (!user) {
        return done(null, false, { message: "Usuario no autenticado" });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }),
);

export const generateToken = (user) => {
  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET || "tunSecreto",
    { expiresIn: "30s" },
    //{ expiresIn: '2m' }
  );
  return token;
};

export default passport;
