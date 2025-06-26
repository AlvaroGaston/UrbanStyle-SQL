// Importa Express, el framework web para Node.js
const express = require('express');

// Importa CORS para permitir solicitudes de otros orígenes (como desde el frontend)
const cors = require('cors');

// Importa la función getConnection desde el archivo db.js (la usamos para conectar a SQL Server)
const { getConnection, sql } = require('./db'); // Asegúrate de importar 'sql' también

// Carga las variables de entorno definidas en el archivo .env (como DB_SERVER, DB_NAME, etc.)
require('dotenv').config();

// Crea una instancia de la aplicación Express
const app = express();

// Habilita CORS para que el frontend (por ejemplo, HTML/JS en otro puerto) pueda hacer solicitudes al backend
app.use(cors());

// Middleware para permitir recibir y procesar datos JSON en las solicitudes
app.use(express.json());

// ====================================================================================================
// RUTAS API PARA CLIENTES
// ====================================================================================================

/**
 * Ruta GET: /api/clientes
 * Esta ruta devuelve todos los registros de la tabla Clientes desde la base de datos SQL Server
 */
app.get('/api/clientes', async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query('SELECT * FROM Clientes');
    res.json(result.recordset);
  } catch (err) {
    console.error('❌ Error al obtener clientes:', err);
    res.status(500).send('Error al obtener los datos de clientes');
  }
});

/**
 * Ruta POST: /api/clientes
 * Esta ruta permite agregar un nuevo cliente a la tabla Clientes.
 */
app.post('/api/clientes', async (req, res) => {
  const { Nombre, Apellido, Email, Telefono, Direccion, DNI, Contrasena } = req.body; // Asegúrate de que estos campos coincidan con tu frontend
  try {
    const pool = await getConnection();
    await pool.request()
      .input('Nombre', sql.NVarChar, Nombre)
      .input('Apellido', sql.NVarChar, Apellido)
      .input('Email', sql.NVarChar, Email)
      .input('Telefono', sql.NVarChar, Telefono)
      .input('Direccion', sql.NVarChar, Direccion)
      .input('DNI', sql.NVarChar, DNI)
      .input('Contrasena', sql.NVarChar, Contrasena) // Considera hashear contraseñas en un entorno real
      .query('INSERT INTO Clientes (Nombre, Apellido, Email, Telefono, Direccion, DNI, Contrasena) VALUES (@Nombre, @Apellido, @Email, @Telefono, @Direccion, @DNI, @Contrasena)');
    res.status(201).send('Cliente registrado exitosamente');
  } catch (err) {
    console.error('❌ Error al registrar cliente:', err);
    res.status(500).send('Error al registrar el cliente');
  }
});

/**
 * Ruta PUT: /api/clientes/:id
 * Esta ruta permite modificar un cliente existente en la tabla Clientes.
 */
app.put('/api/clientes/:id', async (req, res) => {
  const { id } = req.params;
  const { Nombre, Apellido, Email, Telefono, Direccion, DNI, Contrasena } = req.body;
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input('ID', sql.Int, id)
      .input('Nombre', sql.NVarChar, Nombre)
      .input('Apellido', sql.NVarChar, Apellido)
      .input('Email', sql.NVarChar, Email)
      .input('Telefono', sql.NVarChar, Telefono)
      .input('Direccion', sql.NVarChar, Direccion)
      .input('DNI', sql.NVarChar, DNI)
      .input('Contrasena', sql.NVarChar, Contrasena)
      .query('UPDATE Clientes SET Nombre = @Nombre, Apellido = @Apellido, Email = @Email, Telefono = @Telefono, Direccion = @Direccion, DNI = @DNI, Contrasena = @Contrasena WHERE ID = @ID');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).send('Cliente no encontrado');
    }
    res.status(200).send('Cliente actualizado exitosamente');
  } catch (err) {
    console.error('❌ Error al actualizar cliente:', err);
    res.status(500).send('Error al actualizar el cliente');
  }
});

