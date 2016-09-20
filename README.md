# GangwonSharedData

강원도 공공데이터 앱 공모전 제출작 Node.js Backend

## API Document

* Common Response

    HTTP 200 : Success

    HTTP 400 : Params Missing or Wrong Type

    HTTP 401 : Unauthorized (Token Missing or Wrong)

    HTTP 404 : Not Found

    HTTP 409 : Conflict

    HTTP 500 : My Mistake (I didn't handle it, so talk me about the error)

* Header 'Login-Token'

    need to use __Need Token Api__, can get with "/user/login" and check with Need Token Api like "/user/me" 

---
### Users API

* POST /users : User Register

> Params

    isMale : User's gender [boolean]

    age : User's age [number]

    purpose : User's purpose [bitwise or number]

    budget : User's budget [number]

    job : User's job [string]

    name : User's name [string]

    id : User's ID [string]

    password : User's Password [string]

> Response

    HTTP 200 : User

    HTTP 400 : Params Missing or Wrong Type

    HTTP 409 : ID Conflict

* POST /users/login : User Login

> Params

    id : User's ID [string]

    password : User's Password [string]

> Response

    HTTP 200 : User

    HTTP 400 : Params Missing or Wrong Type

    HTTP 401 : ID or Password Wrong

* POST /users/me : __Need Token Api__, Get User Info

> Params

    None

> Response

    HTTP 200 : User

    HTTP 401 : Token Missing or Wrong

* POST /users/me/image : __Need Token Api__, Upload User Image

> Params

    file : User Image (File, PNG)

> Response

    HTTP 200 : Okay

    HTTP 400 : File Not Exist

    HTTP 401 : Token Missing or Wrong

---
### Spots API

* GET /spots : __Need Token Api__, Get List of Spot By Query

> Params

    query : Search Query [String] [optional]

    limit : Result Array Size Limit [number] [optional, default is 10]

    skip : Result Content Skip Size, Useful With limit In Page [number] [optional, default is 0]

    purpose : [bitwise or number] [optional]

    budget : [number] [optional]

    longitude : Current User Location's Longitude [number] [optional]

    latitude : Current User Location's Latitude [number] [optional]

    maxDistance : [number] [optional]

    minScore : Min of Spot Stars' Score [number] [optional]

    address : [String] [optional]

> Response

    HTTP 200 : Array of Spot

    HTTP 400 : Params Missing or Wrong Type

    HTTP 401 : Token Missing or Wrong

* GET /spots/{id} : __Need Token Api__, Get Spot Info

> Params

    id(URL param) : MongoDB Object ID (in spots collection)

> Response

    HTTP 200 : Spot

    HTTP 401 : Token Missing or Wrong

    HTTP 404 : Spot Not Exist

* GET /spots/{id}/stars : __Need Token Api__, Get Spot Stars Array

> Params

    id(URL param) : MongoDB Object ID (in spots collection)

> Response

    HTTP 200 : Array of Stars

    HTTP 400 : Params Missing or Wrong Type

    HTTP 401 : Token Missing or Wrong

    HTTP 404 : Spot Not Exist

* POST /spots/{id}/stars : __Need Token Api__, Add Star To Spot

> Params

    id(URL param) : MongoDB Object ID (in spots collection)

    score : Score of Star [number]

    content : Content of Star [string]

> Response

    HTTP 200 : Okay

    HTTP 400 : Params Missing or Wrong Type

    HTTP 401 : Token Missing or Wrong

    HTTP 404 : Spot Not Exist

---
## Database Schema

### User

> isMale : User's gender [boolean]

> age : User's age [number]

> purpose : User's purpose [bitwise or number]

>> 가족 여행, 1 << 0 (1)

>> 관광, 1 << 1 (2)

>> 낭만, 1 << 2 (4)

>> 도심, 1 << 3 (8)

>> 럭셔리, 1 << 4 (16)

>> 레져, 1 << 5 (32)

>> 비즈니스, 1 << 6 (64)

>> 식도락, 1 << 7 (128)

> budget : User's budget [enum number]

>> 저, 0

>> 중, 1

>> 고, 2

> job : User's job [string]

> name : User's name [string]

> id : User's ID [string]

> salt : User's salt for password hashing [string]

> hash : User's hashed password [string]

### Spot

> name : Spot's Name [string]

> location : Spot's Location [GeoJson]

> oldAddress : Spot's Old Address [string]

> roadAddress : Spot's Road Address [string]

> phone : Spot's Phone Number Array [string Array]

> businessType : Spot's Business Type [enum number]

>> 일반음식점, 0

>> 관광명소, 1

>> 숙박업소, 2

> businessDetial : Spot's Detail Information of Business [string]

> stars : Spot's Stars [MongoDB Object ID Array]

>> can be populated in stars collection


### Star

> score : Star's Score [number]

> content : Star's content [string]

> owner : Food's weight unit [String]

>> can be populated in users collection

> spot : Food's barcode [String]

>> can be populated in spots collection
