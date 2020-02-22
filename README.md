# HRG Feed Manager Service

## Introduction
The HRG Feed Manager Service **(hrg-feed-manager)** manages onboarding HRG Feed users, their posts and comments into a Mongo backend. To clone this project...

```sh
    git clone https://github.com/ram95krishh/hrg-feed-manager.git
```

### Features!
  - Scripts to onboard Users and inject Posts and Comments,
  - APIs to retrieve User(s) and Post(s) with Comments & to update User Image,
  - Protected with a simple JWT Authentication mechanism.

### Installation

Both the scripts to onboard users and the service are present in the same project.
**Note:**  Before running the scripts, please have the server spun up using the following instructions
```sh
        $ cd hrg-feed-manager
```
- Create a .env file and include the environmental variables
```sh
        $ touch .env
```
- Install the dependencies and start the server.
```sh
        $ npm install
        $ npm start
```
Verify the server status by hitting this health-check endpoint.
[127.0.0.1:7600/health](127.0.0.1:7600/health)

### Scripts
The scripts can be found in the /scripts folder of the project.

```
        $ cd scripts
```
- Onboards all users from the source - https://jsonplaceholder.typicode.com/users using the command...
##### Objective 1.a
# 
```sh
        $ sh onboard_users.sh
```
- Inject posts and comments from 
https://jsonplaceholder.typicode.com/posts &
https://jsonplaceholder.typicode.com/comments using...

#### Objective 1.b
# 
```sh
        $ sh inject_posts.sh
```
## API Reference...

To get Auth Token to access all other endpoints
#### Objective 2.a (login and logout)
```
    localhost:7600/users/login          - POST
    
    Payload:
    {
        "username": [username],
        "password": [reverse-of-email]
    }
    
    Returns : Jwt Token as String
```
And to logout, use token obtained in login as Bearer token in Headers and call
```
    localhost:7600/users/logout         - GET
    localhost:7600/users/logout-all     - GET   // to invalidate all tokens
```
***Note** - For all preceding endpoint the token needs to be used as a Bearer Token in all the api call headers

#### Objective 2.b (To fetch user details)
```
    localhost:7600/users/my-info        - GET
```

#### Objective 2.c (To fetch user posts)
```
    localhost:7600/posts                - GET
```

#### Objective 2.d (To fetch all users)
```
    localhost:7600/users/get-all        - GET
    Returns:
        200 - All Users for Admins,
        401 - For unauthorized users & Viewers
```

#### Objective 2.e (To fetch all posts)
```
    localhost:7600/posts/get-all        - GET
    Returns:
        200 - All Posts for Admins,
        401 - For unauthorized users & Viewers
```


### Tech

This project uses a number of open source projects/libraries, some of which are listed here:

* [Express] - fast node.js network app framework
* [mongoose] - a MongoDB object modeling tool designed to work in an asynchronous environment!
* [bcrypt] - to encrypt passwords before storing them
* [joi] - to validate environment and other variables
* [JWTs] - to generate & verify auth tokens (JWTs) after successful Authentication.
* [Multer-S3] - Streaming multer storage engine for AWS S3.
* [RamdaJs] - A practical functional library for JavaScript programmers.

### Todos

 - Write Unit Tests
 - Set up deployment and scripts
 - Add Swagger endpoints returning swagger JSONs for API Reference
 - Add Documentation for code using [JSDoc]


# Hakunamata, have a great day!

   [Express]: <https://github.com/expressjs/express>
   [mongoose]: <https://github.com/Automattic/mongoose>
   [bcrypt]: <https://github.com/kelektiv/node.bcrypt.js>
   [joi]: <https://github.com/hapijs/joi>
   [JWTs]: <https://github.com/auth0/node-jsonwebtoken>
   [Multer-S3]: <https://github.com/badunk/multer-s3>
   [RamdaJs]: <https://github.com/ramda/ramda>
   [JSDoc]: https://github.com/jsdoc/jsdoc
