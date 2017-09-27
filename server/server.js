const axios = require('axios');
const request = require('request');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const extractor = require('./classification/extractor');
const normalizer = require('./classification/normalizer');
const classifier = require('./classification/classifier');
const math = require('./classification/math');

let app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

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

app.get('/get_summary/', (req, res) => {
  res.send(math.generateSummary());
});

app.listen(port, () => console.log(`Listening on port ${port}...`));
