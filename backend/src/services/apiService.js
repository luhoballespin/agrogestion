const axios = require('axios');

class ApiService {
  constructor() {
    this.dolarApiUrl = 'https://api.estadisticas.bcra.gob.ar/api/estadistica/principalesvariables/1';
    this.cerealesApiUrl = 'https://api.agrofy.com.ar/api/v1/market-prices';
  }

  async getDolarPrice() {
    try {
      const today = new Date();
      const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      const endDate = today;

      const response = await axios.get(this.dolarApiUrl, {
        params: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
        },
      });

      // Obtener el último valor disponible
      const data = response.data;
      if (data && data.length > 0) {
        return data[data.length - 1].valor;
      }
      throw new Error('No hay datos disponibles');
    } catch (error) {
      console.error('Error al obtener cotización del dólar:', error);
      throw error;
    }
  }

  async getCerealesPrices() {
    try {
      const response = await axios.get(this.cerealesApiUrl);
      return {
        soja: response.data.soja?.price || null,
        maiz: response.data.maiz?.price || null,
        trigo: response.data.trigo?.price || null,
        girasol: response.data.girasol?.price || null,
        lastUpdate: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error al obtener precios de cereales:', error);
      throw error;
    }
  }

  async getMarketData() {
    try {
      const [dolarPrice, cerealesPrices] = await Promise.all([
        this.getDolarPrice(),
        this.getCerealesPrices(),
      ]);

      return {
        dolar: {
          price: dolarPrice,
          lastUpdate: new Date().toISOString(),
        },
        cereales: cerealesPrices,
      };
    } catch (error) {
      console.error('Error al obtener datos del mercado:', error);
      throw error;
    }
  }
}

module.exports = new ApiService(); 