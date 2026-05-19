installed nodemon as dev dependency so doesnt affect in prod using 
```
npm i -D nodemon
```
updated package.json for nodemon by creating a script 

```
"dev": "nodemon src/index.js"
```

added prettier setting

two approach to connect to db:
1. write all connection code in index.js so when it loads the func works,
2. or write the code in a seperate file under db and call it in the index file.

```
npm i mongoose express dotenv
```
### things to note when connecting/talking to db:
1. you'll always encounter some error when connecting to db so use try catch or use promise (as it has resolve reject to handle scenarios)
2. your db will be on different continent so you'll have to wait . use async 