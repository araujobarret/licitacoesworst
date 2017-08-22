let mongoose = require('mongoose');

let Item = mongoose.model('Item', {
  descricao: {
    type: String,
    required: true,
    trim: true
  },
  licitacao: {
    type: String,
    required: true,
    trim: true
  },
  numero_item_licitacao: {
    type: Number,
    required: true,
    trim: true
  },
  pregao: {
    type: String,
    required: true,
    trim: true
  },
  codigo_categoria: {
    type: String,
    required: true,
    trim: true
  },
  menor_valor: {
    type: Number,
    required: true,
    trim: true
  },
  quantidade: {
    type: Number,
    required: true,
    trim: true
  },
  valor_total: {
    type: Number,
    trim: true
  },
});

module.exports = {
	Item
}
