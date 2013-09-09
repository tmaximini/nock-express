# Entities

These are the database entities / collections that will be managed on our side. Each entity will be implemented as MongoDB collection.

#### User

  * username
  * email
  * isAdmin
  * facebook id
  * apple id (?)
  * ...

#### Venue

  * name
  * city
  * adress
  * challenges[]
  * rating(?)

Venue data might get collected on our side as soon as we start a challenge there. Otherwise we use data from FourSquare api.

#### Challenge

  * title
  * description
  * rewards
  * users
  * venue

#### Reward

  * title
  * description
  * challenges(?)
  * points
  * users


# Routing / Web-Services

| Resource / HTTP-Verb  | GET           |    POST     |   PUT   |   DELETE   |
| --------------------- |:-------------:| :----------:| :------:| ----------:|
| /users                | show all users| create new user | error | error |
| /users/:id            | show user profile | error | update user id | delete user account |


