var CryptoJS = require("crypto-js");
var EC = require('elliptic').ec;
var ec = new EC('secp256k1');
var converter = require('hsl-to-rgb');
var getPixels = require("get-pixels")
var fs = require("fs")
var randseed = new Array(4);

module.exports = function mine(targetFile,iterations){
  return new Promise((resolve, reject) => {
    try{
      let start = Date.now();
      getPixels("images/"+targetFile, function(err, pixels) {
        if(err) {
          console.log("Bad image path")
          return
        }
        let target = []
        for(let i =0;i<pixels.data.length-2;i+=4){
          target.push([pixels.data[i],pixels.data[i+1],pixels.data[i+2],pixels.data[i+3]])
        }
        //0xb3956b726cf38f6b7878a2d83917a0c33a7d2c39257503691a02a8315c1b88bc 0xf5419561cbae4f499bc25e3f65030974f958af29 7188 [X]
        var newPriv = makePriv()
        let newAddress = "0x"+addressFromPriv(newPriv)
        newPriv = "0x"+newPriv
        let blockieArray = createIcon({seed:newAddress})
        if(blockieArray.length!=target.length){
          console.log("ERROR, images are not the same size")
          process.exit(1)
        }
        let lineSize = Math.sqrt(target.length);
        let bestDiff = 9999999999999
        let bestPriv = ""
        let bestDiff2 = 9999999999999
        let bestPriv2 = ""
        let bestDiff3 = 9999999999999
        let bestPriv3 = ""
        while(iterations-- > 0){
          newPriv = makePriv()
          newAddress = "0x"+addressFromPriv(newPriv)
          newPriv = newPriv
          blockieArray = createIcon({seed:newAddress})
          let globalDiff = 0
          let linecount = 0
          for(let i=0;i<target.length;i+=lineSize){

            globalDiff +=  Math.pow(blockieArray[i].r-target[i][0], 2) + Math.pow(blockieArray[i].g-target[i][1], 2) + Math.pow(blockieArray[i].b-target[i][2], 2)
            globalDiff +=  Math.pow(blockieArray[i+1].r-target[i+1][0], 2) + Math.pow(blockieArray[i+1].g-target[i+1][1], 2) + Math.pow(blockieArray[i+1].b-target[i+1][2], 2)
            globalDiff +=  Math.pow(blockieArray[i+2].r-target[i+2][0], 2) + Math.pow(blockieArray[i+2].g-target[i+2][1], 2) + Math.pow(blockieArray[i+2].b-target[i+2][2], 2)
            globalDiff +=  Math.pow(blockieArray[i+3].r-target[i+3][0], 2) + Math.pow(blockieArray[i+3].g-target[i+3][1], 2) + Math.pow(blockieArray[i+3].b-target[i+3][2], 2)
          //  globalDiff +=  Math.abs(blockieArray[i+4].r-target[i+4][0], 2) + Math.abs(blockieArray[i+4].g-target[i+4][1], 2) + Math.abs(blockieArray[i+4].b-target[i+4][2], 2)

            // RGB distances within pixel
            globalDiff += Math.pow(rgbBlockieDistance(blockieArray[i]) - rgbTargetDistance(target[i]), 2);
            globalDiff += Math.pow(rgbBlockieDistance(blockieArray[i+1]) - rgbTargetDistance(target[i+1]), 2);
            globalDiff += Math.pow(rgbBlockieDistance(blockieArray[i+2]) - rgbTargetDistance(target[i+2]), 2);
            globalDiff += Math.pow(rgbBlockieDistance(blockieArray[i+3]) - rgbTargetDistance(target[i+3]), 2) ;
          }
          if(globalDiff<bestDiff){
            bestDiff3=bestDiff2
            bestPriv3=bestPriv2
            bestDiff2=bestDiff
            bestPriv2=bestPriv
            bestDiff=globalDiff
            bestPriv=newPriv
          }else if(globalDiff<bestDiff2){
            bestDiff3=bestDiff2
            bestPriv3=bestPriv2
            bestDiff2=globalDiff
            bestPriv2=newPriv
          }else if(globalDiff<bestDiff3){
            bestDiff3=globalDiff
            bestPriv3=newPriv
          }
        }
        let thisObject = [
          {priv:"0x"+bestPriv,pub:"0x"+addressFromPriv(bestPriv),diff:bestDiff},
          {priv:"0x"+bestPriv2,pub:"0x"+addressFromPriv(bestPriv2),diff:bestDiff2},
          {priv:"0x"+bestPriv3,pub:"0x"+addressFromPriv(bestPriv3),diff:bestDiff3},
        ]
        let bestObject = {}
        try {
          bestObject = JSON.parse(fs.readFileSync("results/"+targetFile+".mined"))
        }catch(e){}

        if(bestObject.length>0){
          console.log("EXISTS")
          Array.prototype.push.apply(bestObject,thisObject);
        }else{
          console.log("NEW")
          bestObject = thisObject
        }
         bestObject.sort(compare);
         let finalArray = []
        for(let l = 0;l<100;l++){
          finalArray.push(bestObject[l])
        }
        console.log(finalArray)
        fs.writeFileSync("results/"+targetFile+".mined",JSON.stringify(finalArray))
        let duration = Date.now()-start
        console.log("Duration ",duration)
        resolve()
      })
    }catch(e){console.log(e);resolve()}
  })
}

