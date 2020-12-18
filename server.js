var express = require("express")
var app = express()
var path = require("path")
const e = require("express")
var hbs = require('express-handlebars');
const PORT = process.env.PORT || 3000
var formidable = require("formidable");


let index = 1
let tablica = []

app.use(express.static('static'))

app.set('views', path.join(__dirname, 'views'));
app.engine('hbs', hbs({
    defaultLayout: 'main.hbs',
    partialsDir: __dirname + "/views/partials/",
    extname: 'hbs'
}));
app.set('view engine', 'hbs');

app.get("/", function (req, res) {
    res.render('upload.hbs');
})

app.get("/upload", function (req, res) {
    res.render('upload.hbs');
})

app.get("/filemanager", function (req, res) {
    res.render('filemanager.hbs', { files: tablica });
})

app.get("/info", function (req, res) {
    res.render('info.hbs');
})

app.post('/handleUpload', function (req, res) {
    var form = new formidable.IncomingForm();
    form.uploadDir = __dirname + '/static/uploads/'
    form.keepExtensions = true
    form.multiples = true
    form.parse(req, function (err, fields, files) {
        if (Array.isArray(files.files)) { //sprawdzanie czy zostało zauploadowane 1 czy więcej plików
            for (var i = 0; i < files.files.length; i++) {
                let plik = {}
                plik.id = index
                plik.name = files.files[i].name
                plik.size = files.files[i].size
                plik.type = files.files[i].type
                plik.path = files.files[i].path
                plik.saveDate = files.files.lastModifiedDate
                plik.image = getExtension(plik.name) + ".png"
                console.log(plik.image)
                tablica.push(plik)
                index++
            }
        } else {
            let plik = {}
            plik.id = index
            plik.name = files.files.name
            plik.size = files.files.size
            plik.type = files.files.type
            plik.path = files.files.path
            plik.saveDate = new Date().getTime()
            plik.image = getExtension(plik.name) + ".png"
            tablica.push(plik)
            index++
        }
        console.log(tablica)
        res.redirect("/filemanager")
    });
});

app.post("/download/:id", function (req, res) {
    let name
    for (var i = 0; i < tablica.length; i++) {
        if (tablica[i].id == req.params.id) {
            name = tablica[i].path
            break
        }
    }
    res.download(name);
});

app.post("/delete/:id", function (req, res) {
    clear = []
    for (var i = 0; i < tablica.length; i++) {
        if (tablica[i].id != req.params.id) {
            clear.push(tablica[i])
        }
    }
    tablica = clear
    res.redirect("/filemanager")
})

app.get("/deleteAll", function (req, res) {
    tablica = []
    res.render("filemanager")
})

app.get("/info/:id", function (req, res) {

    for (var i = 0; i < tablica.length; i++) {
        if (tablica[i].id == req.params.id) {
            res.render("info.hbs", tablica[i])
            break
        }
    }
});

function getExtension(filename) {
    var i = filename.lastIndexOf('.');
    return (i < 0) ? '' : filename.substr(i + 1);
}

app.listen(PORT, function () {
    console.log("start serwera na porcie " + PORT)
})