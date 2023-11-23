//http szerver létrehozása
const express = require('express');
const app = express();
//Kéréseink más domainekről is elfogadhatóak legyenek
const cors = require('cors');
//JSON alapú http kérések feldolgozása
app.use(express.json());
//Más domainről származó kliens kéréseinek fogadása, válaszolása
app.use(cors());
//http kérések testének (body) feldolgozása --- 'body-parser' már az 'express' beépített része
app.use(express.urlencoded({ extended: false }));


//Adatbázis elérése
const mysql = require('mysql');
const database = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'tagdij'
});
database.connect((err) => {
    if (err) throw err;
    console.log("Sikeres kapcsolódás!");
});


//----Részek----
//Kezdőlap -- 
app.get('/', (req, res) => {    //Anonym függvény, mivel ", (" között lenne a neve
    const fooldal = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
            <title>Működik!</title>
        </head>
        <body>
        <div class="container">
            <div class="row">
                <h1>Sikeres kapcsolódás!</h1>
                <a class="btn btn-outline-primary" href="http://localhost:3000/osszesUgyfel">Összes ügyfél<a>
                <a class="btn btn-outline-success" href="http://localhost:3000/ugyfelKeresese">Adott ügyfél keresése<a>
                <a class="btn btn-outline-warning" href="http://localhost:3000/ujUgyfel">Új ügyfél hozzáadása<a>
                <a class="btn btn-outline-danger" href="#">Ügyfél törlése<a>
                <a class="btn btn-outline-danger" href="#">Ügyfél adatainak törlése<a>
                <a class="btn btn-outline-info" href="#">Ügyfél adatainak módosítása<a>
            </div>
        </div>
        </body>
        </html>
    `;
    res.send(fooldal);
});

//Összes ügyfél lekérdezése
app.get('/osszesUgyfel', (req, res) => {
    let osszesUgyfel = 'SELECT * FROM `ugyfel`';

    database.query(osszesUgyfel, (err, rows) => {
        if (err) {
            throw err;
        }

        const tableRows = rows.map(row => {
            return `
                <tr>
                    <td>${row.azon}</td>
                    <td>${row.nev}</td>
                    <td>${row.szulev}</td>
                    <th>${row.irszam}</th>
                    <th>${row.orsz}</th>
                </tr>
            `;
        }).join('');

        const osszesUgyfelOldal = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
                <title>Összes Ügyfél</title>
            </head>
            <body>
            <div class="container">
            <div class="row">
                <h1>Itt látható az összes ügyfél!</h1>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Azonosító</th>
                            <th>Név</th>
                            <th>Születési év</th>
                            <th>Irányítószám</th>
                            <th>Ország</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            </div>
            </div>
            </body>
            </html>
        `;
        res.send(osszesUgyfelOldal);    //Mindig csak 1 lehet
    });
});

//Adott ügyfél lekérdezése
app.get('/ugyfelKeresese', (req, res) => {
    const ugyfelKeresese = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
            <title>Ügyfél keresése</title>
        </head>
        <body>
        <div class="container">
        <div class="row">
            <h1>Írja be az ügyfél azonosítóját!</h1>
            <form action="/ugyfelKeresese" method="get">
                <label for="azonositoID">Tartomány: 1001 - 1013</label>
                <br>
                <input type="number" id="azonositoID" name="azonositoID" value="1001">
                <br>
                <br>
                <button type="submit" class="btn btn-primary">Keresés</button>
            </form>
        </div>
        </div>
        </body>
        </html>
    `;

    const azonosito = req.query.azonositoID;

    if (azonosito) {
        const lekerdezes = 'SELECT * FROM ugyfel WHERE azon = ?';
        database.query(lekerdezes, [azonosito], (err, rows) => {
            if (err) {
                throw err;
            }

            if (rows.length > 0) {
                const ugyfelAdatok = rows[0];
                res.send(`<pre>${JSON.stringify(ugyfelAdatok, null, 2)}</pre>`);
            } else {
                res.status(404).send('Az adott azonosítóval ügyfél nem található.');
            }
        });
    } else {
        res.send(ugyfelKeresese);
    }
});

//Új ügyfél hozzáadása
app.get('/ujUgyfel', (req, res) => {
    const ujUgyfel = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
            <title>Ügyfél hozzáadása</title>
        </head>
        <body>
            <h1>Írja be az ügyfél adatait!</h1>
            <div class="container">
                <div class="row">
                    <form action="/ujUgyfel" method="post">
                        <label for="ugyfelNeve">Ügyfél neve:</label>
                        <br>
                        <input type="text" id="ugyfelNeve" name="ugyfelNeve" required>
                        <br>
                        <br>
                        
                        <label for="ugyfelSzuletes">Ügyfél születési éve:</label>
                        <br>
                        <input type="text" id="ugyfelSzuletes" name="ugyfelSzuletes" required>
                        <br>
                        <br>
                        
                        <label for="ugyfelIranyitoszam">Ügyfél irányítószáma:</label>
                        <br>
                        <input type="text" id="ugyfelIranyitoszam" name="ugyfelIranyitoszam" required>
                        <br>
                        <br>
                        
                        <label for="ugyfelOrszag">Ország kódja:</label>
                        <br>
                        <input type="text" id="ugyfelOrszag" name="ugyfelOrszag" required>
                        <br>
                        <br>
                        <button type="submit" class="btn btn-primary">Ügyfél hozzáadása</button>
                    </form>
                </div>
            </div>
        </body>
        </html>
    `;

    res.send(ujUgyfel);
});
app.post('/ujUgyfel', (req, res) => {
    const { ugyfelNeve, ugyfelSzuletes, ugyfelIranyitoszam, ugyfelOrszag } = req.body;

    const insertQuery = 'INSERT INTO `ugyfel` (`nev`, `szulev`, `irszam`, `orsz`) VALUES (?, ?, ?, ?)';
    database.query(insertQuery, [ugyfelNeve, ugyfelSzuletes, ugyfelIranyitoszam, ugyfelOrszag], (err, result) => {
        if (err) {
            throw err;
        }

        //Ha sikerült, akkor átirányítjuk az összes ügyfél oldalra, hogy látható legyen a siker
        res.redirect('/osszesUgyfel');
    });
});

//Ügyfél törlése

//Ügyfél adatainak törlése

//Ügyfél adatainek módosítása

//Port
const port = 3000;
app.listen(port, () =>{
    console.log(`A szerver fut a ${port} porton.`);
});