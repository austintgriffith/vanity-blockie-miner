Vanity Blockie Miner
----------------------------

based on https://github.com/ethereum/blockies from @avsa

# Purpose

When I was working on EthAvatar (https://github.com/ethereum/EIPs/issues/928) I was worried about an attacker replicating an Ethereum identicon (Blockie). I wanted to test how easy it would be to brute force replicate a similar enough blockie you could use it to phish an account. My conclusion was you could get close, but it really isn't worth it.

Blockies are also very important in my game Galleass.io. Each ship has a Blockie flag that represents the account countrolling it. I would love to find an account that looks like a "jolly roger". Here is the Boba Fett helmet I mined controlling a ship in Galleass:

![bobaidenticon](https://user-images.githubusercontent.com/2653167/42663562-3d12c1d6-85f3-11e8-915a-c106c1c8e07f.png)

![bobaship](https://user-images.githubusercontent.com/2653167/42663602-753b6626-85f3-11e8-9b62-facf6416358f.png)

[Boba Fett on Etherscan](https://ropsten.etherscan.io/address/0x06d59402d0b0ffd63f3660a5fe837f620c3e9df2)


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


![demogif](https://s3.amazonaws.com/atgpub/blockminersmall.gif)

