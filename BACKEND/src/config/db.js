const oracledb = require('oracledb');
const config = require('./config');
const fs = require('fs');

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

let pool;

async function initPool(){
  if(pool) return pool;

  pool = await oracledb.createPool({
    user: config.oracle.user,
    password: config.oracle.password,
    connectString: config.oracle.connectString,
    poolMin: 1,
    poolMax: 10,
    poolIncrement: 1
  });

  console.log('Oracle DB Pool created');
  return pool;
}

async function query(sql, binds = [], options = {}) {
  const pool = await initPool();
  let connection;

  try{
    connection = await pool.getConnection();
    const result = await connection.execute(sql, binds, options);
    return [result];
  } finally {
    if(connection){
      await connection.close().catch(err =>
        console.error('Error closing connection', err)
      )
    }
  }
}

async function getConnection(){
  const pool = await initPool();
  return await pool.getConnection();
}

module.exports = { query, getConnection };
