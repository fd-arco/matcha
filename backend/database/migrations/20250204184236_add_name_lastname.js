/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.alterTable('users', (table) => {
        table.string('firstname').notNullable().defaultTo(''); // Ajout du prénom
        table.string('lastname').notNullable().defaultTo(''); // Ajout du nom de famille
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.alterTable('users', (table) => {
        table.dropColumn('firstname');
        table.dropColumn('lastname');
    });
};