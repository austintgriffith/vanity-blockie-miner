Vanity Blockie Miner
----------------------------

Brute force account creation and pixel color compare to some target image.

# Install
```
npm install
cd app
npm install
cd ..
```

Start Backend Server:
```
npm run server
```

Start Miner (You will want to run multiple instances of this):
```
npm run miner
```

Start Frontend
```
cd app
npm start
```

# AWS Ubuntu

clone this repo and cd in then provision instance with:
```
./provisionUbuntu.sh
```
(follow steps above to get server, miners, and frontend running)

a handy ssh command to get a bunch of miners going:
```
ssh ubuntuinstance "cd vanity-blockie-miner;npm run miner"
```

# Demo

I spun up a C4.8XLarge on AWS:

![largemachine](https://s3.amazonaws.com/atgpub/largemachine.png)


![demogif](https://s3.amazonaws.com/atgpub/blockieminer.gif)

