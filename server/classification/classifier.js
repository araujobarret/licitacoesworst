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

// (-inf-0.5]\\\'\',\'\\\'(0.5-1.5]\\\'\',\'\\\'(1.5-5]\\\'\',\'\\\'(5-12]\\\'\',\'\\\'(12-inf)\\\'\'
let Classify = (data) => {
  let maior = 0, index, processador, memoria, video, i, soma = 0;
  let produtorio = [];

  let c = {
    m: '(1.5-5]',
    p: 'comum',
    v: 'n'
  };

  for(i = 0; i < 4; i++){
    switch(c.m){
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
      case '(12-inf]':
        memoria = bayesianModel.memoria[4].probability[i].probability;
        break;
    }
    switch(c.p){
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
    switch(c.v){
      case 'n':
        video = bayesianModel.video[0].probability[i].probability;
        break;
      case 's':
        video = bayesianModel.video[1].probability[i].probability;
        break;
    }

    //console.log('Model', JSON.stringify(bayesianModel.memoria, null, 2));
    console.log(memoria + ' x ' + processador + ' x ' + video + ' x ' + probabilityModel[i].probability);
    produtorio[i] = (memoria * processador * video * probabilityModel[i].probability).toFixed(10);
    soma = parseFloat(produtorio[i]) + parseFloat(soma);
    console.log('Produtorio', produtorio[i]);
  }
  console.log(soma);
  console.log('1', produtorio[0]);
  console.log('2', produtorio[1]/soma);
  console.log('3', produtorio[2]/soma);
  console.log('4', produtorio[3]/soma);
};

module.exports = {
  Classify
};