/**
 * Ruta DELETE: /api/clientes/:id
 * Esta ruta permite eliminar un cliente de la tabla Clientes.
 */
app.delete('/api/clientes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input('ID', sql.Int, id)
      .query('DELETE FROM Clientes WHERE ID = @ID');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).send('Cliente no encontrado');
    }
    res.status(200).send('Cliente eliminado exitosamente');
  } catch (err) {
    console.error('❌ Error al eliminar cliente:', err);
    res.status(500).send('Error al eliminar el cliente');
  }
});

// ====================================================================================================
// RUTAS API PARA PRODUCTOS (STOCK)
// ====================================================================================================

/**
 * Ruta GET: /api/productos
 * Devuelve todos los registros de la tabla Productos.
 */
app.get('/api/productos', async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query('SELECT * FROM Productos');
    res.json(result.recordset);
  } catch (err) {
    console.error('❌ Error al obtener productos:', err);
    res.status(500).send('Error al obtener los datos de productos');
  }
});

/**
 * Ruta POST: /api/productos
 * Agrega un nuevo producto.
 */
app.post('/api/productos', async (req, res) => {
  const { NombreProducto, Descripcion, Stock, Precio } = req.body;
  try {
    const pool = await getConnection();
    await pool.request()
      .input('NombreProducto', sql.NVarChar, NombreProducto)
      .input('Descripcion', sql.NVarChar, Descripcion)
      .input('Stock', sql.Int, Stock)
      .input('Precio', sql.Decimal(10, 2), Precio)
      .query('INSERT INTO Productos (NombreProducto, Descripcion, Stock, Precio) VALUES (@NombreProducto, @Descripcion, @Stock, @Precio)');
    res.status(201).send('Producto agregado exitosamente');
  } catch (err) {
    console.error('❌ Error al agregar producto:', err);
    res.status(500).send('Error al agregar el producto');
  }
});

/**
 * Ruta PUT: /api/productos/:id
 * Modifica un producto existente.
 */
app.put('/api/productos/:id', async (req, res) => {
  const { id } = req.params;
  const { NombreProducto, Descripcion, Stock, Precio } = req.body;
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input('ID', sql.Int, id)
      .input('NombreProducto', sql.NVarChar, NombreProducto)
      .input('Descripcion', sql.NVarChar, Descripcion)
      .input('Stock', sql.Int, Stock)
      .input('Precio', sql.Decimal(10, 2), Precio)
      .query('UPDATE Productos SET NombreProducto = @NombreProducto, Descripcion = @Descripcion, Stock = @Stock, Precio = @Precio WHERE ID = @ID');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).send('Producto no encontrado');
    }
    res.status(200).send('Producto actualizado exitosamente');
  } catch (err) {
    console.error('❌ Error al actualizar producto:', err);
    res.status(500).send('Error al actualizar el producto');
  }
});

/**
 * Ruta DELETE: /api/productos/:id
 * Elimina un producto.
 */
app.delete('/api/productos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input('ID', sql.Int, id)
      .query('DELETE FROM Productos WHERE ID = @ID');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).send('Producto no encontrado');
    }
    res.status(200).send('Producto eliminado exitosamente');
  } catch (err) {
    console.error('❌ Error al eliminar producto:', err);
    res.status(500).send('Error al eliminar el producto');
  }
});

// ====================================================================================================
// RUTAS API PARA VENTAS (COMPRAS)
// ====================================================================================================

/**
 * Ruta GET: /api/ventas
 * Devuelve todos los registros de la tabla Ventas.
 */
