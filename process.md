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

created controller and router then tested using postman

POST: http://localhost:8000/api/v1/users/register

made a change involving using next and async in pre where it changed in new version so cant use them together

configured collection in postman 
see [postman1]("./process/images/postman1.png")
see [postman1]("./process/images/postman2.png")

added method for logging in user
and created a method to generate access and refresh token with user id

created logut method and a middleware auth for logging out as cant ask user for id and password to logout and we dont have access to it in the context

added login and logout routes
finished logout method

### refreshToken and accessToken 

- access token is with the user and is a type of validation so that usser dont have to constantly login or provide credentials.
- now after a short period of time (compared to refresh token) this token gets expired
- in that case either user need to relogin based on business login or the access token needs to refresh
- for refreshing frontend (user) sends a refresh token on recieving a 401 or check if access token is expired/expiring soon, 
- the refreshToken sent by the user is then verified with the refresh token present in the db.
- then a new access token is provided to user. with a new refresh token based on the business logic (may send refresh token or maynot)
- refresh token also expires (after a long time w.r.t. access token so user need to login again )
- storage: Client stores refresh token (usually in httpOnly cookie for web, secure storage on mobile) while Server stores it in DB (or cache) to allow revocation and verification


### Subscription schema 
- when talking about subscription , there are two aspects subscribers and channels.
- every subscription object has 2 things a channel name and a subscriber name:
   example: user a subscribed to channel apple, {sub: a, channel: apple}, a->mango , b-> apple, c->apple, b->mango
-- so here: when we ask how many subs apple has, we will not look for document with channel apple and then look for its users and call it the number of subscriber it has, cause then the document will only have one subscriber. So rather find all the document where channel is apple, then count all the documents. 

--- now if you wanna know how many channels b has subscribed to: find all the document with subs as b and count
  

### aggregation pipeline mongodb //not sure
-- in layman terms the method provides data in stages where each stage carries the data from the previous stage. So if you have a db you can using stages in aggregation pipeline perform some action the on the next stage the data after the first stage becomes the db for the second stage and so on.

### How mongodb, mongoose works with id
-- When taking id through mongoose say (req.user._id) the id that is recieved is in string format, whereas it is store in mongodb as a ObjectId('231234214') so when working with aggregate pipeline all the data is passed directly to mongodb without the interference of mongodb, so a string is passed in place of objectId resulting in a mismatch. For other places where mongoose is involved it converts the string to object id when sending and vice verce when receiving.

so to we need to convert string to objectID using 


### the pagenation thing idk anymore


so when doing this 
const videoComments = await Comment.aggregate([
    {
      $match: new mongoose.Types.ObjectId(videoId)
    },
    {
      $sort:{createdAt: -1}
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerDetails"
      }
    },
    {
      $unwind: "$ownerDetails"
    },
    {
      $facet: { 
        metadata: [{ $count: "total" }],
        data: [
          {
            $skip: (pageNumber - 1) * limitNumber
          },
          {
            $limit: limitNumber
          }
        ]
      }
    }
  ])

  the output of videoComments is like this:
  // the videoComments returns two [{metadata},{data}]
  // [
  //   {
  //     "metadata": [
  //       { "total": 150 } 
  //     ],
  //     "data": [
  //       {
  //         "_id": "...",
  //         "content": "This is the first comment",
  //         "video": "...",
  //         "owner": "...",
  //         "createdAt": "...",
  //         "ownerDetails": { 
  //           "_id": "...",
  //           "username": "Alice",
  //           "avatar": "..."
  //         }
  //       },
  //       // ... up to 10 comments (your limit)
  //     ]
  //   }
  // ]
  // 
  // something like this and using facet and then data and all that is the manual way to write a pagenation pipeline


  but we can beautify using pipeline what we need as output and thats what is done in the comment.controller.js file

  ## aggregate things

  -- using $push when using array instaead of $set as it would just override everything 
  -- using $addToSet instead of $push to deal with duplicates