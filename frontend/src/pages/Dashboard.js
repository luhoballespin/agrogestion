import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Alert,
  LinearProgress,
} from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import { useQuery, gql } from "@apollo/client";
import SummaryCard from "../components/SummaryCard";
import {
  TrendingUp,
  TrendingDown,
  AttachMoney,
  ShoppingCart,
  Inventory,
  People,
  Warning,
  CheckCircle,
} from "@mui/icons-material";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const GET_SALES = gql`
  query GetSales {
    sales {
      id
      totalAmount
      status
      paymentMethod
      createdAt
      products {
        product {
          name
          category
        }
        quantity
        unitPrice
        currency
      }
    }
  }
`;

const GET_PRODUCTS = gql`
  query GetProducts {
    products {
      id
      name
      stock
      minStock
      category
      price {
        current
        currency
      }
      active
    }
  }
`;

const GET_CLIENTS = gql`
  query GetClients {
    clients {
      id
      name
      status
      creditLimit
    }
  }
`;

function Dashboard() {
  const [dolarOficial, setDolarOficial] = useState(null);
  const [dolarFecha, setDolarFecha] = useState(null);
  const [cereales, setCereales] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingCereales, setLoadingCereales] = useState(true);

  const { data: salesData, loading: loadingSales } = useQuery(GET_SALES, {
    fetchPolicy: "network-only",
  });
  const { data: productsData, loading: loadingProducts } =
    useQuery(GET_PRODUCTS);
  const { data: clientsData, loading: loadingClients } = useQuery(GET_CLIENTS);

  useEffect(() => {
    const fetchDatos = async () => {
      setLoading(true);
      try {
        const dolarRes = await axios.get("http://localhost:4000/api/dolar");
        if (
          dolarRes.data?.oficial?.value_buy !== undefined &&
          dolarRes.data?.oficial?.value_sell !== undefined
        ) {
          setDolarOficial({
            compra: dolarRes.data.oficial.value_buy,
            venta: dolarRes.data.oficial.value_sell,
          });
          setDolarFecha(dolarRes.data.last_update);
        }
      } catch (err) {
        setDolarOficial(null);
        setDolarFecha(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDatos();
  }, []);

  useEffect(() => {
    const fetchCereales = async () => {
      setLoadingCereales(true);
      try {
        const response = await axios.get("http://localhost:4000/api/cereales");
        setCereales(response.data);
      } catch (err) {
        setCereales(null);
      } finally {
        setLoadingCereales(false);
      }
    };
    fetchCereales();
  }, []);

  // Procesar métricas de ventas
  const ventasPorProducto = {};
  const ventasPorCategoria = {};
  const ventasPorMes = {};
  let totalCantidadVendida = 0;
  let totalVentasDinero = 0;
  let ventasCompletadas = 0;
  let ventasPendientes = 0;

  if (salesData && salesData.sales) {
    salesData.sales.forEach((venta) => {
      // Contar por estado
      if (venta.status === "completed") ventasCompletadas++;
      if (venta.status === "pending") ventasPendientes++;

      // Procesar productos
      venta.products.forEach((p) => {
        const nombre = p.product?.name || "Sin nombre";
        const categoria = p.product?.category || "Sin categoría";
        const precioUnitario = p.unitPrice || 0;
        const cantidad = p.quantity || 0;

        // Por producto
        ventasPorProducto[nombre] = (ventasPorProducto[nombre] || 0) + cantidad;

        // Por categoría
        ventasPorCategoria[categoria] =
          (ventasPorCategoria[categoria] || 0) + cantidad;

        totalCantidadVendida += cantidad;
        totalVentasDinero += precioUnitario * cantidad;
      });

      // Por mes
      const mes = new Date(venta.createdAt).toLocaleDateString("es-ES", {
        month: "short",
      });
      ventasPorMes[mes] = (ventasPorMes[mes] || 0) + venta.totalAmount;
    });
  }

  // Datos para gráficos
  const ventasData = Object.entries(ventasPorProducto).map(([name, value]) => ({
    name,
    value:
      totalCantidadVendida > 0
        ? ((value / totalCantidadVendida) * 100).toFixed(2)
        : 0,
  }));

  const categoriaData = Object.entries(ventasPorCategoria).map(
    ([name, value]) => ({
      name,
      cantidad: value,
    })
  );

  const ventasMensualesData = Object.entries(ventasPorMes).map(
    ([name, value]) => ({
      mes: name,
      total: value,
    })
  );

  // Métricas de inventario
  const productosBajoStock =
    productsData?.products?.filter((p) => p.stock <= p.minStock) || [];
  const productosSinStock =
    productsData?.products?.filter((p) => p.stock === 0) || [];
  const totalProductos = productsData?.products?.length || 0;
  const productosActivos =
    productsData?.products?.filter((p) => p.active)?.length || 0;

  // Métricas de clientes
  const clientesActivos =
    clientsData?.clients?.filter((c) => c.status === "active")?.length || 0;
  const totalClientes = clientsData?.clients?.length || 0;

  if (loading || loadingSales || loadingProducts || loadingClients) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        minHeight="80vh"
        justifyContent="center"
      >
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Cargando Dashboard...
        </Typography>
        <LinearProgress sx={{ width: "50%", mt: 2 }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, backgroundColor: "#f5f6fa", minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: "bold",
            background: "linear-gradient(45deg, #2E7D32, #4CAF50)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          🌾 Dashboard Agropecuario
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Panel de control y métricas del sistema de gestión agropecuaria
        </Typography>
      </Box>

      {/* Métricas principales */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Total Ventas"
            value={`$${totalVentasDinero.toLocaleString("es-AR", {
              minimumFractionDigits: 2,
            })}`}
            subtitle={`${ventasCompletadas} completadas, ${ventasPendientes} pendientes`}
            icon={<AttachMoney />}
            color="#2E7D32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Productos"
            value={totalProductos}
            subtitle={`${productosActivos} activos, ${productosBajoStock.length} bajo stock`}
            icon={<Inventory />}
            color="#1976D2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Clientes"
            value={totalClientes}
            subtitle={`${clientesActivos} activos`}
            icon={<People />}
            color="#7B1FA2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Cotización Dólar"
            value={dolarOficial ? `$${dolarOficial.venta}` : "N/A"}
            subtitle={
              dolarOficial ? `Compra: $${dolarOficial.compra}` : "Sin datos"
            }
            icon={<TrendingUp />}
            color="#F57C00"
          />
        </Grid>
      </Grid>

      {/* Alertas importantes */}
      {(productosSinStock.length > 0 || productosBajoStock.length > 0) && (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {productosSinStock.length > 0 && (
            <Grid item xs={12} md={6}>
              <Alert severity="error" icon={<Warning />}>
                <Typography variant="subtitle2" gutterBottom>
                  Productos sin stock ({productosSinStock.length})
                </Typography>
                <Typography variant="body2">
                  {productosSinStock
                    .slice(0, 3)
                    .map((p) => p.name)
                    .join(", ")}
                  {productosSinStock.length > 3 && "..."}
                </Typography>
              </Alert>
            </Grid>
          )}
          {productosBajoStock.length > 0 && (
            <Grid item xs={12} md={6}>
              <Alert severity="warning" icon={<Warning />}>
                <Typography variant="subtitle2" gutterBottom>
                  Productos bajo stock mínimo ({productosBajoStock.length})
                </Typography>
                <Typography variant="body2">
                  {productosBajoStock
                    .slice(0, 3)
                    .map((p) => p.name)
                    .join(", ")}
                  {productosBajoStock.length > 3 && "..."}
                </Typography>
              </Alert>
            </Grid>
          )}
        </Grid>
      )}

      {/* Gráficos */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Ventas por producto */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: 400 }}>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center" }}
              >
                <ShoppingCart sx={{ mr: 1 }} />
                Ventas por Producto
              </Typography>
              {ventasData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={ventasData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {ventasData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  height={300}
                >
                  <Typography color="text.secondary">
                    No hay datos de ventas
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Ventas por categoría */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: 400 }}>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center" }}
              >
                <TrendingUp sx={{ mr: 1 }} />
                Ventas por Categoría
              </Typography>
              {categoriaData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoriaData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="cantidad" fill="#4CAF50" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  height={300}
                >
                  <Typography color="text.secondary">
                    No hay datos de categorías
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Cotizaciones de cereales */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center" }}
              >
                <TrendingUp sx={{ mr: 1 }} />
                Cotizaciones de Cereales
              </Typography>
              {loadingCereales ? (
                <Box display="flex" justifyContent="center" p={3}>
                  <CircularProgress />
                </Box>
              ) : cereales ? (
                <Grid container spacing={2}>
                  {Object.entries(cereales).map(([nombre, datos]) => (
                    <Grid item xs={12} sm={6} md={4} key={nombre}>
                      <Paper
                        sx={{
                          p: 2,
                          textAlign: "center",
                          backgroundColor: "#f8f9fa",
                        }}
                      >
                        <Typography variant="h6" color="primary">
                          {nombre.charAt(0).toUpperCase() + nombre.slice(1)}
                        </Typography>
                        <Typography
                          variant="h5"
                          sx={{ fontWeight: "bold", color: "#2E7D32" }}
                        >
                          ${datos.precio}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {datos.unidad}
                        </Typography>
                        <Chip
                          label={datos.fecha}
                          size="small"
                          sx={{ mt: 1 }}
                          color="primary"
                          variant="outlined"
                        />
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Alert severity="info">
                  No hay datos de cereales disponibles en este momento.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Resumen de estado */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center" }}
              >
                <CheckCircle sx={{ mr: 1 }} />
                Estado del Sistema
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="body2">Productos Activos</Typography>
                  <Typography variant="body2" color="primary">
                    {productosActivos}/{totalProductos}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(productosActivos / totalProductos) * 100}
                  sx={{ mb: 2 }}
                />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="body2">Clientes Activos</Typography>
                  <Typography variant="body2" color="primary">
                    {clientesActivos}/{totalClientes}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(clientesActivos / totalClientes) * 100}
                  sx={{ mb: 2 }}
                />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="body2">Ventas Completadas</Typography>
                  <Typography variant="body2" color="success.main">
                    {ventasCompletadas}/{ventasCompletadas + ventasPendientes}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={
                    ventasCompletadas + ventasPendientes > 0
                      ? (ventasCompletadas /
                          (ventasCompletadas + ventasPendientes)) *
                        100
                      : 0
                  }
                  color="success"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;
