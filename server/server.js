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
                  text = text.replace(/\(trinta e dois\) /g,'');
                  text = text.replace(/\(dezesseis\) /g,'');
                  text = text.replace(/\(oito\) /g,'');
                  text = text.replace(/\(quatro\) /g,'');
                  text = text.replace(/\(dois\) /g,'');
                  text = text.replace(/\(um\) /g,'');
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
  let classificados = [];
  let nulos = [];
  let tests = new Array();
  let texto, maior, valor, busca;
  let itens = JSON.parse(fs.readFileSync('consolidado-' + codigo_item_material + '.json'));
  //let reg = /[136]{0,1}[86421][\s]{0,1}[g][b]{0,1}[,.;\sm]/g;
  let reg = /[\s.,][136]{0,1}[86421][.]*[0]*[\s]*([g]([b]|[bytes])*|gigabyte(s)*)[,.;\sm]/g;
  let regExtras = /:| de| do/;
  let matches = [];

  for(let i = 0; i < itens.length; i++){
    if(itens[i] != null){
      texto = itens[i].descricao_detalhada.toLowerCase();
      // console.log(texto.replace(/ de| do|:/, ''));
      matches[i] = itens[i].descricao_detalhada.toLowerCase().match(reg);

      // Filtra se o valor obtido é de um SSD
      // Remove espaços em branco /[^\s]/g => .join('')
      // 'maximo X gb' 'maximoXgb' 'ate Xgb'
      if(matches[i] != null) {
        maior = 0;
        for(let obj of matches[i]) {
          if(texto.search('ate ' + obj) == -1 && texto.search(obj.trim() + ' solid state drive') == -1 && texto.search(obj.trim() + ' ssd') == -1 &&
            texto.search('ate ' + obj.trim()) == -1 && texto.search('maximo ' + obj.trim())){
            valor = parseInt(obj.toString().match(/[136]{0,1}[12468]/g));
            if(valor > maior)
              maior = valor;
          }
          matches[i]['maior_memoria_valida'] = maior;
        }
        matches[i]['text'] = texto;
      }
      else{
        nulos.push(texto);
      }
    }
  }

  // Pega os dados do processador
  let processadores = [];
  for(let i = 0; i < matches.length; i++){
    if(matches[i] != null){
      maior = '';
      matches[i]['processador'] = [];
      texto = matches[i].text.toLowerCase();
      let processador = (texto.match(/i3|i5|i7|((6|4|2|seis|quatro|dois|dual)\s(nucleos|core|cores))|[0-9].[0-9][0]*\s*ghz/g));

      if(processador != null) {
        matches[i].processador = processador;
        // Troca as vírgulas por pontos se houverem
        for(let j = 0; j < matches[i].processador.length; j++) {
          matches[i].processador[j] = matches[i].processador[j].replace(/,/g, '.');

          // Valida se o processador não é o máximo estabelecido
          if(texto.search('maximo ' + matches[i].processador[j]) != -1 || texto.search('maximo' + matches[i].processador[j]) != -1)
            matches[i].processador[j] = null;
          else{
            if(maior != ''){
              // Verifica se foi especificado i3, i5, i7
              if(maior.search('i3') != -1 || maior.search('i5') != -1 || maior.search('i7') != -1){
                if(matches[i].processador[j].search('i3') != -1)
                  maior = matches[i].processador[j];
                else
                  if(matches[i].processador[j].search('i5') != -1 && maior.search('i7') != -1)
                    maior = matches[i].processador[j];
                  else
                    if(matches[i].processador[j].search('i7') != -1 && (maior.search('i5') == -1 && maior.search('i3') == -1))
                      maior = matches[i].processador[j];
              }
              else{
                // Valida de acordo com o número de núcleos
                if(maior.search('nucleos') != -1 || maior.search('core') != -''){
                  // Se o atual é da família i3, i5 ou i7, sobrescreva
                  if(matches[i].processador[j].search('i3') != -1 || matches[i].processador[j].search('i5') != -1 || matches[i].processador[j].search('i7') != -1)
                    maior = matches[i].processador[j];
                  else{
                    // Senão, validar de acordo com o número de núcleos ou clock
                    if(matches[i].processador[j].search('nucleos') != -1 || matches[i].processador[j].search('core') != -1){
                      matches[i].processador[j] = matches[i].processador[j].replace(/dois/g, '2');
                      matches[i].processador[j] = matches[i].processador[j].replace(/dual/g, '2');
                      matches[i].processador[j] = matches[i].processador[j].replace(/core(s*)/g, 'nucleos');
                      matches[i].processador[j] = matches[i].processador[j].replace(/quatro/g, '4');
                      matches[i].processador[j] = matches[i].processador[j].replace(/quad/g, '4');
                      matches[i].processador[j] = matches[i].processador[j].replace(/seis/g, '6');
                      matches[i].processador[j] = matches[i].processador[j].replace(/oito/g, '8');
                      maior = matches[i].processador[j];
                    }
                  }
                }
                else {
                  if(maior.search('ghz') != -1){
                    if(matches[i].processador[j].search('i3') != -1 || matches[i].processador[j].search('i5') != -1 || matches[i].processador[j].search('i7') != -1)
                      maior = matches[i].processador[j];
                    else
                      if(matches[i].processador[j].search('nucleos') != -1 || matches[i].processador[j].search('core') != -1){
                        matches[i].processador[j] = matches[i].processador[j].replace(/dois/g, '2');
                        matches[i].processador[j] = matches[i].processador[j].replace(/dual/g, '2');
                        matches[i].processador[j] = matches[i].processador[j].replace(/core(s*)/g, 'nucleos');
                        matches[i].processador[j] = matches[i].processador[j].replace(/quatro/g, '4');
                        matches[i].processador[j] = matches[i].processador[j].replace(/quad/g, '4');
                        matches[i].processador[j] = matches[i].processador[j].replace(/seis/g, '6');
                        matches[i].processador[j] = matches[i].processador[j].replace(/oito/g, '8');
                        maior = matches[i].processador[j];
                      }
                      else
                        if(matches[i].processador[j].search('ghz') != -1){
                          valor = matches[i].processador.match(/[0-9][.0-9]*/g);
                          if(valor > maior)
                            maior = valor;
                        }
                  }
                }
              }
            }
            else
              maior = matches[i].processador[j];

            matches[i]['processador_valido'] = maior;
          }
        }

      }
    }
  }

  for(obj of matches){
    if(obj != null){
      let temp = {
        text: obj.text,
        memoria_valida: obj.maior_memoria_valida,
        processador_valido: obj.processador_valido,
        classe: null,
        processador: obj.processador
      };
      if(temp.memoria_valida <= 2)
        temp.classe = 'baixo desempenho';
      else
        if(temp.memoria_valida >= 4 && temp.memoria_valida <= 6)
          temp.classe = 'computador comum';
        else
          if(temp.memoria_valida >= 8)
            temp.classe = 'alto desempenho';
      classificados.push(temp);
    }
  }
  // console.log('Nulos');
  // console.log(nulos);
  // console.log('Nulos: ', nulos.length);
  // console.log('Classificados: ', classificados.length);
  res.send(classificados);
});

app.listen(port, () => console.log(`Listening on port ${port}...`));
