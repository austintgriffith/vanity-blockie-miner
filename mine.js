var fs = require("fs")
let mine;
const iterations = 30000
let doMine = async function(){
  while(true){
    delete require.cache[require.resolve('./modules/miner.js')]
    mine = require("./modules/miner.js")
    let targetFile = fs.readFileSync("target.txt").toString().trim();
    if(targetFile=="none"){
      console.log("Idle...")
      await timeout(5000)
    }else{
      console.log("Mining Image",targetFile)
      await mine(targetFile,iterations)
    }
  }
}
function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
doMine()
