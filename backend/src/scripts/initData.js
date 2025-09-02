require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Client = require('../models/Client');
const Supplier = require('../models/Supplier');

async function initData() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Crear usuario administrador
    const adminUser = await User.findOne({ email: 'admin@agro.com' });
    if (!adminUser) {
      const admin = new User({
        email: 'admin@agro.com',
        password: 'admin123',
        name: 'Administrador',
        role: 'admin'
      });
      await admin.save();
      console.log('✅ Usuario administrador creado: admin@agro.com / admin123');
    }

    // Crear usuario de prueba
    const testUser = await User.findOne({ email: 'usuario@agro.com' });
    if (!testUser) {
      const user = new User({
        email: 'usuario@agro.com',
        password: 'usuario123',
        name: 'Usuario de Prueba',
        role: 'user'
      });
      await user.save();
      console.log('✅ Usuario de prueba creado: usuario@agro.com / usuario123');
    }

    // Crear proveedores de ejemplo
    const suppliers = [
      {
        name: 'AgroSupply S.A.',
        contactInfo: {
          email: 'ventas@agrosupply.com',
          phone: '+54 11 1234-5678',
          address: {
            street: 'Av. Corrientes 1234',
            city: 'Buenos Aires',
            state: 'CABA',
            zipCode: '1043'
          }
        },
        businessInfo: {
          businessName: 'AgroSupply S.A.',
          taxCategory: 'Responsable Inscripto',
          cuit: '30-12345678-9'
        },
        createdBy: (await User.findOne({ email: 'admin@agro.com' }))._id
      },
      {
        name: 'Semillas del Sur',
        contactInfo: {
          email: 'info@semillasdelsur.com',
          phone: '+54 341 987-6543',
          address: {
            street: 'Ruta 9 Km 123',
            city: 'Rosario',
            state: 'Santa Fe',
            zipCode: '2000'
          }
        },
        businessInfo: {
          businessName: 'Semillas del Sur S.R.L.',
          taxCategory: 'Monotributo',
          cuit: '20-98765432-1'
        },
        createdBy: (await User.findOne({ email: 'admin@agro.com' }))._id
      }
    ];

    for (const supplierData of suppliers) {
      const existingSupplier = await Supplier.findOne({ name: supplierData.name });
      if (!existingSupplier) {
        const supplier = new Supplier(supplierData);
        await supplier.save();
        console.log(`✅ Proveedor creado: ${supplierData.name}`);
      }
    }

    // Crear productos de ejemplo
    const adminUserId = (await User.findOne({ email: 'admin@agro.com' }))._id;
    const supplierId = (await Supplier.findOne({ name: 'AgroSupply S.A.' }))._id;

    const products = [
      {
        name: 'Soja RR',
        category: 'semilla',
        description: 'Semilla de soja Roundup Ready',
        sku: 'SOJA-RR-001',
        stock: 1000,
        unit: 'kg',
        price: { current: 450, currency: 'USD', lastUpdate: new Date() },
        supplier: supplierId,
        minStock: 100,
        location: { warehouse: 'A', shelf: '1A' },
        active: true
      },
      {
        name: 'Maíz Híbrido',
        category: 'semilla',
        description: 'Semilla de maíz híbrido de alto rendimiento',
        sku: 'MAIZ-HIB-001',
        stock: 500,
        unit: 'kg',
        price: { current: 280, currency: 'USD', lastUpdate: new Date() },
        supplier: supplierId,
        minStock: 50,
        location: { warehouse: 'A', shelf: '1B' },
        active: true
      },
      {
        name: 'Urea 46%',
        category: 'fertilizante',
        description: 'Fertilizante nitrogenado',
        sku: 'UREA-46-001',
        stock: 2000,
        unit: 'kg',
        price: { current: 120, currency: 'USD', lastUpdate: new Date() },
        supplier: supplierId,
        minStock: 200,
        location: { warehouse: 'B', shelf: '2A' },
        active: true
      },
      {
        name: 'Glifosato 48%',
        category: 'insumo',
        description: 'Herbicida no selectivo',
        sku: 'GLIF-48-001',
        stock: 100,
        unit: 'litro',
        price: { current: 8.5, currency: 'USD', lastUpdate: new Date() },
        supplier: supplierId,
        minStock: 20,
        location: { warehouse: 'C', shelf: '3A' },
        active: true
      }
    ];

    for (const productData of products) {
      const existingProduct = await Product.findOne({ sku: productData.sku });
      if (!existingProduct) {
        const product = new Product(productData);
        await product.save();
        console.log(`✅ Producto creado: ${productData.name}`);
      }
    }

    // Crear clientes de ejemplo
    const clients = [
      {
        name: 'Juan Pérez',
        type: 'individual',
        documentType: 'dni',
        documentNumber: '12345678',
        email: 'juan.perez@email.com',
        phone: '+54 9 11 1234-5678',
        address: {
          street: 'Av. San Martín 123',
          city: 'Córdoba',
          state: 'Córdoba',
          zipCode: '5000'
        },
        creditLimit: 50000,
        paymentTerms: 30,
        status: 'active',
        createdBy: adminUserId
      },
      {
        name: 'Estancia La Esperanza',
        type: 'company',
        documentType: 'cuit',
        documentNumber: '30-87654321-0',
        email: 'ventas@laesperanza.com',
        phone: '+54 9 341 987-6543',
        address: {
          street: 'Ruta 7 Km 45',
          city: 'San Luis',
          state: 'San Luis',
          zipCode: '5700'
        },
        businessInfo: {
          businessName: 'Estancia La Esperanza S.A.',
          taxCategory: 'Responsable Inscripto',
          taxStatus: 'Activo'
        },
        creditLimit: 200000,
        paymentTerms: 60,
        status: 'active',
        createdBy: adminUserId
      }
    ];

    for (const clientData of clients) {
      const existingClient = await Client.findOne({ documentNumber: clientData.documentNumber });
      if (!existingClient) {
        const client = new Client(clientData);
        await client.save();
        console.log(`✅ Cliente creado: ${clientData.name}`);
      }
    }

    console.log('\n🎉 ¡Datos de inicialización completados exitosamente!');
    console.log('\n📋 Credenciales de acceso:');
    console.log('👤 Admin: admin@agro.com / admin123');
    console.log('👤 Usuario: usuario@agro.com / usuario123');
    console.log('\n🚀 El sistema está listo para usar!');

  } catch (error) {
    console.error('❌ Error durante la inicialización:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

initData();
