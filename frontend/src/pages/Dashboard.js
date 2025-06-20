import React, { useEffect, useState } from "react";
import axios from "axios";
import { Grid, Paper, Typography, Box, CircularProgress } from "@mui/material";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

// Componentes personalizados
import SummaryCard from "../components/SummaryCard";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

function Dashboard() {
  const [dolarOficial, setDolarOficial] = useState(null);
  const [dolarFecha, setDolarFecha] = useState(null);
  const [cerealesData, setCerealesData] = useState(null);
  const [ventasData, setVentasData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cereales, setCereales] = useState(null);
  const [loadingCereales, setLoadingCereales] = useState(true);

  useEffect(() => {
    const fetchDatos = async () => {
      setLoading(true);
      setError(null);

      try {
        // Dólar
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

        // Cereales

        // Simulación de datos de ventas
        const ventasSimuladas = [
          { name: "Soja", value: 60000 },
          { name: "Maíz", value: 50000 },
          { name: "Trigo", value: 40000 },
        ];
        setVentasData(ventasSimuladas);
      } catch (err) {
        console.error("Error al cargar datos:", err);
        setError("Error al obtener datos");
        setDolarOficial(null);
        setDolarFecha(null);
        setCerealesData(null);
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
        console.error("Error al obtener datos de cereales:", err);
        setCereales(null);
      } finally {
        setLoadingCereales(false);
      }
    };

    fetchCereales();
  }, []);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // 👉 Cálculo de total y promedio de ventas
  const totalVentas = ventasData.reduce((acc, item) => acc + item.value, 0);
  const promedioVentas =
    ventasData.length > 0 ? (totalVentas / ventasData.length).toFixed(2) : 0;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Tarjetas de resumen */}
        <Grid item xs={12} md={4}>
          <SummaryCard
            title="Cotización Dólar"
            value={
              dolarOficial
                ? `Compra: $${dolarOficial.compra} / Venta: $${dolarOficial.venta}`
                : "N/A"
            }
            subtitle={
              dolarFecha
                ? `Última actualización: ${new Date(
                    dolarFecha
                  ).toLocaleDateString("es-AR")}`
                : ""
            }
            icon="currency_exchange"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <SummaryCard
            title="Ventas del Mes"
            value={`$${totalVentas.toLocaleString()}`}
            subtitle={`Promedio por producto: $${promedioVentas}`}
            icon="trending_up"
          />
        </Grid>

        {/* Gráfico de ventas por producto */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: "400px" }}>
            <Typography variant="h6" gutterBottom>
              Ventas por Producto
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ventasData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {ventasData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Cotizaciones de Cereales
            </Typography>
            {loadingCereales ? (
              <div>Cargando...</div>
            ) : cereales ? (
              <ul>
                {Object.entries(cereales).map(([nombre, datos]) => (
                  <li key={nombre}>
                    <strong>
                      {nombre.charAt(0).toUpperCase() + nombre.slice(1)}:
                    </strong>{" "}
                    ${datos.precio} {datos.unidad} (Fecha: {datos.fecha})
                  </li>
                ))}
              </ul>
            ) : (
              <div>No hay datos de cereales disponibles.</div>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;
