const axios = require('axios');
const request = require('request');
const hbs = require('hbs');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const extractor = require('./classification/extractor');
const normalizer = require('./classification/normalizer');
const classifier = require('./classification/classifier');
const math = require('./classification/math');

let app = express();
const port = process.env.PORT || 3000;

app.set('views', __dirname + '/views');
app.set('view engine', 'hbs');

app.use('/', express.static(path.join(__dirname + '/public')));
app.use(bodyParser.json());

hbs.registerHelper('logData', (data) => console.log(data));

app.get('/get_items/:codigo_item_material', (req, res) => {
  let codigo_item_material = req.params.codigo_item_material;

  extractor.getData(codigo_item_material)
    .then((data) => res.send(data))
    .catch((e) => console.log(e));
});

app.get('/create_test/:codigo_item_material', (req, res) => {
  let codigo_item_material = req.params.codigo_item_material;

  normalizer.Normalize(codigo_item_material)
    .then((data) => {
      let dadosClassificados = classifier.Classify(data, codigo_item_material);
      res.send(dadosClassificados);
    }).catch((e) => console.log(e));
});

app.get('/get_summary', (req, res) => {
  let summary = math.generateSummary();  
  res.send(summary);
  // res.render('summary.hbs', {
  //   summary: 'Hi there',
  //   data: summary
  // });
});

app.listen(port, () => console.log(`Listening on port ${port}...`));
