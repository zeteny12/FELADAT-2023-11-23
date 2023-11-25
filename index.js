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
            <h1>Sikeres kapcsolódás!</h1>
            <a class="btn btn-outline-primary" href="http://localhost:3000/osszesUgyfel">Összes ügyfél<a>
            <a class="btn btn-outline-success" href="http://localhost:3000/ugyfelKeresese">Adott ügyfél keresése<a>
            <a class="btn btn-outline-warning" href="http://localhost:3000/ujUgyfel">Új ügyfél hozzáadása<a>
            <a class="btn btn-outline-danger" href="http://localhost:3000/ugyfelTorles">Ügyfél törlése<a>
            <a class="btn btn-outline-danger" href="http://localhost:3000/ugyfelAdatTorles">Ügyfél adatainak törlése<a>
            <a class="btn btn-outline-info" href="http://localhost:3000/ugyfelAdatmodositas">Ügyfél adatainak módosítása<a>
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

//Új ügyfél hozzáadása ---- Hiba az adatbázis 'azon' elsődleges kulcs miatt
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
            <div class="container">
            <h1>Írja be az ügyfél adatait!</h1>
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

    const insertQuery = 'INSERT INTO `ugyfel` (`azon`, `nev`, `szulev`, `irszam`, `orsz`) VALUES (NULL, ?, ?, ?, ?)';
    database.query(insertQuery, [ugyfelNeve, ugyfelSzuletes, ugyfelIranyitoszam, ugyfelOrszag], (err, result) => {
        if (err) {
            throw err;
        }

        //Ha sikerült, akkor átirányítjuk az összes ügyfél oldalra, hogy látható legyen a siker
        res.redirect('/osszesUgyfel');
    });
});

//Ügyfél törlése
app.get('/ugyfelTorles', (req, res) => {
    const ugyfelTorles = `
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
            <div class="container">
            <h1>Írja be az ügyfél azonosítóját!</h1>
                <div class="row">
                    <form action="/ugyfelTorles" method="post">
                    <label for="azonositoID">Tartomány: 1001 - 1013</label>
                    <br>
                    <input type="number" id="azonositoID" name="azonositoID" value="1001">
                    <br>
                    <br>
                    <button type="submit" class="btn btn-danger">Törlés</button>
                    </form>
                </div>
            </div>
        </body>
        </html>
    `;

    res.send(ugyfelTorles);
});
app.post('/ugyfelTorles', (req, res) => {
    const azonosito = req.body.azonositoID;

    //Ellenőrzi, hogy van-e befizetés az ügyfélre az adatbázisban
    const ellenorzesQuery = 'SELECT * FROM befiz WHERE azon = ?';

    database.query(ellenorzesQuery, [azonosito], (err, befizRows) => {
        if (err) {
            throw err;
        }

        if (befizRows.length > 0) {
            //Ha van, először azt kell törölni
            const torlesBefizQuery = 'DELETE FROM befiz WHERE azon = ?';

            database.query(torlesBefizQuery, [azonosito], (err, befizTorlesResult) => {
                if (err) {
                    throw err;
                }

                //Utána törölhetjük az ügyfelet, mert már nincs rá hivatkozás a befiz táblában
                const torlesUgyfelQuery = 'DELETE FROM ugyfel WHERE azon = ?';

                database.query(torlesUgyfelQuery, [azonosito], (err, ugyfelTorlesResult) => {
                    if (err) {
                        throw err;
                    }

                    //Sikeres törlés esetén átirányítjuk a felhasználót az összes ügyfél oldalra, hogy látható legyen a törlés
                    res.redirect('/osszesUgyfel');
                });
            });
        } else {
            //Ha nincs befizetés, azonnal törölhetjük az ügyfelet
            const torlesUgyfelQuery = 'DELETE FROM ugyfel WHERE azon = ?';

            database.query(torlesUgyfelQuery, [azonosito], (err, ugyfelTorlesResult) => {
                if (err) {
                    throw err;
                }

                //Sikeres törlés esetén átirányítjuk a felhasználót az összes ügyfél oldalra, hogy látható legyen a törlés
                res.redirect('/osszesUgyfel');
            });
        }
    });
});

