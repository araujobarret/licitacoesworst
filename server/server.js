const axios = require('axios');
const request = require('request');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

let app = express();
const port = process.env.PORT || 3000;

const SERVER = 'http://compras.dados.gov.br:8080';
const DATA_EDITAL_MIN = '2016-01-01T00:00:00';
const DATA_EDITAL_MAX = '2016-12-31T23:59:59';

let licitacoesPorCategoriaURI;
let codigo_item_material;

app.use(bodyParser.json());

let getLicitacoes = () => {
  let licitacoes = new Array();

  return new Promise((resolve, reject) => {
    if(fs.existsSync('licitacoes-data-' + codigo_item_material + '.json')) {
      licitacoes = JSON.parse(fs.readFileSync('licitacoes-data-' + codigo_item_material + '.json'));
      resolve(licitacoes);
    }
    else{
      axios.get(licitacoesPorCategoriaURI).then((response) => {
        return new Promise((res, rej) => res(response));
      }).then((responseLicitacoes) => {
        for(i = 0; i < responseLicitacoes.data._embedded.licitacoes.length; i++){
          if(responseLicitacoes.data._embedded.licitacoes[i]._links.pregoes != null && responseLicitacoes.data._embedded.licitacoes[i]._links.self != null) {
            licitacoes.push({
              identificador: responseLicitacoes.data._embedded.licitacoes[i].identificador,
              codigo_item_material: codigo_item_material,
              licitacao_itens: SERVER + responseLicitacoes.data._embedded.licitacoes[i]._links.self.href + '/itens.json',
              pregao_itens:    SERVER + responseLicitacoes.data._embedded.licitacoes[i]._links.pregoes.href + '/itens.json'
            });
          }
        }

        // Remove elementos duplicados
        let flag;
        let newLicitacoes = new Array();
        for(let i = 0; i < licitacoes.length; i++){
          flag = false;
          for(let j = i+1; j < licitacoes.length; j++)
            if(licitacoes[i].licitacao_itens == licitacoes[j].licitacao_itens){
              flag = true;
              break;
            }

          if(!flag)
            newLicitacoes.push(licitacoes[i]);
        }

        fs.writeFileSync('licitacoes-data-' + codigo_item_material + '.json', JSON.stringify(newLicitacoes));
        resolve(newLicitacoes);
      }).catch((e) => reject(e));
    }
  });
};

let getItensLicitacoes = (licitacoes) => {
  return new Promise((resolve, reject) => {
    let arr = new Array();
    let temp;
    let newLicitacoes = new Array();
    let i = 0;

    if(fs.existsSync('licitacoes-itens-data-' + codigo_item_material + '.json')) {
      newLicitacoes = JSON.parse(fs.readFileSync('licitacoes-itens-data-' + codigo_item_material + '.json'));
      resolve(newLicitacoes);
    }
    else {
      for(item of licitacoes){
        arr.push(axios.get(item.licitacao_itens));
        // i++;
        // if(i >= 10)
        //   break;
      }

      axios.all(arr).then(axios.spread((...item) => {
        for(let itemData of item){
          for(let itemLicitacao of itemData.data._embedded.itensLicitacao){
            if(codigo_item_material == itemLicitacao.codigo_item_material){
              newLicitacoes.push(itemLicitacao);
              break;
            }
          }
        }
        fs.writeFileSync('licitacoes-itens-data-' + codigo_item_material + '.json', JSON.stringify(newLicitacoes));
        resolve(newLicitacoes);
      }));
    }
  });
};

let getItensPregoes = (licitacoes) => {
  return new Promise((resolve, reject) => {
    let i = 0;
    let itens = new Array();
    let arr = new Array();
    if(fs.existsSync('pregoes-itens-data-' + codigo_item_material + '.json')) {
      itens = JSON.parse(fs.readFileSync('pregoes-itens-data-' + codigo_item_material + '.json'));
      resolve(itens);
    }
    else {
      for(let item of licitacoes){
        arr.push(axios.get(item.pregao_itens));
        // i++;
        // if(i >= 10)
        //   break;
      }
      axios.all(arr).then(axios.spread((...item) => {
        for(let itemData of item){
          itens.push(itemData.data._embedded.pregoes);
          // for(let itemPregao of itemData.data._embedded.pregoes){
          //   console.log(itemPregao);
          // }
        }
        fs.writeFileSync('pregoes-itens-data-' + codigo_item_material + '.json', JSON.stringify(itens));
        resolve(itens);
      })).catch((e) => reject(e));
    }
  });
};

