const express = require('express')
const fs = require('fs')
const app = express()
const sharp = require('sharp');

var busboy = require('connect-busboy');
var bodyParser = require('body-parser')
app.use(busboy());
app.use( bodyParser.json() );

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(express.static('images/'))

app.get('/', (req, res) => {
  let obj = {}
  obj.images = []
  fs.readdirSync("images").forEach(file => {
    obj.images.push(file)
  })
  obj.target = fs.readFileSync("./target.txt").toString().trim()
  try{
     obj.results = JSON.parse(fs.readFileSync("./results/"+obj.target+".mined").toString().trim())
  }catch(e){}
  res.send(JSON.stringify(obj))
})

app.post('/target', (req, res) => {
  console.log("target ",req.body.target)
  fs.writeFileSync("target.txt",req.body.target)
})

app.route('/upload')
    .post(function (req, res, next) {

        var fstream;
        req.pipe(req.busboy);
        req.busboy.on('file', function (fieldname, file, filename) {
            console.log("Uploading: " + filename);

            //Path where image will be uploaded
            fstream = fs.createWriteStream(__dirname + '/images/' + filename);
            file.pipe(fstream);
            fstream.on('close', function () {
              console.log("Upload Finished of " + filename);

              sharp(__dirname + '/images/' + filename)
                .resize(8,8)
                .toFile(__dirname + '/images/' + filename, (err, info) => console.log("DONE?",info) );


            });
        });
    });

app.listen(48725, () => console.log('Backend listening on 48725!'))
