const hayBloqueo = (a, b) =>
  `EXISTS (SELECT 1 FROM bloqueos bq WHERE (bq.bloqueador_id = ${a} AND bq.bloqueado_id = ${b}) OR (bq.bloqueador_id = ${b} AND bq.bloqueado_id = ${a}))`;

module.exports = { hayBloqueo };
