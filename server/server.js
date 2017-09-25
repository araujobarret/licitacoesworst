const axios = require('axios');
const request = require('request');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const csv = require('ya-csv');
const extractor = require('./classification/extractor');
const normalizer = require('./classification/normalizer');
const classifier = require('./classification/classifier');

let app = express();
const port = process.env.PORT || 3000;

const SERVER = 'http://compras.dados.gov.br:8080';
const DATA_EDITAL_MIN = '2016-01-01T00:00:00';
const DATA_EDITAL_MAX = '2016-12-31T23:59:59';

let licitacoesPorCategoriaURI;
let codigo_item_material;

app.use(bodyParser.json());

app.get('/get_items/:codigo_item_material', (req, res) => {
  codigo_item_material = req.params.codigo_item_material;
  licitacoesPorCategoriaURI = SERVER + '/licitacoes/v1/licitacoes.json?data_entrega_edital_min=' + DATA_EDITAL_MIN + '&data_entrega_edital_max=' +
    DATA_EDITAL_MAX + '&item_material=' + codigo_item_material;

  extractor.getData(codigo_item_material)
    .then((data) => res.send(data))
    .catch((e) => console.log(e));

});

app.get('/create_test/:codigo_item_material', (req, res) => {
  codigo_item_material = req.params.codigo_item_material;

  normalizer.Normalize(codigo_item_material)
    .then((data) => {
      classifier.Classify(data, codigo_item_material);
      res.send(data);
    }).catch((e) => console.log(e));
});

app.listen(port, () => console.log(`Listening on port ${port}...`));
