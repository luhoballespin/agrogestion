require("dotenv").config();
const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");

// Importar typeDefs y resolvers
const typeDefs = require("./typeDefs");
const resolvers = require("./resolvers");

// Configuración de la base de datos
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/agrogestión", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Conectado a MongoDB"))
  .catch((err) => console.error("Error conectando a MongoDB:", err));

// Configuración de Express
const app = express();
app.use(cors());
app.use(express.json());

// Configuración de Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    console.log("Authorization header:", req.headers.authorization);
    // Leer el header Authorization
    const auth = req.headers.authorization || "";
    let user = null;
    if (auth && auth.startsWith("Bearer ")) {
      const token = auth.replace("Bearer ", "");
      try {
        user = jwt.verify(token, process.env.JWT_SECRET || "tu-secreto-jwt");
      } catch (e) {
        // Token inválido o expirado
        user = null;
      }
    }
    console.log("Decoded user:", user);
    console.log("JWT_SECRET:", process.env.JWT_SECRET);
    return { req: { ...req, user } };
  },
  formatError: (err) => {
    console.error("GraphQL Error:", err);
    return err;
  },
});

// Iniciar el servidor
async function startServer() {
  await server.start();
  server.applyMiddleware({ app });

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log(
      `GraphQL endpoint: http://localhost:${PORT}${server.graphqlPath}`
    );
  });
}

startServer();
