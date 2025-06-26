// Importa la librería 'mssql' para conectarse a SQL Server
const sql = require('mssql');

// Carga las variables de entorno desde el archivo .env (como DB_USER, DB_PASSWORD, etc.)
require('dotenv').config();

// Objeto de configuración de conexión a SQL Server
const config = {
  user: process.env.DB_USER,           // Usuario de la base de datos
  password: process.env.DB_PASSWORD,   // Contraseña del usuario
  server: process.env.DB_SERVER,       // Nombre o IP del servidor SQL
  database: process.env.DB_NAME,       // Nombre de la base de datos a la que se conecta
  port: parseInt(process.env.DB_PORT), // Puerto de conexión (normalmente 1433)
  options: {
    trustServerCertificate: true       // Acepta certificados no verificados (necesario para entornos locales)
  }
};

// Función asincrónica para establecer y devolver una conexión con SQL Server
const getConnection = async () => {
  try {
    // Intenta conectarse a la base de datos con la configuración dada
    const pool = await sql.connect(config);
    return pool; // Devuelve la conexión (pool)
  } catch (err) {
    // Si ocurre un error, lo muestra en consola y lo lanza
    console.error('❌ Error al conectar a SQL Server:', err);
    throw err;
  }
};

// Exporta la función getConnection y el objeto sql para usarlos en otros archivos
module.exports = {
  getConnection,
  sql
};




