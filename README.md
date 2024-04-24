# Rest api for MiniApp Portal Network
This is service working together with [mini application](https://github.com/PortalNetworkDev/Telegram-app-network-front) 

It has the ability to create tasks for Telegram and TON users, the following types of tasks are available:
- Checking the text read
- Checking your subscription to a telegram channel or group
- Checking whether the TON wallet is connected
- Has the user added TON to liquidity?
- Whether the user purchased tokens
- Referral program


## Preparing

Create file .exports with 
```
export BOTTOKEN=""
export REFERALREWARD=1
export ADMINS="username_without_dog"
export DBHOST=""
export DBUSER=""
export DBPASSWORD=""
export DBNAME=""
export DBPORT=
export MNEMONIC=""
export TONWEBAPIKEY=""
export JETTONADDRESS=""
export MINREWARDFORTRANSFER=4
```

fill all variables and now you can run

and do not forget run `npm install`

## Run on the host 

In the project directory, you can run:

### `source .exports && npm run dev`

To start the app in dev mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `source .exports && npm start`

For production mode

## Run on docker

Just run `docker compose up`

## Import postman collection and use

### `file PortalNetworkTasks.postman_collection.json`

## Get static

Just get 

### Icons example `http://localhost:3000/static/icon/atom.png`
### Html example `http://localhost:3000/static/html/litepaper.html`