-- [gitignore generator](https://mrkandreev.name/snippets/gitignore-generator/)

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
2. or write the code in a seperate file under db export and import to index and execute it.

```
npm i mongoose express dotenv
```
### things to note when connecting/talking to db:
1. you'll always encounter some error when connecting to db so use try catch or use promise (as it has resolve reject to handle scenarios)
2. your db will be on different continent so you'll have to wait . use async 

used mongoose agregator pagination pipeline 
```
npm install mongoose-aggregate-paginate-v2
```

for password hashing
```
npm i bcryptjs
```
using jwt.io to see
```
npm i jsonwebtoken
```
## strategy for file upload 
1. use multer to take file from a user and upload it temperorily to our local server
2. then take that file from local server and upload to cloudinary server
the reason: cause in production grade this is a common practice, cause in case we need to re attempt to upload file, we dont need to ask user to upload it multiple times.

installed 
```
npm i cloudinary
npm i multer
```
using unlink 
read : https://nodejs.org/api/fs.html