//Ügyfél adatainak törlése ---- Valamiért az egészet törli
app.get('/ugyfelAdatTorles', (req, res) => {
    const ugyfelAdatTorles = `
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
            <div class="container">
            <h1>Ügyfél adatainak törlése</h1>
                <div class="row">
                    <form action="/ugyfelTorles" method="post">
                        <label for="azonositoID">Tartomány: 1001 - 1013</label>
                        <br>
                        <input type="number" id="azonositoID" name="azonositoID" value="1001">
                        <br>
                        <br>
                        <button type="submit" class="btn btn-danger" name="torlendoMezo" value="nev">Név törlés</button>
                        <button type="submit" class="btn btn-danger" name="torlendoMezo" value="szulev">Születési év törlés</button>
                        <button type="submit" class="btn btn-danger" name="torlendoMezo" value="irszam">Irányítószám törlés</button>
                        <button type="submit" class="btn btn-danger" name="torlendoMezo" value="orsz">Országkód törlés</button>
                    </form>
                </div>
            </div>
        </body>
        </html>
    `;

    res.send(ugyfelAdatTorles);
});
app.post('/ugyfelAdatTorles', (req, res) => {
    const azonosito = req.body.azonositoID;
    const { torlendoMezo } = req.body;

    //Ellenőrzi, hogy van-e ilyen azonosítójú ügyfél
    const ellenorzesQuery = 'SELECT * FROM ugyfel WHERE azon = ?';

    database.query(ellenorzesQuery, [azonosito], (err, rows) => {
        if (err) {
            throw err;
        }

        if (rows.length > 0) {
            const ugyfel = rows[0];

            //Éték NULL-ra állítása, törlés céljából
            const frissitesQuery = `UPDATE ugyfel SET ${torlendoMezo} = NULL WHERE azon = ?`;

            database.query(frissitesQuery, [azonosito], (err, result) => {
                if (err) {
                    throw err;
                }

                res.send(`Az ${torlendoMezo} sikeresen törölve az ügyfél adataiból.`);
            });
        } else {
            res.status(404).send('Az adott azonosítójú ügyfél nem található.');
        }
    });
});

//Ügyfél adatainak módosítása ---- ez is törli!?
app.get('/ugyfelAdatmodositas', (req, res) => {
    const ugyfelAdatmodositas = `
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
            <div class="container">
            <h1>Ügyfél adatainak módosítása</h1>
                <div class="row">
                    <form action="/ugyfelTorles" method="post">
                        <label for="azonositoID">Tartomány: 1001 - 1013</label>
                        <br>
                        <input type="number" id="azonositoID" name="azonositoID" value="1001">
                        <br>
                        <br>
                        <button type="submit" class="btn btn-info" name="modositandoMezo" value="nev">Név módosítása</button>
                        <input type="text" id="Nev" name="Nev">
                        <br>
                        <br>
                        <button type="submit" class="btn btn-info" name="modositandoMezo" value="szulev">Születési év módosítása</button>
                        <input type="number" id="Szulev" name="Szulev">
                        <br>
                        <br>
                        <button type="submit" class="btn btn-info" name="modositandoMezo" value="irszam">Irányítószám módosítása</button>
                        <input type="number" id="Irszam" name="Irszam">
                        <br>
                        <br>
                        <button type="submit" class="btn btn-info" name="modositandoMezo" value="orsz">Országkód módosítása</button>
                        <input type="text" id="Orsz" name="Orsz">
                    </form>
                </div>
            </div>
        </body>
        </html>
    `;

    res.send(ugyfelAdatmodositas);
});
app.post('/ugyfelAdatmodositas', (req, res) => {
    const azonositoID = req.body.azonositoID;
    const modositandoMezo = req.body.modositandoMezo;

    let updateField = '';
    let newValue = '';

    switch (modositandoMezo) {
        case 'nev':
            updateField = 'nev';
            newValue = req.body.Nev;
            break;
        case 'szulev':
            updateField = 'szulev';
            newValue = req.body.Szulev;
            break;
        case 'irszam':
            updateField = 'irszam';
            newValue = req.body.Irszam;
            break;
        case 'orsz':
            updateField = 'orszagkod';
            newValue = req.body.Orsz;
            break;
        default:
            res.send('Érvénytelen módosítás.');
            return;
    }

    const sqlQuery = `UPDATE ugyfel SET ${updateField} = ? WHERE azon = ?`;

    connection.query(sqlQuery, [newValue, azonositoID], (err, results) => {
        if (err) {
            console.error('Hiba az SQL lekérdezés végrehajtása során: ' + err.stack);
            res.send('Hiba a rekord módosítása során.');
            return;
        }

        if (results.affectedRows > 0) {
            res.send('Rekord módosítva sikeresen.');
        } else {
            res.send('Rekord nem található.');
        }
    });
});


//Port
const port = 3000;
app.listen(port, () =>{
    console.log(`A szerver fut a ${port} porton.`);
});