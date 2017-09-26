const fs = require('fs');

// Bayesian model from Weka with accuracy of 95.83% with cross-validation with folds:50
let probabilityModel = [
  { nome: 'economico', probability: 0.1},
  { nome: 'comum', probability: 0.44},
  { nome: 'alto', probability: 0.28},
  { nome: 'altissimo', probability: 0.19}
];

let bayesianModel = {
  classe: probabilityModel,
  memoria: [
    {
      nome: '(-inf-0.5]',
      probability: [
        {nome: 'economico', probability: 0.0625},
        {nome: 'comum', probability: 0.017241379},
        {nome: 'alto', probability: 0.025641026},
        {nome: 'altissimo', probability: 0.148148148}
      ]
    },
    { nome: '(0.5-1.5]',
      probability: [
        {nome: 'economico', probability: 0.75},
        {nome: 'comum', probability: 0.017241379},
        {nome: 'alto', probability: 0.025641026},
        {nome: 'altissimo', probability: 0.037037037}
      ]
    },
    { nome: '(1.5-5]',
      probability: [
        {nome: 'economico', probability: 0.0625},
        {nome: 'comum', probability: 0.8448275860},
        {nome: 'alto', probability: 0.076923077},
        {nome: 'altissimo', probability: 0.037037037}
      ]
    },
    { nome: '(5-12]',
      probability: [
        {nome: 'economico', probability: 0.0625},
        {nome: 'comum', probability: 0.0625},
        {nome: 'alto', probability: 0.794871795},
        {nome: 'altissimo', probability: 0.111111111}
      ]
    },
    { nome: '(12-inf)',
      probability: [
        {nome: 'economico', probability: 0.0625},
        {nome: 'comum', probability: 0.017241379},
        {nome: 'alto', probability: 0.0625},
        {nome: 'altissimo', probability: 0.666666667}
      ]
    }
  ],
  processador: [
    { nome: 'comum',
      probability: [
        {nome: 'economico', probability: 0.357142857},
        {nome: 'comum', probability: 0.571428571},
        {nome: 'alto', probability: 0.027027027},
        {nome: 'altissimo', probability: 0.04}
      ]
    },
    { nome: 'alto',
      probability: [
        {nome: 'economico', probability: 0.571428571},
        {nome: 'comum', probability: 0.410714286},
        {nome: 'alto', probability: 0.702702703},
        {nome: 'altissimo', probability: 0.28}
      ]
    },
    { nome: 'altissimo',
      probability: [
        {nome: 'economico', probability: 0.071428571},
        {nome: 'comum', probability: 0.017857143},
        {nome: 'alto', probability: 0.27027027},
        {nome: 'altissimo', probability: 0.68}
      ]
    }
  ],
  video: [
    { nome: 'n',
      probability: [
        {nome: 'economico', probability: 0.923076923},
        {nome: 'comum', probability: 0.945454545},
        {nome: 'alto', probability: 0.972222222},
        {nome: 'altissimo', probability: 0.25}
      ]
    },
    { nome: 's',
      probability: [
        {nome: 'economico', probability: 0.076923077},
        {nome: 'comum', probability: 0.054545455},
        {nome: 'alto', probability: 0.027777778},
        {nome: 'altissimo', probability: 0.75}
      ]
    }
  ]
};

let Classify = (data, codigo) => {
  let maior, processador, memoria, video, i, indice, soma ;
  let produtorio = [];
  let dataClassificada = [];

  for(let obj of data){
    maior = 0;
    soma = 0;

    if(obj.memoria_valida < 0.5)
      obj.memoria_valida = '(-inf-0.5]';
    else
      if(obj.memoria_valida < 1.5)
        obj.memoria_valida = '(0.5-1.5]';
      else
        if(obj.memoria_valida < 5)
          obj.memoria_valida = '(1.5-5]';
        else
          if(obj.memoria_valida < 12)
            obj.memoria_valida = '(5-12]';
          else
            obj.memoria_valida = '(12-inf)';

    for(i = 0; i < 4; i++){
      switch(obj.memoria_valida){
        case '(-inf-0.5]':
          memoria = bayesianModel.memoria[0].probability[i].probability;
          break;
        case '(0.5-1.5]':
          memoria = bayesianModel.memoria[1].probability[i].probability;
          break;
        case '(1.5-5]':
          memoria = bayesianModel.memoria[2].probability[i].probability;
          break;
        case '(5-12]':
          memoria = bayesianModel.memoria[3].probability[i].probability;
          break;
        case '(12-inf)':
          memoria = bayesianModel.memoria[4].probability[i].probability;
          break;
      }
      switch(obj.processador_normalizado){
        case 'comum':
          processador = bayesianModel.processador[0].probability[i].probability;
          break;
        case 'alto':
          processador = bayesianModel.processador[1].probability[i].probability;
          break;
        case 'altissimo':
          processador = bayesianModel.processador[2].probability[i].probability;
          break;
      }
      switch(obj.video_valido){
        case 'n':
          video = bayesianModel.video[0].probability[i].probability;
          break;
        case 's':
          video = bayesianModel.video[1].probability[i].probability;
          break;
      }

      produtorio[i] = (memoria * processador * video * probabilityModel[i].probability).toFixed(10);
      soma = parseFloat(produtorio[i]) + parseFloat(soma);
    }

    for(i = 0; i < 4; i++){
      if(produtorio[i]/soma > maior){
        maior = produtorio[i]/soma;
        indice = i;
      }
    }

    let temp = {
      identificador: obj.identificador,
      descricao: obj.text,
      classe: probabilityModel[indice].nome,
      processador: obj.processador_normalizado,
      processadores: obj.processador,
      memoria: obj.memoria_valida,
      video: obj.video_valido,
      quantidade: obj.quantidade,
      valor_unitario: obj.valor_unitario,
      valor_total: 0
    };

    dataClassificada.push(temp);
  }

  for(let i = 0; i < dataClassificada.length; i++){
    let preco = parseFloat(dataClassificada[i].valor_unitario);
    switch(dataClassificada[i].classe){
      case 'economico':
        if(preco <= 6000)
          dataClassificada[i].valor_total = (preco * dataClassificada[i].quantidade).toFixed(2);
        else {
          dataClassificada[i].valor_unitario = (preco / dataClassificada[i].quantidade).toFixed(2);
          dataClassificada[i].valor_total = preco.toFixed(2);
        }
        break;
      case 'comum':
        if(preco <= 8000)
          dataClassificada[i].valor_total = (preco * dataClassificada[i].quantidade).toFixed(2);
        else {
          dataClassificada[i].valor_unitario = (preco / dataClassificada[i].quantidade).toFixed(2);
          dataClassificada[i].valor_total = preco.toFixed(2);
        }
        break;
      case 'alto':
        if(preco <= 25000)
          dataClassificada[i].valor_total = (preco * dataClassificada[i].quantidade).toFixed(2);
        else {
          dataClassificada[i].valor_unitario = (preco / dataClassificada[i].quantidade).toFixed(2);
          dataClassificada[i].valor_total = preco.toFixed(2);
        }
        break;
      case 'altissimo':
        if(preco <= 35000)
          dataClassificada[i].valor_total = (preco * dataClassificada[i].quantidade).toFixed(2);
        else {
          dataClassificada[i].valor_unitario = (preco / dataClassificada[i].quantidade).toFixed(2);
          dataClassificada[i].valor_total = preco.toFixed(2);
        }
        break;
    }
  }

  fs.writeFileSync('classificado-' + codigo + '.json', JSON.stringify(dataClassificada));

  return dataClassificada;
};

module.exports = {
  Classify
};
