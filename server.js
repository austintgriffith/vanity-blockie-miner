const express = require('express')
const fs = require('fs')
const app = express()
const sharp = require('sharp');

if (!fs.existsSync("images")){
    fs.mkdirSync("images");
}
if (!fs.existsSync("results")){
    fs.mkdirSync("results");
}
if (!fs.existsSync("uploads")){
    fs.mkdirSync("uploads");
}

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
    if(file.indexOf(".")!=0){
      obj.images.push(file)
    }
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
            fstream = fs.createWriteStream(__dirname + '/uploads/' + filename);
            file.pipe(fstream);
            fstream.on('close', function () {
              console.log("Upload Finished of " + filename);

              sharp(__dirname + '/uploads/' + filename)
                /*.resize(8,8,{
                  kernel: sharp.kernel.nearest
                })*/
                .resize(32,32,{
                  kernel: sharp.kernel.cubic
                }).sharpen(1,1,8).resize(8,8,{
                    kernel: sharp.kernel.cubic
                  }).sharpen(1,1,16)
                /*.resize(8,8,{
                  kernel: sharp.kernel.lanczos2
                })*/
                /*.resize(8,8,{
                  kernel: sharp.kernel.lanczos3
                })*/
                .toFile(__dirname + '/images/' + filename, (err, info) => {
                  console.log("DONE?",info)
                  fs.writeFileSync("target.txt",filename)
                  res.send(filename)
                });


            });
        });
    });

app.listen(48725, () => console.log('Backend listening on 48725!'))
