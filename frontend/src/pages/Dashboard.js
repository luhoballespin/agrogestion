import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import axios from 'axios';

// Componentes personalizados
import SummaryCard from '../components/SummaryCard';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [dolarData, setDolarData] = useState(null);
  const [cerealesData, setCerealesData] = useState(null);
  const [ventasData, setVentasData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulación de datos de ventas (reemplazar con datos reales de la API)
        const ventasMock = [
          { name: 'Soja', value: 400 },
          { name: 'Maíz', value: 300 },
          { name: 'Trigo', value: 300 },
          { name: 'Girasol', value: 200 },
        ];
        setVentasData(ventasMock);

        // Obtener cotización del dólar
        const dolarResponse = await axios.get('https://api.estadisticas.bcra.gob.ar/api/estadistica/principalesvariables/1/2023-01-01/2023-12-31');
        setDolarData(dolarResponse.data);

        // Obtener precios de cereales
        const cerealesResponse = await axios.get('https://api.agrofy.com.ar/api/v1/market-prices');
        setCerealesData(cerealesResponse.data);

        setLoading(false);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

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
            value={dolarData?.valor || 'N/A'}
            subtitle="Última actualización"
            icon="currency_exchange"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <SummaryCard
            title="Precio Soja"
            value={cerealesData?.soja || 'N/A'}
            subtitle="USD/ton"
            icon="grain"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <SummaryCard
            title="Ventas del Mes"
            value="$150,000"
            subtitle="Total"
            icon="trending_up"
          />
        </Grid>

        {/* Gráfico de ventas por producto */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '400px' }}>
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
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {ventasData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Otras métricas o gráficos pueden agregarse aquí */}
      </Grid>
    </Box>
  );
}

export default Dashboard; 