// Reúne as informações dos 3 arquivos e apresenta-as de maneira consolidade
let consolidaItens = () => {
  return new Promise((resolve, reject) => {
    if(!fs.existsSync('consolidado-' + codigo_item_material + '.json')) {
      let itens = new Array();
      let itensFiltered = new Array();
      let itensHomologados = new Array();
      let txtlicitacoes = fs.readFileSync('licitacoes-data-' + codigo_item_material + '.json', 'utf8');
      let txtitensLicitacoes = fs.readFileSync('licitacoes-itens-data-' + codigo_item_material + '.json', 'utf8');;
      let txtitensPregoes = fs.readFileSync('pregoes-itens-data-' + codigo_item_material + '.json', 'utf8');

      let jLicitacoes = JSON.parse(txtlicitacoes);
      let jItensLicitacoes = JSON.parse(txtitensLicitacoes);
      let jItensPregoes = JSON.parse(txtitensPregoes);

      let regExtras = /:| de| do/g;
      let text;
      if(jLicitacoes.length == jItensLicitacoes.length && jItensLicitacoes.length == jItensPregoes.length){
        for(let i = 0; i < jLicitacoes.length; i++){
          if(jLicitacoes[i] != null && jItensLicitacoes[i] != null && jItensPregoes[i] != null){
            itens.push(jLicitacoes[i]);

            // Percorre os itens das licitações para pegar o número do item
            if(jLicitacoes[i].codigo_item_material == jItensLicitacoes[i].codigo_item_material){
              itens[i]['numero_item_licitacao'] = jItensLicitacoes[i].numero_item_licitacao;

              // Verifica se o objeto foi homologado e pega os valores relevantes à tarefa
              if(jItensPregoes[i][itens[i].numero_item_licitacao-1] != null) {
                if(jItensPregoes[i][itens[i].numero_item_licitacao-1].situacao_item == "homologado"){
                  text = jItensPregoes[i][itens[i].numero_item_licitacao-1].descricao_detalhada_item.toLowerCase();
                  text = text.replace(regExtras, '');
                  text = text.replace(/à|ä|á|ã/g,'a');
                  text = text.replace(/è|é|ê/g,'e');
                  text = text.replace(/ì|í/g,'i');
                  text = text.replace(/ò|ó|õ|ô/g,'o');
                  text = text.replace(/ù|ü|ú/g,'u');
                  text = text.replace(/ç/g,'c');
                  itens[i]['descricao_detalhada'] = text;
                  itens[i]['quantidade'] = jItensPregoes[i][itens[i].numero_item_licitacao-1].quantidade_item;
                  itens[i]['valor_unitario'] = jItensPregoes[i][itens[i].numero_item_licitacao-1].menor_lance;
                  itens[i]['valor_total'] = itens[i]['quantidade'] * itens[i]['valor_unitario'];
                }
              }
            }
          }
          else
            console.log('Item nulo: ', i);
        }

        for(let obj of itens)
          if(obj.quantidade != null)
            itensFiltered.push(obj);

        fs.writeFileSync('consolidado-' + codigo_item_material + '.json', JSON.stringify(itensFiltered));
        resolve(itensFiltered);
      }
      else
        resolve('Dados incosistentes');
    }
    else {
      let itens = JSON.parse(fs.readFileSync('consolidado-' + codigo_item_material + '.json'));
      resolve(itens);
    }
  });
};

app.get('/get_items/:codigo_item_material', (req, res) => {
  let completed = 0;
  let licitacoes;
  codigo_item_material = req.params.codigo_item_material;
  licitacoesPorCategoriaURI = SERVER + '/licitacoes/v1/licitacoes.json?data_entrega_edital_min=' + DATA_EDITAL_MIN + '&data_entrega_edital_max=' +
    DATA_EDITAL_MAX + '&item_material=' + codigo_item_material;

  getLicitacoes()
    .then((dados) => {
      licitacoes = dados;
      return getItensLicitacoes(licitacoes);
    }).then((data) => {
      //res.send(data);
      return getItensPregoes(licitacoes);
    }).then((data) => {
      return consolidaItens();
    }).then((data) => {
      res.send(data);
    }).catch((e) => console.log(e));

});

app.get('/create_test/:codigo_item_material', (req, res) => {
  codigo_item_material = req.params.codigo_item_material;
  let arr = new Array();
  let tests = new Array();
  let texto, maior, valor;
  let itens = JSON.parse(fs.readFileSync('consolidado-' + codigo_item_material + '.json'));
  let reg = /[136]{0,1}[86421][\s]{0,1}[g][b]{0,1}[,.;\sm]/g;
  let regExtras = /:| de| do/;
  let matches = [];
  for(let i = 0; i < 40; i++){
    texto = itens[i].descricao_detalhada.toLowerCase();
    // console.log(texto.replace(/ de| do|:/, ''));
    tests.push(itens[i].descricao_detalhada.toLowerCase());
    matches[i] = itens[i].descricao_detalhada.toLowerCase().match(reg);

    // Filtra se o valor obtido é de um SSD
    // Remove espaços em branco /[^\s]/g => .join('')
    // 'maximo X gb' 'maximoXgb' 'ate Xgb'
    maior = 0;
    if(matches[i] != null){
      for(let obj of matches[i]){
        console.log('ate ' + obj);
        console.log(texto.search('ate ' + obj));
        if(texto.search(obj[0] + ' solid state drive') == -1 && texto.search(obj[0] + ' ssd') == -1 &&
          texto.search('ate ' + obj[0]) == -1 && texto.search('maximo ' + obj[0])){
          valor = obj.toString().match(/[136]{0,1}[12468]/);
          console.log(valor + ' > ' + maior + ': ');
          if(valor > maior)
            maior = obj.toString().match(/[136]{0,1}[12468]/);
        }
        matches[i]['memoria'] = obj;
      }
      matches[i]['text'] = texto;
    }
    arr[i]['memoria'] = matches[i]['memoria'];
    arr[i]['text'] = matches[i].texto;
    arr[i]['maior_memoria'] = maior;
  }
  console.log(matches);
  res.send(matches);
});

app.listen(port, () => console.log(`Listening on port ${port}...`));
