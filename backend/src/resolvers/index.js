const { ApolloServer } = require("apollo-server-express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Product = require("../models/Product");
const Client = require("../models/Client");
const Sale = require("../models/Sale");
const Supplier = require("../models/Supplier");

const resolvers = {
  Query: {
    me: async (_, __, { req }) => {
      if (!req.user) throw new Error("No autenticado");
      return req.user;
    },
    users: async (_, __, { req }) => {
      if (!req.user || req.user.role !== "admin")
        throw new Error("No autorizado");
      return User.find();
    },
    products: async () => {
      const products = await Product.find().populate('supplier');
      return products.map(product => ({
        ...product.toObject(),
        id: product._id.toString(),
        createdAt: product.createdAt ? product.createdAt.toISOString() : null,
        updatedAt: product.updatedAt ? product.updatedAt.toISOString() : null,
        supplier: product.supplier ? {
          ...product.supplier.toObject(),
          id: product.supplier._id.toString()
        } : null
      }));
    },
    product: async (_, { id }) => {
      return Product.findById(id);
    },
    clients: async () => {
      return Client.find();
    },
    client: async (_, { id }) => {
      return Client.findById(id);
    },
    sales: async () => {
      const sales = await Sale.find().populate("client products.product createdBy");
      return sales.map(sale => ({
        ...sale.toObject(),
        id: sale._id.toString(),
        createdAt: sale.createdAt ? sale.createdAt.toISOString() : null,
        client: sale.client ? { ...sale.client.toObject(), id: sale.client._id.toString() } : null,
        products: sale.products.map(p => ({
          ...p,
          product: p.product ? { ...p.product.toObject(), id: p.product._id.toString() } : null
        })),
        createdBy: sale.createdBy ? { ...sale.createdBy.toObject(), id: sale.createdBy._id.toString() } : null
      }));
    },
    sale: async (_, { id }) => {
      return Sale.findById(id).populate("client products.product createdBy");
    },
    suppliers: async () => {
      const suppliers = await Supplier.find();
      return suppliers.map(supplier => ({
        ...supplier.toObject(),
        id: supplier._id.toString(),
        createdAt: supplier.createdAt ? supplier.createdAt.toISOString() : null,
        updatedAt: supplier.updatedAt ? supplier.updatedAt.toISOString() : null
      }));
    },
    supplier: async (_, { id }) => {
      const supplier = await Supplier.findById(id);
      if (!supplier) return null;
      return {
        ...supplier.toObject(),
        id: supplier._id.toString(),
        createdAt: supplier.createdAt ? supplier.createdAt.toISOString() : null,
        updatedAt: supplier.updatedAt ? supplier.updatedAt.toISOString() : null
      };
    },
  },

  Product: {
    price: (parent) => {
      // Si `price` ya es objeto, devuélvelo tal cual
      if (typeof parent.price === 'object') return parent.price;
      // Si `price` es número, devuélvelo envuelto
      return {
        current: parent.price,
        currency: parent.currency || "ARS",
        lastUpdate: new Date().toISOString(),
      };
    },
  },

  Mutation: {
    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) throw new Error("Usuario no encontrado");

      const valid = await user.comparePassword(password);
      if (!valid) throw new Error("Contraseña incorrecta");

      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET || "tu-secreto-jwt",
        { expiresIn: "1d" }
      );

      return {
        token,
        user,
      };
    },

    register: async (_, { email, password, name }) => {
      const existingUser = await User.findOne({ email });
      if (existingUser) throw new Error("El email ya está registrado");

      const user = new User({ email, password, name });
      await user.save();
      return {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
      };
    },

    createUser: async (_, { email, password, name, role }, { req }) => {
      if (!req.user || req.user.role !== "admin")
        throw new Error("No autorizado");

      const existingUser = await User.findOne({ email });
      if (existingUser) throw new Error("El email ya está registrado");

      const user = new User({ email, password, name, role: role || "user" });
      await user.save();
      return user;
    },

    createProduct: async (_, args, { req }) => {
      if (!req.user) throw new Error("No autenticado");

      const product = new Product({
        ...args,
        price: {
          current: args.price,
          currency: args.currency || "ARS",
          lastUpdate: new Date(),
        },
      });

      await product.save();
      return product;
    },

    updateProduct: async (_, args, { req }) => {
      if (!req.user) throw new Error("No autenticado");

      const { id, price, currency, ...fieldsToUpdate } = args;

      if (price !== undefined) {
        fieldsToUpdate.price = {
          current: price,
          currency: currency || "ARS",
          lastUpdate: new Date(),
        };
      }

      Object.keys(fieldsToUpdate).forEach(
        (key) => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
      );

      const product = await Product.findByIdAndUpdate(
        id,
        { $set: fieldsToUpdate },
        { new: true }
      );

      if (!product) throw new Error("Producto no encontrado");
      return product;
    },

    createClient: async (_, args, { req }) => {
      if (!req.user) throw new Error("No autenticado");

      const existingClient = await Client.findOne({
        documentNumber: args.documentNumber,
      });
      if (existingClient)
        throw new Error("El número de documento ya está registrado");

      const client = new Client({
        ...args,
        createdBy: req.user.id,
      });

      await client.save();
      return client;
    },

    updateClient: async (_, { id, ...updates }, { req }) => {
      if (!req.user) throw new Error("No autenticado");

      const client = await Client.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true }
      );

      if (!client) throw new Error("Cliente no encontrado");
      return client;
    },

    createSale: async (_, { client, products, paymentMethod, notes }, { req }) => {
      if (!req.user) throw new Error("No autenticado");

      // Validar que el cliente existe
      const clientExists = await Client.findById(client);
      if (!clientExists) throw new Error("Cliente no encontrado");

      // Validar límite de crédito si el método de pago es crédito
      if (paymentMethod === 'credit') {
        const clientWithCredit = await Client.findById(client);
        if (clientWithCredit.creditLimit <= 0) {
          throw new Error("El cliente no tiene límite de crédito asignado");
        }
      }

      let totalAmount = 0;
      const saleProducts = await Promise.all(
        products.map(async (p) => {
          const product = await Product.findById(p.product);
          if (!product) throw new Error(`Producto no encontrado: ${p.product}`);

          if (!product.active) {
            throw new Error(`El producto ${product.name} no está activo`);
          }

          if (product.stock < p.quantity) {
            throw new Error(`Stock insuficiente para ${product.name}. Disponible: ${product.stock} ${product.unit}`);
          }

          const amount = p.quantity * p.unitPrice;
          totalAmount += amount;

          // Actualizar stock del producto
          product.stock -= p.quantity;
          await product.save();

          return {
            product: p.product,
            quantity: p.quantity,
            unitPrice: p.unitPrice,
            currency: p.currency || "ARS",
          };
        })
      );

      // Validar límite de crédito total
      if (paymentMethod === 'credit') {
        const clientWithCredit = await Client.findById(client);
        if (totalAmount > clientWithCredit.creditLimit) {
          throw new Error(`El monto total ($${totalAmount}) excede el límite de crédito del cliente ($${clientWithCredit.creditLimit})`);
        }
      }

      const sale = new Sale({
        client,
        products: saleProducts,
        totalAmount,
        paymentMethod,
        notes,
        createdBy: req.user.id,
      });

      await sale.save();
      return sale.populate("client products.product createdBy");
    },

    updateSale: async (_, { id, status, notes }, { req }) => {
      if (!req.user) throw new Error("No autenticado");

      const sale = await Sale.findByIdAndUpdate(
        id,
        { $set: { status, notes } },
        { new: true }
      ).populate("client products.product createdBy");

      if (!sale) throw new Error("Venta no encontrada");
      return sale;
    },

    deleteSale: async (_, { id }, { req }) => {
      if (!req.user) throw new Error("No autenticado");

      const deleted = await Sale.findByIdAndDelete(id);
      if (!deleted) throw new Error("Venta no encontrada");
      return true;
    },

    updateUser: async (_, { id, email, name, role }, { req }) => {
      if (!req.user || req.user.role !== "admin")
        throw new Error("No autorizado");

      const user = await User.findByIdAndUpdate(
        id,
        { $set: { email, name, role } },
        { new: true }
      );

      if (!user) throw new Error("Usuario no encontrado");
      return user;
    },

    deleteUser: async (_, { id }, { req }) => {
      if (!req.user || req.user.role !== "admin")
        throw new Error("No autorizado");

      const deleted = await User.findByIdAndDelete(id);
      if (!deleted) throw new Error("Usuario no encontrado");
      return true;
    },

    deleteProduct: async (_, { id }, { req }) => {
      if (!req.user) throw new Error("No autenticado");

      const deleted = await Product.findByIdAndDelete(id);
      if (!deleted) throw new Error("Producto no encontrado");
      return deleted;
    },

    deleteClient: async (_, { id }, { req }) => {
      if (!req.user) throw new Error("No autenticado");

      const deleted = await Client.findByIdAndDelete(id);
      if (!deleted) throw new Error("Cliente no encontrado");
      return true;
    },

    createSupplier: async (_, args, { req }) => {
      if (!req.user) throw new Error("No autenticado");

      const supplier = new Supplier({
        ...args,
        createdBy: req.user.id,
      });

      await supplier.save();
      return supplier;
    },

    updateSupplier: async (_, { id, ...updates }, { req }) => {
      if (!req.user) throw new Error("No autenticado");

      const supplier = await Supplier.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true }
      );

      if (!supplier) throw new Error("Proveedor no encontrado");
      return supplier;
    },

    deleteSupplier: async (_, { id }, { req }) => {
      if (!req.user) throw new Error("No autenticado");

      const deleted = await Supplier.findByIdAndDelete(id);
      if (!deleted) throw new Error("Proveedor no encontrado");
      return true;
    },
  },
};

module.exports = resolvers;
