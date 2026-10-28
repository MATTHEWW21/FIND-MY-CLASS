// Pedazo de SQL reutilizable: "entre a y b hay un bloqueo (de cualquiera de los dos lados)".
// Uso:  `... WHERE NOT ${hayBloqueo('$1', 'p.usuario_id')}`   (a y b son un parametro ($1) o una columna)
const hayBloqueo = (a, b) =>
  `EXISTS (SELECT 1 FROM bloqueos bq WHERE (bq.bloqueador_id = ${a} AND bq.bloqueado_id = ${b}) OR (bq.bloqueador_id = ${b} AND bq.bloqueado_id = ${a}))`;

module.exports = { hayBloqueo };
