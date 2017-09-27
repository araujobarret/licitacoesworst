const fs = require('fs');

let normalizaProcessador = (processador) => {
  let processador_normalizado = null;
  let valor;

  if(processador != null) {
    valor = processador.match(/[1234][.]*[0-9]*[0]*/g);
    if(processador.search('ghz') != -1 && valor != null != -1)
      if(valor < 2.6)
        processador_normalizado = 'comum';
      else
        if(valor <= 3.2)
          processador_normalizado = 'alto';
        else
          processador_normalizado = 'altissimo';
    else
      if(processador.search('i3') != -1|| processador.search('2 nucleos') != -1){
        processador_normalizado = 'comum';
      }
      else
        if(processador.search('i5') != -1 || processador.search('4 nucleos') != -1)
          processador_normalizado = 'alto';
        else
          if(processador.search('i7') != -1 || processador.search('6 nucleos') != -1 || processador.search('xeon') != -1)
            processador_normalizado = 'altissimo';
  }

  return processador_normalizado;
};

let Normalize = (codigo) => {
  let classificados = [];
  let nulos = [];
  let texto, maior, valor, busca;
  let itens = JSON.parse(fs.readFileSync('consolidado-' + codigo + '.json'));
  //let reg = /[136]{0,1}[86421][\s]{0,1}[g][b]{0,1}[,.;\sm]/g;
  let reg = /[\s.,][136]{0,1}[86421]([.][0])*[\s]*([g]([b]|bytes|b1)*|gigabyte(s)*)[,.;\sm]/g;
  let regExtras = /:| de| do/;
  let matches = [];

  for(let i = 0; i < itens.length; i++){
    if(itens[i] != null){
      texto = itens[i].descricao_detalhada.toLowerCase();
      matches[i] = itens[i].descricao_detalhada.toLowerCase().match(reg);

      // 'maximo X gb' 'maximoXgb' 'ate Xgb' e se pegar valor de SSD
      if(matches[i] != null) {
        maior = 0;
        for(let obj of matches[i]) {
          if(texto.search('ate ' + obj) == -1 && texto.search(obj.trim() + ' solid state drive') == -1 && texto.search(obj.trim() + ' ssd') == -1 &&
            texto.search('ate ' + obj.trim()) == -1 && texto.search('maximo ' + obj.trim()) == -1 &&
            texto.search(obj.trim() + 'gddr') == -1 && texto.search(obj.trim() + ' gddr') == -1){
            valor = parseInt(obj.toString().match(/[136]{0,1}[12468]/g));
            if(valor > maior)
              maior = valor;
          }
          matches[i]['maior_memoria_valida'] = maior;
        }

        if(matches[i]['maior_memoria_valida'] == 0)
          matches[i]['maior_memoria_valida'] = null;

        matches[i]['identificador'] = itens[i].identificador;
        matches[i]['text'] = texto;
        matches[i]['valor_unitario'] = itens[i].valor_unitario;
        matches[i]['quantidade'] = itens[i].quantidade;
        matches[i]['pregao_itens'] = itens[i].pregao_itens;
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
      let processador = (texto.match(/xeon|i3|i5|i7|((6|4|2|seis|quatro|quad|dois|dual)\s(nucleos|core|cores))|[0-9].{0,1}[0-9]{0,1}[0-9]{0,1}\s*ghz/g));
      if(processador != null) {
        matches[i].processador = processador;
        // Troca as vírgulas por pontos se houverem e padroniza nomenclatura
        for(let j = 0; j < matches[i].processador.length; j++) {
          matches[i].processador[j] = matches[i].processador[j].replace(/,/g, '.');
          matches[i].processador[j] = matches[i].processador[j].replace(/dois/g, '2');
          matches[i].processador[j] = matches[i].processador[j].replace(/dual/g, '2');
          matches[i].processador[j] = matches[i].processador[j].replace(/core(s)*/g, 'nucleos');
          matches[i].processador[j] = matches[i].processador[j].replace(/quatro/g, '4');
          matches[i].processador[j] = matches[i].processador[j].replace(/quad/g, '4');
          matches[i].processador[j] = matches[i].processador[j].replace(/seis/g, '6');
          matches[i].processador[j] = matches[i].processador[j].replace(/oito/g, '8');

          // Valida se o processador não é um valor máximo estabelecido
          if(texto.search('maximo ' + matches[i].processador[j]) != -1 || texto.search('maximo' + matches[i].processador[j]) != -1)
            matches[i].processador[j] = null;
          else{
            if(maior != ''){
              // Verifica se foi especificado i3, i5, i7
              if(maior.search('i3') != -1 || maior.search('i5') != -1 || maior.search('i7') != -1 || maior.search('xeon') != -1){
                if(matches[i].processador[j].search('i3') != -1)
                  maior = matches[i].processador[j];
                else
                  if(matches[i].processador[j].search('i5') != -1 && maior.search('i7') != -1)
                    maior = matches[i].processador[j];
                  else
                    if(matches[i].processador[j].search('i7') != -1 && (maior.search('i5') == -1 && maior.search('i3') == -1))
                      maior = matches[i].processador[j];
                    else
                      if(matches[i].processador[j].search('xeon') != -1 && maior.search('i3') == -1 && maior.search('i5') == -1)
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
                      maior = matches[i].processador[j];
                    }
                  }
                }
                else {
                  if(maior.search('ghz') != -1){
                    console.log('Ghz', matches[i].processador[j]);
                    if(matches[i].processador[j].search('i3') != -1 || matches[i].processador[j].search('i5') != -1 || matches[i].processador[j].search('i7') != -1)
                      maior = matches[i].processador[j];
                    else
                      if(matches[i].processador[j].search('nucleos') != -1 || matches[i].processador[j].search('core') != -1){
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

  // 'placa video' 'radeon' 'nvidia' 'video + Xgb'
  let videos = [];
  for(let i = 0; i < matches.length; i++){
    maior = null;
    if(matches[i] != null){
      texto = matches[i].text.toLowerCase();
      matches[i]['video'] = [];
      // let video = texto.match(/(placa video)\s*([1-9][g][b]|gddr)|nvidia|radeon/g);
      let video = texto.match(/(placa video)\s*(dedicada)*\s*([0]*[1-9]\s*[g][b]|gddr)|nvidia|radeon|([0]*[1-9]\s*[g][b]|gddr)\s*video/g);

      if(video != null){
        matches[i].video = video;
        for(let j = 0; j < matches[i].video.length; j++){
          if(maior != null){
            if(matches[i].video[j].search('nvidia') != -1 || matches[i].video[j].search('radeon') != -1)
              maior = matches[i].video[j];
            else
              maior = matches[i].video[j];
          }
          else {
            maior = matches[i].video[j];
          }
        }
      }
      else
        matches[i].video = null;

      matches[i]['video_valido'] = maior;
    }
  }

  for(obj of matches){
    if(obj != null){
      let temp = {
        identificador: obj.identificador,
        text: obj.text,
        valor_unitario: obj.valor_unitario,
        quantidade: obj.quantidade,
        valor_total: 0,
        memoria_valida: obj.maior_memoria_valida,
        processador_valido: obj.processador_valido,
        processador_normalizado: null,
        video_valido: obj.video_valido,
        classe: null,
        processador: obj.processador,
        video: obj.video,
        pregao_itens: obj.pregao_itens
      };

      if(temp.memoria_valida == '')
        temp.memoria_valida = 0;

      if(temp.video) {
        temp.classe = 'altissimo';
        temp.video_valido = 's';
        temp.classe = 'não classificado';
      }
      else
        if(temp.processador_valido){
          temp.classe = 'não classificado';
          temp.video_valido = 'n';
        }
        else
          temp.classe = null;

      temp.processador_normalizado = normalizaProcessador(temp.processador_valido);

      if(temp.classe)
        classificados.push(temp);
      else
        nulos.push(temp);
    }
  }

  console.log('Nulos: ', nulos.length);
  console.log('Classificados: ', classificados.length);

  return new Promise((resolve, reject) => {
    resolve(classificados);
  });
};

module.exports = {
  Normalize
};
