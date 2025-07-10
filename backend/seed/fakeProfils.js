const bcrypt = require('bcrypt');
const pool = require('../server/config/db');
const {faker} = require('@faker-js/faker');

const otherFirstnames = ['Emma', 'Liam', 'Olivia', 'Noah', 'Chloe', 'Lucas', 'Mia', 'Ethan', 'Léa', 'Gabriel'];
const maleFirstnames = ['Liam', 'Noah', 'Lucas', 'Ethan', 'Gabriel', 'Arthur', 'Mohammed', 'Felix', 'Victor', 'Antoine'];
const femaleFirstnames = ['Emma', 'Olivia', 'Chloe', 'Mia', 'Lea', 'Mathilde', 'Isabelle'];
const lastnames = ['Martin', 'Bernard', 'Thomas', 'Robert', 'Petit', 'Durand', 'Moreau', 'Simon', 'Laurent', 'Michel'];
const genders = ['male', 'female', 'other'];
const interestedOptions = ['men', 'women', 'beyondBinary', 'everyone'];
const lookingForOptions = ['serious', 'nothingSerious', 'makingFriends', 'notSure'];
const passionsPool = ["Music", "Sports", "Reading", "Traveling", "Cooking", "Gaming", "Dancing", "Art", "Photography", "Movies"];

const TOTAL_USERS = 500;

function getRandomDob() {
    const age = Math.floor(Math.random() * 82) + 18;
    const dob = faker.date.birthdate({min:age, max:age, mode:'age'});
    return {age, dob};
}

function getRandomCoordsInFrance() {
    const lat = faker.location.latitude({min:42.0, max:51.0});
    const lon = faker.location.longitude({min:-5.0, max:8.0});

    return {lat, lon};
}

async function seedFakeProfils() {
    const plainPassword = 'Matcha123!';
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const client = await pool.connect();

    try {
        console.log("insertion des utilisateurs....");

        for (let i =1; i<= TOTAL_USERS; i++) {
            const gender = faker.helpers.arrayElement(genders);
            let firstName = 'Alex';
            if (gender === 'male') {
                firstName = maleFirstnames[Math.floor(Math.random() * maleFirstnames.length)];
            } else if (gender === 'female') {
                firstName = femaleFirstnames[Math.floor((Math.random() * femaleFirstnames.length))];
            } else {
                firstName = otherFirstnames[Math.floor(Math.random() * otherFirstnames.length)];
            }
            const lastname = lastnames[Math.floor(Math.random() * lastnames.length)];
            const email = `${firstName.toLowerCase()}.${lastname.toLowerCase()}${i}@matcha.com`;

            const daysAgo = Math.floor(Math.random() * 30);
            const lastOnline = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

            const userRes = await client.query(
                `INSERT INTO users (email, password, firstname, lastname, verified, verifToken, token_password, last_online)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING id`,
                [email, hashedPassword, firstName, lastname, false, null, null, lastOnline]
            );
            const userId = userRes.rows[0].id;

            const name = firstName;
            const {dob, age} = getRandomDob();
            const interested_in = faker.helpers.arrayElement(interestedOptions);
            const looking_for = faker.helpers.arrayElement(lookingForOptions);
            const bio = faker.lorem.sentence();
            const fame = Math.floor(Math.random() * 1001);
            const fame_bio = bio.length >0;
            const selected = faker.helpers.arrayElements(passionsPool, Math.floor(Math.random() * 5) + 1);
            const passions = JSON.stringify(selected);
            const passions_count = selected.length;
            const photo_count = 1;
            const {lat:latitude, lon:longitude} = getRandomCoordsInFrance();
            const created_at = faker.date.recent({days:30});

            const profileRes = await client.query(
                `INSERT INTO profiles (user_id, name, dob, gender, interested_in, looking_for, passions, bio, age, fame,
                                    fame_bio, passions_count, photo_count, latitude, longitude, method, city, location_enabled, created_at)
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
                        $11,$12,$13,$14,$15,$16,$17,$18,$19)
                RETURNING id`,
                [userId, name, dob, gender, interested_in, looking_for, passions, bio, age, fame,
                fame_bio, passions_count, photo_count, latitude, longitude, 'manual', null, true, created_at]
            );
            const profileId = profileRes.rows[0].id;

            let photoUrl = '/fakeprofilephotos/avatar_men_0.jpg';

            if (gender === 'male') {
                const index = Math.floor((i - 1) / 2 % 100); 
                photoUrl = `/fakeprofilephotos/avatar_men_${index}.jpg`;
            } else if (gender === 'female') {
                const index = Math.floor((i - 1) / 2 % 100); 
                photoUrl = `/fakeprofilephotos/avatar_women_${index}.jpg`;
            } else {
                const index = Math.floor((i - 1) / 2 % 100); 
                const prefix = i % 2 === 0 ? 'men' : 'women';
                photoUrl = `/fakeprofilephotos/avatar_${prefix}_${index}.jpg`;
            }

            await client.query(
                `INSERT INTO profile_photos (profile_id, photo_url)
                VALUES ($1, $2)`,
                [profileId, photoUrl]
            );
            if (i % 50 === 0) {
                console.log(`${i} utilisateurs inseres`);
            }
        }

        console.log("Insertion des 500 utilisateurs terminee!");
    } catch (error) {
        console.error("erreur lors du seed des users:", error);
    } finally {
        client.release();
    }
}

module.exports= seedFakeProfils;