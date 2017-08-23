const axios = require('axios');
const request = require('request');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

let {mongoose} = require('./db/mongoose');
let {Item} = require('./models/item');

let app = express();
const port = process.env.PORT || 3000;

const SERVER = 'http://compras.dados.gov.br:8080';
const DATA_EDITAL_MIN = '2016-01-01T00:00:00';
const DATA_EDITAL_MAX = '2016-12-31T23:59:59';

app.use(bodyParser.json());

app.post('/get_items', (req, res) => {
	let codigo_item_material =  req.body.codigo_item_material;
  let licitacoesPorCategoriaURI = SERVER + '/licitacoes/v1/licitacoes.json?data_entrega_edital_min=' + DATA_EDITAL_MIN + '&data_entrega_edital_max=' +
    DATA_EDITAL_MAX + '&item_material=' + codigo_item_material;

  let licitacoes = new Array();

  axios.get(licitacoesPorCategoriaURI).then((responseLicitacoes) => {
    return new Promise((resolve, reject) => resolve(responseLicitacoes));
  }).then((responseLicitacoesItens) => res.send(responseLicitacoesItens.data._embedded))
  .catch((e) => console.log(e));

  // request({ url: licitacoesPorCategoriaURI, json: true}, (error, response, body) => {
  //   if(error)
  //     console.log(error);
  //   else {
  //     let i = 0;
  //     let completed = 0;
  //     for(i = 0; i < body._embedded.licitacoes.length; i++){
  //       if(body._embedded.licitacoes[i]._links.pregoes != null) {
  //         licitacoes[i] = {
  //           codigo_categoria: codigo_item_material,
  //           licitacao: body._embedded.licitacoes[i]._links.self.href,
  //           pregao:    body._embedded.licitacoes[i]._links.pregoes.href
  //         };
  //       }
  //     }

  //     for(let lic of licitacoes) {
  //       setTimeout(() => {
  //         request({url: SERVER + lic.licitacao + '/itens.json', json: true}, (error,response, body) => {
  //           console.log(lic);
  //           if(!error){
  //             if(body.codigo_item_material === codigo_item_material)
  //               licitacoes[Object.keys(licitacoes).indexOf(licitacao)]['numero_item_licitacao'] = licitacao.numero_item_licitacao;
  //           }
  //           else {
  //             res.status(400).send();
  //           }
  //           completed++;
  //           if(completed === licitacoes.length)
  //             res.send(licitacoes);

  //         });
  //       }, 1000);
  //     }

      // request({url: SERVER + licitacoes[0].licitacao + '/itens.json', json: true}, (error, response, body) => {
      //   if(!error){
      //     console.log(SERVER + licitacoes[0].licitacao + '/itens.json');
      //     console.log(body);
      //   }
      //   else {
      //     res.status(400).send();
      //   }
      // });      
  //   }
  // });

});

app.listen(port, () => console.log(`Listening on port ${port}...`));
