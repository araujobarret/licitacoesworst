const fs = require('fs');

let generateSummary = () => {
  let dados = [];
  let temp;
  let somaTotal = 0, soma;

  let summary = {
    economico: {
      minimo: 10000000,
      media: 0,
      maximo: 0,
      variancia: 0,
      desvio_padrao: 0,
      quantidade_itens: 0,
      soma: 0,
      soma_item: 0,
      media_item: 0,
      minimo_item: 1000000,
      maximo_item: 0,
      variancia_item: 0,
      desvio_padrao_item: 0,
      dados: []
    },
    comum: {
      minimo: 10000000,
      media: 0,
      maximo: 0,
      variancia: 0,
      desvio_padrao: 0,
      quantidade_itens: 0,
      soma: 0,
      soma_item: 0,
      media_item: 0,
      minimo_item: 1000000,
      maximo_item: 0,
      variancia_item: 0,
      desvio_padrao_item: 0,
      dados: []
    },
    alto: {
      minimo: 10000000,
      media: 0,
      maximo: 0,
      variancia: 0,
      desvio_padrao: 0,
      quantidade_itens: 0,
      soma: 0,
      soma_item: 0,
      media_item: 0,
      minimo_item: 1000000,
      maximo_item: 0,
      variancia_item: 0,
      desvio_padrao_item: 0,
      dados: []
    },
    altissimo: {
      minimo: 10000000,
      media: 0,
      maximo: 0,
      variancia: 0.0,
      desvio_padrao: 0.0,
      quantidade_itens: 0,
      soma: 0,
      soma_item: 0,
      media_item: 0,
      minimo_item: 1000000,
      maximo_item: 0,
      variancia_item: 0.0,
      desvio_padrao_item: 0.0,
      dados: []
    }
  };

  if(fs.existsSync('classificado-66338.json')){
    temp = JSON.parse(fs.readFileSync('classificado-66338.json'));
    for(obj of temp)
      dados.push(obj);
  }

  if(fs.existsSync('classificado-98191.json')){
    temp = JSON.parse(fs.readFileSync('classificado-98191.json'));
    for(obj of temp)
      dados.push(obj);
  }

  if(fs.existsSync('classificado-98205.json')){
    temp = JSON.parse(fs.readFileSync('classificado-98205.json'));
    for(obj of temp)
      dados.push(obj);
  }

  if(fs.existsSync('classificado-150566.json')){
    temp = JSON.parse(fs.readFileSync('classificado-150566.json'));
    for(obj of temp)
      dados.push(obj);
  }

  for(obj of dados){
    summary[obj.classe].dados.push(obj);
    summary[obj.classe].quantidade_itens += parseInt(obj.quantidade);
    summary[obj.classe].soma += parseFloat(obj.valor_total);
    summary[obj.classe].soma_item += parseFloat(obj.valor_unitario);

    if(parseFloat(obj.valor_unitario) < parseFloat(summary[obj.classe].minimo_item))
      summary[obj.classe].minimo_item = obj.valor_unitario;

    if(parseFloat(obj.valor_total) < parseFloat(summary[obj.classe].minimo))
      summary[obj.classe].minimo = obj.valor_total;

    if(parseFloat(obj.valor_unitario) > parseFloat(summary[obj.classe].maximo_item))
      summary[obj.classe].maximo_item = obj.valor_unitario;

    if(parseFloat(obj.valor_unitario) > parseFloat(summary[obj.classe].maximo))
      summary[obj.classe].maximo = obj.valor_total;
  }

  summary.economico.media = parseFloat(summary.economico.soma / summary.economico.dados.length).toFixed(2);
  summary.comum.media = parseFloat(summary.comum.soma / summary.comum.dados.length).toFixed(2);
  summary.alto.media = parseFloat(summary.alto.soma / summary.alto.dados.length).toFixed(2);
  summary.altissimo.media = parseFloat(summary.altissimo.soma / summary.altissimo.dados.length).toFixed(2);

  summary.economico.media_item = parseFloat(summary.economico.soma_item / summary.economico.dados.length).toFixed(2);
  summary.comum.media_item = parseFloat(summary.comum.soma_item / summary.comum.dados.length).toFixed(2);
  summary.alto.media_item = parseFloat(summary.alto.soma_item / summary.alto.dados.length).toFixed(2);
  summary.altissimo.media_item = parseFloat(summary.altissimo.soma_item / summary.altissimo.dados.length).toFixed(2);

  for(obj of dados){
    summary[obj.classe].variancia += Math.pow((parseFloat(obj.valor_total) - parseFloat(summary[obj.classe].media)), 2);
    summary[obj.classe].variancia_item += Math.pow((obj.valor_unitario - summary[obj.classe].media_item), 2);
  }

  summary.economico.variancia = parseFloat(summary.economico.variancia / summary.economico.dados.length).toFixed(2);
  summary.economico.variancia_item = parseFloat(summary.economico.variancia_item / summary.economico.dados.length).toFixed(2);
  console.log(summary.comum.variancia_item);
  summary.comum.variancia = parseFloat(summary.comum.variancia / summary.comum.dados.length).toFixed(2);
  summary.comum.variancia_item = parseFloat(summary.comum.variancia_item / summary.comum.dados.length).toFixed(2);
  summary.alto.variancia = parseFloat(summary.alto.variancia / summary.alto.dados.length).toFixed(2);
  summary.alto.variancia_item = parseFloat(summary.alto.variancia_item / summary.alto.dados.length).toFixed(2);
  summary.altissimo.variancia = parseFloat(summary.altissimo.variancia / summary.altissimo.dados.length).toFixed(2);
  summary.altissimo.variancia_item = parseFloat(summary.altissimo.variancia_item / summary.altissimo.dados.length).toFixed(2);

  summary.economico.desvio_padrao = Math.sqrt(summary.economico.variancia).toFixed(2);
  summary.economico.desvio_padrao_item = Math.sqrt(summary.economico.variancia_item).toFixed(2);
  summary.comum.desvio_padrao = Math.sqrt(summary.comum.variancia).toFixed(2);
  summary.comum.desvio_padrao_item = Math.sqrt(summary.comum.variancia_item).toFixed(2);
  summary.alto.desvio_padrao = Math.sqrt(summary.alto.variancia).toFixed(2);
  summary.alto.desvio_padrao_item = Math.sqrt(summary.alto.variancia_item).toFixed(2);
  summary.altissimo.desvio_padrao = Math.sqrt(summary.altissimo.variancia).toFixed(2);
  summary.altissimo.desvio_padrao_item = Math.sqrt(summary.altissimo.variancia_item).toFixed(2);

  console.log('Coef Variação: ', summary.comum.variancia_item / summary.comum.media_item);

  return summary;
};

module.exports = {
  generateSummary
};
