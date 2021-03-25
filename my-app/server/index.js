/* eslint-disable */
const port = 3000;
const path = require('path');
const express = require('express');
const app = express();
const axios = require('axios');
const cors = require('cors');
const config = require('./config/config.js');

/**********************change this url for development or production (aws) server**********************************/
const url = 'http://localhost:8080';
const db = require('../database/index.js');

// 'https://app-hrsei-api.herokuapp.com/api/fec2/hr-bld'

/************************************************************************************* */
//they have both a build and a public folder.  Can only change things with public.
// all build stuff is commented out
// app.use(express.static(path.join(__dirname, '../build')));

app.use(express.static(path.join(__dirname, '../public')));

app.use(cors());
app.use(express.json());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.listen(port, () => {
  console.log(`Server listening at localhost:${port}!`);
});

// app.get('/item/*', (req, res) =>{
//   res.sendFile(path.join(path.join(__dirname, '../build/index.html')));
// });
// app.get('/:id(\\d+)/', (req, res) =>{
//   res.sendFile(path.join(path.join(__dirname, '../build/index.html')));
// });

app.get('/item/*', (req, res) => {
  res.sendFile(path.join(path.join(__dirname, '../public/index.html')));
});
app.get('/:id(\\d+)/', (req, res) => {
  res.sendFile(path.join(path.join(__dirname, '../public/index.html')));
});

//any get reqeust, append url that is different
app.get('*', (req, res) => {
  // console.log(req.url)
  if (req.url.indexOf('questions') !== -1) {
    // console.log('questions requests: ', req.url)
    // axios({
    //   method: 'get',
    //   headers: { 'Authorization': config.config },
    //   url: `${url}${req.url}`,
    // })

    //   .then(response => {
    //     // console.log(response);
    //     // console.log(response.data)
    //     res.status(200).send(response.data);
    //   })
    //   .catch(err => {
    //     //console.log(err);
    //     res.status(err.response.status).send(err.response.data);
    //   });
  }
  else if (req.url.indexOf('products') !== -1) {
    //axios get requests to products server

    if (req.url.indexOf('styles') !== -1) {

      let id = req.query.product_id.slice(0, -7)

      console.log({id});
      db.getProducts(`SELECT * FROM styles WHERE productId=${id}`)
      .then((results) => {
        res.send(results)
      })
      .catch(err => res.send(err))
    } else {
      const query = `select json_build_object(
        'product_id', products.product_id,
        'name', products.name,
        'slogan', products.slogan,
        'description', products.description,
        'category', products.category,
        'default_price', products.default_price,
        'features',
        (select json_agg(
          json_build_object(
            'id', features.id,
            'product_id', features.product_id,
            'feature', features.feature,
            'value', features.value))
             from features where features.product_id=products.product_id))
             from products where products.product_id=${req.query.product_id};`;

      db.getProducts(query)
        .then((results) => {
          res.status(200).send(results)
        })
        .catch((err) => res.status(400).send(err))
    }


    // Promise.all([db.getProducts(queryProducts), db.getProducts(queryFeatures)])
    //   .then((results) => res.status(200).send(results))
    //   .catch(err => res.status(400).send(err))

  } else if (req.url.indexOf('styles') !== -1) {

  }

})


//=======================================
// add question
//=======================================
app.post('/qa/questions', (req, res) => {
  axios({
    method: 'post',
    headers: { 'Authorization': config.config },
    url: `${url}/qa/questions/`,
    data: {
      body: req.body.body,
      name: req.body.name,
      email: req.body.email,
      product_id: req.body.product_id
    }
  })
    .then(result => {
      console.log('POSTED')
      res.sendStatus(201);
    })
    .catch(err => console.log('ERROR POSTING: ', err))
})



//=======================================
// add answer
//=======================================
app.post('/qa/questions/answers', (req, res) => {
  axios({
    method: 'post',
    headers: { 'Authorization': config.config },
    url: `${url}/qa/questions/${req.body.question_id}/answers`,
    data: {
      body: req.body.body,
      name: req.body.name,
      email: req.body.email,
      photos: req.body.photos
    }
  })
    .then(response => {
      res.status(201).send('Post has been recorded')
    })
    .catch(err => console.log('error with post request: ', err))
})


//=======================================
// put request QUESTION HELPFUL
//=======================================
app.put('/qa/questions/:question_id/helpful', (req, res) => {
  axios({
    method: 'put',
    headers: { 'Authorization': config.config },
    url: `${url}/qa/questions/${req.params.question_id}/helpful`,
  })
    .then(response => {
      res.status(201).send('Post has been recorded')
    })
    .catch(err => console.log('error with post request: ', err))
})

//=======================================
// put request ANSWER HELPFUL
//=======================================
app.put(`/qa/answers/:answer_id/helpful`, (req, res) => {
  axios.put(`${url}/qa/answers/${req.params.answer_id}/helpful`, {}, {
    headers: {
      'Authorization': config.config
    },
  })
    .then((response) => {
      res.status(200);
      res.send(response.data);
    })
    .catch((err) => {
      res.status(404);
      console.log('ERROR WITH ANSWER IS HELPFUL: ', err)
    })
})

//=======================================
// put request REPORT ANSWER
//=======================================
app.put(`/qa/answers/:answer_id/report`, (req, res) => {
  axios.put(`${url}/qa/answers/${req.params.answer_id}/report`, {}, {
    headers: {
      'Authorization': config.config
    },
  })
    .then((response) => {
      res.status(200);
      res.send(response.data);
    })
    .catch((err) => {
      res.status(404);
      console.log('ERROR WITH ANSWER IS REPORTED: ', err)
    })
})

// select coalesce(json_build_object(
//   'product_id', products.product_id,
//   'name', products.name,
//   'slogan', products.slogan,
//   'description', products.description,
//   'category', products.category,
//   'default_price', products.default_price,
//   'features',
//   (select coalesce(json_build_object(
//       'styles'.style_id,
//       'productId', styles.styles.productId,
//       'name', styles.name,
//       'sale_price', styles.sale_price,
//       'original_price', styles.original_price,
//       'default_style', styles.default_style)),‘{}‘::json)
//        from styles where styles.productId=products.products_id), ‘{}‘::json)
//        from products where products.product_id=${req.query.product_id};