app.get('/api/ventas', async (req, res) => {
  try {
    const pool = await getConnection();
    // Asumiendo que tienes tablas Clientes y Productos relacionadas con Ventas
    const result = await pool.request().query(`
      SELECT
        V.ID,
        V.FechaVenta AS Fecha,
        C.Nombre + ' ' + C.Apellido AS Cliente,
        P.NombreProducto AS Producto,
        DV.Cantidad,
        DV.PrecioUnitario * DV.Cantidad AS Total
      FROM Ventas V
      JOIN Clientes C ON V.ID_Cliente = C.ID
      JOIN DetallesVenta DV ON V.ID = DV.ID_Venta
      JOIN Productos P ON DV.ID_Producto = P.ID
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error('❌ Error al obtener ventas:', err);
    res.status(500).send('Error al obtener los datos de ventas');
  }
});

/**
 * Ruta POST: /api/ventas
 * Agrega una nueva venta.
 * Esto es más complejo ya que una venta puede tener múltiples detalles.
 * Se asume que el body contendrá { ID_Cliente, FechaVenta, Detalles: [{ ID_Producto, Cantidad, PrecioUnitario }] }
 */
app.post('/api/ventas', async (req, res) => {
  const { ID_Cliente, FechaVenta, Detalles } = req.body;
  let transaction;
  try {
    const pool = await getConnection();
    transaction = new sql.Transaction(pool);
    await transaction.begin();

    const request = new sql.Request(transaction);
    const resultVenta = await request
      .input('ID_Cliente', sql.Int, ID_Cliente)
      .input('FechaVenta', sql.DateTime, FechaVenta || new Date())
      .query('INSERT INTO Ventas (ID_Cliente, FechaVenta) VALUES (@ID_Cliente, @FechaVenta); SELECT SCOPE_IDENTITY() AS ID_Venta;');

    const ID_Venta = resultVenta.recordset[0].ID_Venta;

    for (const detalle of Detalles) {
      await new sql.Request(transaction)
        .input('ID_Venta', sql.Int, ID_Venta)
        .input('ID_Producto', sql.Int, detalle.ID_Producto)
        .input('Cantidad', sql.Int, detalle.Cantidad)
        .input('PrecioUnitario', sql.Decimal(10, 2), detalle.PrecioUnitario)
        .query('INSERT INTO DetallesVenta (ID_Venta, ID_Producto, Cantidad, PrecioUnitario) VALUES (@ID_Venta, @ID_Producto, @Cantidad, @PrecioUnitario)');

      // Opcional: Actualizar stock del producto
      await new sql.Request(transaction)
        .input('CantidadVendida', sql.Int, detalle.Cantidad)
        .input('ID_Producto', sql.Int, detalle.ID_Producto)
        .query('UPDATE Productos SET Stock = Stock - @CantidadVendida WHERE ID = @ID_Producto');
    }

    await transaction.commit();
    res.status(201).send('Venta registrada exitosamente');
  } catch (err) {
    if (transaction) {
      try {
        await transaction.rollback();
      } catch (rollbackErr) {
        console.error('❌ Error al hacer rollback de la transacción:', rollbackErr);
      }
    }
    console.error('❌ Error al registrar venta:', err);
    res.status(500).send('Error al registrar la venta');
  }
});

// ====================================================================================================
// RUTAS API PARA RANKING
// ====================================================================================================

/**
 * Ruta GET: /api/ranking
 * Devuelve el ranking de productos más vendidos.
 */
app.get('/api/ranking', async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(`
      SELECT TOP 10
        P.NombreProducto AS Producto,
        SUM(DV.Cantidad) AS VentasTotales,
        SUM(DV.Cantidad * DV.PrecioUnitario) AS IngresosTotales
      FROM DetallesVenta DV
      JOIN Productos P ON DV.ID_Producto = P.ID
      GROUP BY P.NombreProducto
      ORDER BY VentasTotales DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error('❌ Error al obtener ranking:', err);
    res.status(500).send('Error al obtener el ranking de productos');
  }
});

// Inicia el servidor en el puerto 3000 y muestra un mensaje de confirmación en la consola
app.listen(3000, () => {
  console.log('✅ Servidor corriendo en http://localhost:3000');
});


