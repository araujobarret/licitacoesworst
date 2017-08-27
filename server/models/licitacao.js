let mongoose = require('mongoose');

let Licitacao = mongoose.model('Licitacao', {
	codigo_categoria: {
		type: String,
   		required: true,
    	trim: true
	},
	licitacao_itens: {
		type: String,
    	required: true,
    	trim: true
	},
	pregao_itens: {
		type: String,
    	required: true,
    	trim: true
	},
	numero_item: {
		type: String,
		default: null
	},
	valor: {
		type: Number,
		default: null
	},
	quantidade: {
		type: Number,
		default: null
	}
});

module.exports = {
	Licitacao
};


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

    // let i = 0;
    // for(let item of licitacoes){                  
    //   console.log(i);
    //   i++;
    //   axios.get(item.licitacao_itens, config).then((response) => {
    //     // console.log(completed);
    //     for(item_licitacao of response.data._embedded.itensLicitacao){
    //       if(item_licitacao.codigo_item_material == codigo_item_material){
    //         licitacoes[licitacoes.indexOf(item)]['numero_item'] = response.data._embedded.itensLicitacao.indexOf(item_licitacao);
    //         break;
    //       }
    //     }
    //     completed++;
    //     if(licitacoes.length == completed)
    //       res.send(licitacoes);
    //   });
      // if(licitacoes.length == completed)        
    //axios.get()
    // return new Promise((resolve, reject) => resolve(responseLicitacoes));
    //res.send(responseLicitacoes.data._embedded.licitacoes);  