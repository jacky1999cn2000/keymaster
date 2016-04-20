# keymaster

### DB CONFIG
DB configuration for Prod and Dev environments are saved in *./config/env/production.js* and *./config/env/development.js* respectively.

*development.js*
```javascript
module.exports = {  
  aws:{  
    region: 'fakeRegion',  
    endpoint: 'http://dynamodb:8000/',  
    accessKeyId: 'fakeAccessKeyId',  
    secretAccessKey: 'fakeSecretAccessKey'  
  }  
};
```
*production.js* (replace region, endpoint, accessKeyId, secretAceessKey with real value)
```javascript
module.exports = {  
  aws:{  
    region: 'us-west-2',  
  endpoint: 'dynamodb.us-west-2.amazonaws.com',  
  accessKeyId: 'xxx',  
  secretAccessKey: 'xxx'  
  }  
};
```
### DOCKERIZED PROJECT

Dockerfile和docker.yaml的区别 - 在这个项目中,Dockerfile是用来build image,docker-compose.yaml是用来搭建dockerized local environment.

这两句命令:
  1. 根据Dockerfile的定义build一个image;
  2. run这个image

在run的时候会执行Dockerfile里的entrypoint, 所以此时的sailsjs环境是-prod, 从而和db连接所用的config也是从./config/env/production.js中取得的

```javascript
docker build -t micro-keymaster .  
docker run -p 1337:1337 micro-keymaster  
```

*Dockerfile*
```javascript
FROM node:5
MAINTAINER <Michael Bosworth> michael.bosworth@bunchball.com

ENV PORT 1337
EXPOSE 1337

COPY . /usr/src/app

WORKDIR /usr/src/app

ENTRYPOINT /usr/src/app/node_modules/.bin/forever app.js --prod
```


这个命令则是spin off了两个container,一个sailsjs project container,一个dynamodb-local container
  1. dynamodb container因为要加'-sharedDb'这个option,所以使用了command这个parameter,在此可以overwrite command,比如加config options
  2. key-master container的entrypoint调用了一个run-local.sh,shell script里根据传进来的environment variable ENV来决定是用nodemon开发还是用mocha跑unit tests(跑unit test的时候建议用docker-compose up)

```javascript
docker-compose up -d
```

*docker-compose.yaml* (change environment variable ENV to "TEST" for running unit tests)
```javascript
key-master:  
  build: .  
  links:  
   - dynamodb  
  ports:  
    - "1337:1337"  
  environment:  
    ENV: "DEV"  
  volumes:  
    - .:/usr/src/app/  
  entrypoint: "/usr/src/app/run-local.sh"  
dynamodb:  
  image: fitz/dynamodb-local  
  ports:  
  - "8000:8000"  
  command: fitz/dynamodb-local -sharedDb  
```
*run-local.sh*
```javascript
#!/bin/bash
set -e

if [ "$ENV" = 'TEST' ]; then
  echo "unit test"
  exec /usr/src/app/node_modules/mocha/bin/_mocha test/bootstrap.test.js test/unit/**/*.test.js
else
  echo "development"
  exec /usr/src/app/node_modules/nodemon/bin/nodemon.js -L --ignore node_modules/ --ignore public/ --ignore .tmp/ /usr/src/app/app.js
fi
```

### CREATE TABLE
For local development, after running "docker-compose up -d", a sails project container (micro-keymaster) and a dynamodb-local container are spinned off.
Now if make a GET request for http://<docker-machine ip>:1337/client/:id , you will see the following response. This is because we haven't created table in the db.
```javascript
{  
  "message": "Cannot do operations on a non-existent table",  
  "code": "ResourceNotFoundException",  
  "time": "2016-04-20T19:56:33.370Z",  
  "requestId": "5d402077-a687-4414-9e9d-6b8650feadec",  
  "statusCode": 400,  
  "retryable": false,  
  "retryDelay": 0  
}  
```
Go to http://<docker-machine ip>:8000/shell/ and put the following code in the left panel (dynamodb only require a partition key when creating table - also a optional sort key if necessary, and we use client_id as partition key right now. We can change it later), click run, and the table is created.
```javascript
var params = {  
    TableName : "Client",  
    KeySchema: [         
        { AttributeName: "client_id", KeyType: "HASH" },  //Partition key  
        //{ AttributeName: "name", KeyType: "RANGE" }  //Sort key  
    ],  
    AttributeDefinitions: [         
        { AttributeName: "client_id", AttributeType: "S" },  
        //{ AttributeName: "name", AttributeType: "S" }  
    ],  
    ProvisionedThroughput: {         
        ReadCapacityUnits: 1,   
        WriteCapacityUnits: 1  
    }  
};  


dynamodb.createTable(params, function(err, data) {  
    if (err)  
        console.log(JSON.stringify(err, null, 2));  
    else  
        console.log(JSON.stringify(data, null, 2));  
});
```

Now you can use POSTMAN to test the following endpoint:
  * GET: http://<docker-machine ip>:1337/client/:id
  * POST: http://192.168.99.100:1337/client/

  ```javascript
    {
      "client_id": "123456",
      "client_secret": "xyzxyz",
      "redirect_uri": "https://demo.com",
      "api_key": "jqwefjaod;ss=",
      "created_by": "woie"
    }
  ```
  * DELETE: http://<docker-machine ip>:1337/client/:id

### P.S.
 * [AWS provided a local version of dynamodb for dev/testing](http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Tools.DynamoDBLocal.html#Tools.DynamoDBLocal.DownloadingAndRunning)
 * [docker image for dynamodb-local](https://hub.docker.com/r/fitz/dynamodb-local/)
 * [need to run dynamodb-local image with -sharedDb option](http://stackoverflow.com/questions/29558948/dynamo-local-from-node-aws-all-operations-fail-cannot-do-operations-on-a-non-e)

### REFERENCE
 * http://ahmed-hany.com/aws-dynamodb-notification-service/
 * http://josephmr.com/dynamodb-testing-locally-with-node/
