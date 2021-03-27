const { Pool, Client } = require('pg');

const login = require('./config.js');

const pool = new Pool({
  user: 'malcolmmarshall',
  host: 'localhost',
  database: 'products',
  password: 'sdc123',
  port: 5432,
});

// const pool = new Pool({
//   user: login.user,
//   host: login.host,
//   database: login.database,
//   password: login.password,
//   port: 5432,
// });

const getProducts = (query) => new Promise((resolve, reject) => {
  pool.query(query)
    .then((res) => {
      console.log(res.rows);
      console.log('in db get products')
      const { rows } = res;
      resolve(res.rows);
    })
    .catch((err) => {
      console.log('err: ', err);
      reject(err);
    });
});

module.exports = {
  getProducts,
};
