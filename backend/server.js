const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const knex = require('knex');


app.use(cors());
app.use(bodyParser.json());


const db = knex({
    client: 'pg',
    connection: {
        host: 'db', 
        user: 'postgres', 
        password: 'password', 
        database: 'matcha_app',
    },
});

app.use(express.json());

const PORT = 3000;

app.get('/api', (req, res) => {
    res.json({ message: 'API is running!' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// app.post("/register", (req, res) =>{

//     const{ email, firstName, lastName, password } = req.body;

//     if(!email || !firstName || !password || !lastName){
//         return res.status(400).json({ error: "vueillez tout remplir" });
//     }

//     res.json({ message: `Email recu: ${firstName} lastname: ${lastName} Email recu: ${email} password: ${password}`})

//     db('users').insert({firstName});
// })


app.post("/register", async (req, res) => {

    const { email, firstname, lastname, password } = req.body;

    if (!email || !firstname || !lastname || !password) {
        return res.status(400).json({ error: "Veuillez remplir tous les champs" });
    }
    try {

        const [newUser] = await db('users').insert({ email, firstname, lastname, password }).returning("*");

        res.status(201).json({

            message: `Utilisateur ${firstname} ${lastname} ajouté avec succès!`,
            user: newUser
        });
    } 
    catch (error) {

        console.error("Erreur lors de l'insertion:", error);
        res.status(500).json({ error: "Erreur lors de l'ajout de l'utilisateur." });
    }
});

app.get('/users', async(req, res) => {

    try{
        
        const users = await db.select("*").from("users");
        res.json(users);
    }
    catch(error){

        res.json(error, "caca dans les users");
    }

});