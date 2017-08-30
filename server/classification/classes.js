// Normalizando os dados:
// remover ' de ', ' do ', 'tipo'
// todos os textos em minúsculo
// remover acentuação e carateres especiais(ç :)
// remover espaços entre numero e 'gb'
// manter pontos e vírgulas
// sempre começar pelo menor valor, pois o fornecedor nunca entregará o máximo e sempre o mínimo
// pegar os 20 proximos caracteres e verificar se existe 'SSD' ou 'solid state drive'
let memoria = [
  'memoria ram 4gb', //
  'memoria 4gb',
  '4gb memoria',
  '4gb memoria ram',
  '4gb ram',
  ' 4gb '
];
