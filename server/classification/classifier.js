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
    { nome: '(-inf-0.5]', probability: probabilityModel},
    { nome: '(0.5-1.5]',  probability: probabilityModel},
    { nome: '(1.5-5]', probability: probabilityModel},
    { nome: '(5-12]', probability: probabilityModel},
    { nome: '(12-inf)', probability: probabilityModel}
  ],
  processador: [
    { nome: 'comum', probability: probabilityModel},
    { nome: 'alto', probability: probabilityModel},
    { nome: 'altissimo', probability: probabilityModel}
  ],
  video: [
    { nome: 'n', probability: probabilityModel},
    { nome: 's', probability: probabilityModel}
  ]
};

// Economic computer probabilities
bayesianModel.memoria[0].probability[0].probability = 0.0625;
bayesianModel.memoria[1].probability[0].probability = 0.75;
bayesianModel.memoria[2].probability[0].probability = 0.0625;
bayesianModel.memoria[3].probability[0].probability = 0.0625;
bayesianModel.memoria[4].probability[0].probability = 0.0625;

bayesianModel.processador[0].probability[0].probability = 0.357142857;
bayesianModel.processador[1].probability[0].probability = 0.571428571;
bayesianModel.processador[2].probability[0].probability = 0.071428571;

bayesianModel.video[0].probability[0].probability = 0.923076923;
bayesianModel.video[1].probability[0].probability = 0.076923077;

// Common computer probabilities
bayesianModel.memoria[0].probability[1].probability = 0.017241379;
bayesianModel.memoria[1].probability[1].probability = 0.017241379;
bayesianModel.memoria[2].probability[1].probability = 0.8448275860;
bayesianModel.memoria[3].probability[1].probability = 0.103448277;
bayesianModel.memoria[4].probability[1].probability = 0.017241379;

bayesianModel.processador[0].probability[1].probability = 0.571428571;
bayesianModel.processador[1].probability[1].probability = 0.410714286;
bayesianModel.processador[2].probability[1].probability = 0.017857143;

bayesianModel.video[0].probability[1].probability = 0.945454545;
bayesianModel.video[1].probability[1].probability = 0.054545455;

// High computer probabilities
bayesianModel.memoria[0].probability[2].probability = 0.025641026;
bayesianModel.memoria[1].probability[2].probability = 0.025641026;
bayesianModel.memoria[2].probability[2].probability = 0.076923077;
bayesianModel.memoria[3].probability[2].probability = 0.794871795;
bayesianModel.memoria[4].probability[2].probability = 0.076923077;

bayesianModel.processador[0].probability[2].probability = 0.027027027;
bayesianModel.processador[1].probability[2].probability = 0.702702703;
bayesianModel.processador[2].probability[2].probability = 0.27027027;

bayesianModel.video[0].probability[2].probability = 0.972222222;
bayesianModel.video[1].probability[2].probability = 0.027777778;

// Very high computer probabilities
bayesianModel.memoria[0].probability[3].probability = 0.148148148;
bayesianModel.memoria[1].probability[3].probability = 0.037037037;
bayesianModel.memoria[2].probability[3].probability = 0.037037037;
bayesianModel.memoria[3].probability[3].probability = 0.111111111;
bayesianModel.memoria[4].probability[3].probability = 0.666666667;

bayesianModel.processador[0].probability[3].probability = 0.04;
bayesianModel.processador[1].probability[3].probability = 0.28;
bayesianModel.processador[2].probability[3].probability = 0.68;

bayesianModel.video[0].probability[3].probability = 0.25;
bayesianModel.video[1].probability[3].probability = 0.75;

// (-inf-0.5]\\\'\',\'\\\'(0.5-1.5]\\\'\',\'\\\'(1.5-5]\\\'\',\'\\\'(5-12]\\\'\',\'\\\'(12-inf)\\\'\'
let Classify = (data) => {
  let maior = 0, index, processador, memoria, video, i;
  let produtorio = [];

  let c = {
    memoria: '(1.5-5]',
    processador: 'comum',
    video: 'n'
  };

  console.log(bayesianModel.memoria[0].probability[3]);
  for(i = 0; i < 4; i++){

    switch(c.memoria){
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
    console.log(bayesianModel.memoria[2].probability[i].probability);
    switch(c.processador){
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
    console.log(processador);
    // switch(c.video){
    //   case 'n':
    //     video = bayesianModel.video[0].probability[i].probability;
    //     break;
    //   case 's':
    //     video = bayesianModel.video[1].probability[i].probability;
    //     break;
    // }

    //console.log('Model', JSON.stringify(bayesianModel.memoria, null, 2));
    // console.log(memoria + ' x ' + processador + ' x ' + video + ' x ' + probabilityModel[i].probability);
    produtorio[i] = (memoria * processador * video * probabilityModel[i].probability).toFixed(10);
  }
  //console.log('Model', JSON.stringify(bayesianModel, null, 2));
};

module.exports = {
  Classify
};