// Distance between color within a pixel (greyishness) for target color
function rgbTargetDistance(target) {
  let dist = Math.pow(target[0] - target[1], 2) + Math.pow(target[0] - target[2], 2) + Math.pow(target[1] - target[2], 2); 
  return dist;
}

// Distance between color within a pixel (greyishness) for blockies
function rgbBlockieDistance(blockie) {
  let dist = Math.pow(blockie.r - blockie.g, 2) + Math.pow(blockie.r - blockie.b, 2) + Math.pow(blockie.g - blockie.b, 2); 
  return dist;
}


function compare(a,b) {
  if(!b||!b.diff) return -1
  if(!a||!a.diff) return 1
  if (a.diff < b.diff)
    return -1;
  if (a.diff > b.diff)
    return 1;
  return 0;
}

function makePriv() {
  var text = "";
  var possible = "abcdef0123456789";
  for (var i = 0; i < 64; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}

function addressFromPriv(privKey) {
  var keyPair = ec.genKeyPair();
  keyPair._importPrivate(privKey, 'hex');
  var compact = false;
  var pubKey = keyPair.getPublic(compact, 'hex').slice(2);
  var pubKeyWordArray = CryptoJS.enc.Hex.parse(pubKey);
  var hash = CryptoJS.SHA3(pubKeyWordArray, { outputLength: 256 });
  var address = hash.toString(CryptoJS.enc.Hex).slice(24);
  return address;
};

function seedrand(seed) {
  for (var i = 0; i < randseed.length; i++) {
    randseed[i] = 0;
  }
  for (var i = 0; i < seed.length; i++) {
    randseed[i%4] = ((randseed[i%4] << 5) - randseed[i%4]) + seed.charCodeAt(i);
  }
}

function rand() {
  // based on Java's String.hashCode(), expanded to 4 32bit values
  var t = randseed[0] ^ (randseed[0] << 11);
  randseed[0] = randseed[1];
  randseed[1] = randseed[2];
  randseed[2] = randseed[3];
  randseed[3] = (randseed[3] ^ (randseed[3] >> 19) ^ t ^ (t >> 8));
  return (randseed[3]>>>0) / ((1 << 31)>>>0);
}

function hsl2rgb (h, s, l) {
    var r, g, b, m, c, x
    if (!isFinite(h)) h = 0
    if (!isFinite(s)) s = 0
    if (!isFinite(l)) l = 0
    h /= 60
    if (h < 0) h = 6 - (-h % 6)
    h %= 6
    s = Math.max(0, Math.min(1, s / 100))
    l = Math.max(0, Math.min(1, l / 100))
    c = (1 - Math.abs((2 * l) - 1)) * s
    x = c * (1 - Math.abs((h % 2) - 1))

    if (h < 1) {
        r = c
        g = x
        b = 0
    } else if (h < 2) {
        r = x
        g = c
        b = 0
    } else if (h < 3) {
        r = 0
        g = c
        b = x
    } else if (h < 4) {
        r = 0
        g = x
        b = c
    } else if (h < 5) {
        r = x
        g = 0
        b = c
    } else {
        r = c
        g = 0
        b = x
    }
    m = l - c / 2
    r = Math.round((r + m) * 255)
    g = Math.round((g + m) * 255)
    b = Math.round((b + m) * 255)
    return { r: r, g: g, b: b }
}

function createColor() {
  //saturation is the whole color spectrum
  var h = Math.floor(rand() * 360);
  //saturation goes from 40 to 100, it avoids greyish colors
  var s = ((rand() * 60) + 40)
  //lightness can be anything from 0 to 100, but probabilities are a bell curve around 50%
  var l = ((rand()+rand()+rand()+rand()) * 25)
  return hsl2rgb(h,s,l);
}

function createImageData(size) {
  var width = size; // Only support square icons for now
  var height = size;

  var dataWidth = Math.ceil(width / 2);
  var mirrorWidth = width - dataWidth;

  var data = [];
  for(var y = 0; y < height; y++) {
    var row = [];
    for(var x = 0; x < dataWidth; x++) {
      // this makes foreground and background color to have a 43% (1/2.3) probability
      // spot color has 13% chance
      row[x] = Math.floor(rand()*2.3);
    }
    var r = row.slice(0, mirrorWidth);
    r.reverse();
    row = row.concat(r);

    for(var i = 0; i < row.length; i++) {
      data.push(row[i]);
    }
  }
  return data;
}

function buildOpts(opts) {
  var newOpts = {};
  newOpts.seed = opts.seed || Math.floor((Math.random()*Math.pow(10,16))).toString(16);
  seedrand(newOpts.seed);
  newOpts.size = opts.size || 8;
  newOpts.scale = opts.scale || 4;
  newOpts.color = createColor();
  newOpts.bgcolor = createColor();
  newOpts.spotcolor = createColor();
  newOpts.colorArray = [newOpts.bgcolor,newOpts.color,newOpts.spotcolor]
  return newOpts;
}

function renderIcon(opts) {
  var imageData = createImageData(opts.size);
  var width = Math.sqrt(imageData.length);
  let finalArray = []
  for(var i = 0; i < imageData.length; i++) {
    finalArray.push(opts.colorArray[imageData[i]])
  }
  return finalArray;
}

function createIcon(opts) {
  var opts = buildOpts(opts || {});
  return renderIcon(opts);
}
