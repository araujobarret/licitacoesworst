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
      quantidade_itens: 0,
      soma: 0,
      dados: []
    },
    comum: {
      minimo: 10000000,
      media: 0,
      maximo: 0,
      quantidade_itens: 0,
      soma: 0,
      dados: []
    },
    alto: {
      minimo: 10000000,
      media: 0,
      maximo: 0,
      quantidade_itens: 0,
      soma: 0,
      dados: []
    },
    altissimo: {
      minimo: 10000000,
      media: 0,
      maximo: 0,
      quantidade_itens: 0,
      soma: 0,
      dados: []
    },
    valor_total: 0
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
  // 15 / 33

  for(obj of dados){
    summary[obj.classe].dados.push(obj);
    summary[obj.classe].quantidade_itens += parseInt(obj.quantidade);
    summary[obj.classe].soma += parseFloat(obj.valor_total);

    if(parseFloat(obj.valor_unitario) < parseFloat(summary[obj.classe].minimo))
      summary[obj.classe].minimo = obj.valor_unitario;

    if(parseFloat(obj.valor_unitario) > parseFloat(summary[obj.classe].maximo))
      summary[obj.classe].maximo = obj.valor_unitario;
  }

  summary.economico.media = parseFloat(summary.economico.soma / summary.economico.quantidade_itens).toFixed(2);
  summary.comum.media = parseFloat(summary.comum.soma / summary.comum.quantidade_itens).toFixed(2);
  summary.alto.media = parseFloat(summary.alto.soma / summary.alto.quantidade_itens).toFixed(2);
  summary.altissimo.media = parseFloat(summary.altissimo.soma / summary.altissimo.quantidade_itens).toFixed(2);

  return summary;
};

module.exports = {
  generateSummary
};
