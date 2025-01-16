exports.up = function (knex) {
    return knex.schema
        .createTable('users', (table) => {
            table.increments('id').primary();
            table.string('email').notNullable().unique();
            table.string('password').notNullable();
            table.timestamp('created_at').defaultTo(knex.fn.now());
        })
        .createTable('profiles', (table) => {
            table.increments('id').primary();
            table.integer('user_id').references('id').inTable('users').onDelete('CASCADE');
            table.text('bio');
            table.string('photo_url');
            table.timestamp('created_at').defaultTo(knex.fn.now());
        })
        .createTable('messages', (table) => {
            table.increments('id').primary();
            table.integer('sender_id').references('id').inTable('users').onDelete('CASCADE');
            table.integer('receiver_id').references('id').inTable('users').onDelete('CASCADE');
            table.text('content').notNullable();
            table.timestamp('created_at').defaultTo(knex.fn.now());
        })
        .createTable('likes', (table) => {
            table.increments('id').primary();
            table.integer('liker_id').references('id').inTable('users').onDelete('CASCADE');
            table.integer('liked_id').references('id').inTable('users').onDelete('CASCADE');
            table.timestamp('created_at').defaultTo(knex.fn.now());
        });
};

exports.down = function (knex) {
    return knex.schema
        .dropTableIfExists('likes')
        .dropTableIfExists('messages')
        .dropTableIfExists('profiles')
        .dropTableIfExists('users');
};