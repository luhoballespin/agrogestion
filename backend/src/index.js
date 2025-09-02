require("dotenv").config();
const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const axios = require("axios"); // Asegúrate de tener este import

// Importar typeDefs y resolvers
const typeDefs = require("./typeDefs");
const resolvers = require("./resolvers");

// Configuración de la base de datos
mongoose
  .connect(process.env.MONGODB_URI )
  .then(() => console.log("Conectado a MongoDB"))
  .catch((err) => console.error("Error conectando a MongoDB:", err));

// Configuración de Express
const app = express();

// Configuración CORS específica
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// Endpoint proxy para cereales (Agrofy)
app.get("/api/cereales", (req, res) => {
  // Datos de ejemplo
  res.json({
    soja: { precio: 350, unidad: "USD/ton", fecha: "2025-06-19" },
    maiz: { precio: 180, unidad: "USD/ton", fecha: "2025-06-19" },
    trigo: { precio: 220, unidad: "USD/ton", fecha: "2025-06-19" },
  });
});

// Endpoint proxy para el dólar oficial
app.get("/api/dolar", async (req, res) => {
  try {
    const response = await axios.get("https://api.bluelytics.com.ar/v2/latest");
    res.json(response.data);
  } catch (error) {
    console.error("Error al obtener datos del dólar:", error.message);
    res.status(500).json({ error: "Error al obtener datos del dólar" });
  }
});

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
    
    // No exponer detalles internos en producción
    if (process.env.NODE_ENV === 'production') {
      return new Error('Error interno del servidor');
    }
    
    return err;
  },
});

// Ruta para obtener datos del BCRA

// Iniciar el servidor
async function startServer() {
  try {
    await server.start();
    server.applyMiddleware({ app, path: '/graphql' });

    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📊 GraphQL endpoint: http://localhost:${PORT}${server.graphqlPath}`);
      console.log(`🌾 Sistema de Gestión Agropecuaria iniciado correctamente`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

startServer();
