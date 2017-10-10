# Angular OpenAPI/Swagger Client
A simple and powerful OpenAPI/Swagger Client for Angular, based on promises to connect with endpoint using [OpenAPI/Swagger Specification 2.0](http://swagger.io/).

## Features
* `POST`, `PUT`, `GET`, `DELETE`, `PATCH` and `CONNECT` request are supported.
* Params in: `query`, `path`, `formData` and `header` are supported.
* `SecuritySchema` with `security` in API are supported(only type `apiKey`).
* By default, `PUT` and `POST` request send with `content-type: application/x-www-form-urlencoded`.
* Removes all parameters that have not been established in the API definition.
* Implements a Pre-Validator for params and supported `data types`, `format` and `required`.
* Global static and dynamic default value based on LocalStorage.
* Support for uploading files using [consume](http://swagger.io/specification/#operation-object-36) in the API definition and with at least one parameter in [formData](http://swagger.io/specification/#parameterObject).

## Getting Started

### Install
#### Install via NPM
```bash
npm install angular-swagger2-client
```
#### Install via Bower
```bash
bower install angular-swagger2-client
```

## Start Using
### Include
Include the required libraries in your `index.html`:
```html
<html>
    <head>
        <title>My Angular Application</title>
        <!-- Angular swagger Client -->
        <script src="vendor/angular-swagger2-client/dist/angular-swagger2-client.js"></script>
    </head>
    <body>
        ...
    </body>
</html>
```
> **IMPORTANT:** Where `vendor` you need replace for you downaload directory. If you ussing `bower` replace for `bower_components`, and if you using `npm` you need replace for `node_modules`
* Inject `angular-swagger2-client` module

### Inject
**angular-swagger2-client** have to be injected to your angular application as a dependency
```javascript
angular.module('myApp', [
  'angular-swagger2-client'
])
```

### Prepare you OpenAPI/Swagger
#### Synchronous swagger.json load
If you have content of your api's *swagger.json* available at config time you can use **angular-swagger2-client** like this:
```javascript
angular.module('myApp', [
  'angular-swagger2-client'
])
  .value('SwaggerData', SwaggerData) // Your api's swagger.json as a javascript object
  .provider('Api', Api); // Define Api provider

function Api() {
  // This is fully described in Provider Recipe in angularjs [docs](https://docs.angularjs.org/guide/providers#provider-recipe)
  // $get is called during dependency injection. By this your service can use other services (like SwaggerData) as dependency
  this.$get = function(AngularSwagger2Client, SwaggerData) {
    return new AngularSwagger2Client(SwaggerData)
  };
}
```

#### Asynchronous swagger.json load
Sometimes our *swagger.json* is hosted on the api server and we need to load it using AJAX.
So we need to use **lazy loading** pattern
```javascript
angular.module('myApp', [
  'angular-swagger2-client'
])
  .constant('API_URL', 'https://api.my-service.com') // Url of our api server which swagger.json is hosted there
  .provider('Api', Api); // Define Api provider

function Api() {
  var deferred;

  // This is fully described in Provider Recipe in angularjs [docs](https://docs.angularjs.org/guide/providers#provider-recipe)
  // $get is called during dependency injection. By this your service can use other services (like $http) as dependency
  this.$get = function($http, $q, API_URL, AngularSwagger2Client) {
    if (undefined === deferred) {
      deferred = $q.defer();
    }

    $http.get(API_URL + "/swagger.json")
      .success(function (data) {
        // Uncomment this if you don't have 'host' key defined in your swagger.json
        // 'host' have to refer to your API_URL without http/https://
        // data.host = API_URL.replace(/^https?\:\/\//, "");

        deferred.resolve(new AngularSwagger2Client(data));
      })
      .error(function (data) {
        deferred.reject(data);
      });

    return {
      load: function () {
        return deferred.promise;
      }
    };
  };
}
```

### Communicating with your API
Your API methods are accessible using:
```javascript
AngularSwagger2Client.api[namespace][operationId](parameters, configuration)
  .then(function (response) {
      // Data is available in response.data
      // Status is available in response.status
      // Status Text is available in response.statusText
  })
  .catch(function (response) {
      // Data is available in response.data
      // Status is available in response.status
      // Status Text is available in response.statusText

      // If rejection was due to Validation errors they're available in response.validation array
  });
```
**namespace** is a slug (all braces \[,\],\{ and \} are removed) of one of these in priority:
* path's first tag
* first part of the path (/entities/{entityId} --> entities)
* first part of the baePath (/api --> api)

#### *`object`* parameters **`optional`**
Use **parameters** to pass any *query*, *path*, *header* and *body* parameters

#### *`object`* configuration **`optional`**
Use **configuration** for any $http() method input
> **IMPORTANT:** Setting configuration may overwrite request config which are created by **angular-swagger2-client** (which are **url**, **method**, **data**, **headers** keys) to create api call in fact causes malfunction

#### Example API Definition
Suppose this *swagger.yml* describes your api and your *swagger.json* is generated based on it:
```yaml
swagger: '2.0'
info:
  title: my awesome api
  version: 2.0.0
schemes:
  - http
consumes:
  - application/my.awesome.api.v1+json
  - application/json
  - text/plain
produces:
  - application/my.awesome.api.v1+json
  - application/json

securityDefinitions:
  key:
    type: apiKey
    in: query
    name: token
  basic:
    type: basic
security:
  - key: []

parameters:
  pageParam:
    name: page
    in: query
    description: Desired page number in a paginated result set
    type: integer
    format: int32
    minimum: 1
    default: 1
  pageSizeParam:
    name: pageSize
    in: query
    description: Desired page size in a paginated result set
    type: integer
    format: int32
    minimum: 1
    default: 10

paths:
  /sessions:
    post:
      security:
        - basic: []
      tags:
        - sessions
      summary: Set up a new session by providing correct credentials
      operationId: createSession
      responses:
        201:
          description: Created
          schema:
            $ref: "#/definitions/session"
        default:
          description: Error
          schema:
            $ref: "#/definitions/error"
    delete:
      tags:
        - sessions
      summary: Revoke an existing session
      operationId: deleteSession
      responses:
        200:
          description: Revoked
        default:
          description: Error
          schema:
            $ref: "#/definitions/error"

  /entities:
    get:
      tags:
        - entities
      operationId: getEntities
      summary: Get list of filtered and paginated entities
      parameters:
        - name: keyword
          type: string
          in: query
        - $ref: '#/parameters/pageParam'
        - $ref: '#/parameters/pageSizeParam'
      responses:
        200:
          description: Ok
          schema:
            allOf:
              - $ref: "#/definitions/paginated"
              - type: object
                properties:
                  entities:
                    type: array
                    items:
                      $ref: "#/definitions/entity"
        404:
          description: Nothing found
          schema:
            $ref: "#/definitions/paginated"
        default:
          description: error
          schema:
            $ref: "#/definitions/error"

  /entities/{entityId}:
      parameters:
        - name: entityId
          required: true
          in: path
          type: integer
          format: int32
      delete:
        tags:
          - entities
        operationId: deleteEntity
        summary: Delete one entity
        responses:
          204:
            description: Deleted one
          default:
            description: error
            schema:
              $ref: "#/definitions/error"

definitions:
  credentials:
    type: object
    required:
      - username
      - secret
    properties:
      username:
        type: string
        description: Username of the user
      secret:
        type: string
        description: Secret key of the user

  session:
    type: object
    required:
      - username
      - token
    properties:
      username:
        type: string
        description: Username of the session owner
      token:
        type: string
        description: Access token of the current session. Which will be used as security key in further requests

  entity:
    type: object
    required:
      - entityId
      - name
    properties:
      entityId:
        type: integer
        format: int32
        readOnly: true
        description: Internal identifier of an entity
      name:
        type: string
        description: Name of an entity

  error:
    type: object
    required:
       - message
    properties:
      code:
        type: integer
        format: int64
      message:
        type: string
      fields:
        type: array
        items:
          type: string

  paginated:
    type: object
    required:
      - count
      - pageCount
    properties:
      count:
        type: integer
        format: int32
      pageCount:
        type: integer
        format: int32
```

#### Sign In using Basic Auth (sessions.createSession)
Provide **User**
```javascript
angular.module('myApp', [
  'angular-md5', // angular-md5 to create password hash in sign in process
  'angular-swagger2-client'
])
  .provider('User', User);

function User() {
  this.$get = function(localStorage) {
    return {
      /** @return string */
      GetUsername: function () {
        var user = localStorage.getObject('user');
        if (undefined !== user) {
          if (user.hasOwnProperty('username')) {
            return user.username;
          }
        }

        return "";
      },

      /** @return string */
      GetToken: function () {
        var user = localStorage.getObject('user');
        if (undefined !== user) {
          if (user.hasOwnProperty('token')) {
            return user.token;
          }
        }

        return "";
      }
    };
  };
}
```

**localStorage** Service for current user username and token storage
```javascript
angular.module('myApp.services.localStorage', [])
  .service('localStorage', localStorage);

/** @ngInject */
function localStorage($window) {
  return {
    set: set,
    get: get,
    setObject: setObject,
    getObject: getObject,
    clear: clear
  };

  function set(key, value) {
    if ($window.fakeLocalStorage) {
      $window.fakeLocalStorage[key] = value;
    } else {
      $window.localStorage[key] = value;
    }
  }

  function get(key, defaultValue) {
    return !$window.fakeLocalStorage ?
      $window.localStorage[key] || defaultValue :
      $window.fakeLocalStorage[key] || defaultValue;
  }

  function setObject(key, value) {
    if ($window.fakeLocalStorage) {
      $window.fakeLocalStorage[key] = angular.toJson(value);
    } else {
      $window.localStorage[key] = angular.toJson(value);
    }
  }

  function getObject(key) {
    return !$window.fakeLocalStorage ?
      angular.fromJson($window.localStorage[key] || '{}') :
      angular.fromJson($window.fakeLocalStorage[key] || '{}');
  }

  function clear() {
    if ($window.fakeLocalStorage) {
      $window.fakeLocalStorage = {};
    } else {
      $window.localStorage.clear();
    }
  }
}
```

Sign In Page Controller
```javascript
angular.module('myApp.pages.signIn')
  .controller('SignInPageCtrl', SignInPageCtrl);

/** @ngInject */
function SignInPageCtrl(localStorage, $state, Api, md5, toastr, $q) {
  var vm = this;

  // Form
  vm.form = {
    model: {
      username: '',
      password: ''
    }
  };

  vm.form.validate = function (model) {
    var deferred = $q.defer();
    var errors = [];

    if (0 === model.username.trim().length) {
      errors.push({
        'field': 'username',
        'message': "Username can't be empty or whitespace"
      });
    }

    if (0 === model.password.trim().length) {
      errors.push({
        'field': 'password',
        'message': "Password can't be empty or whitespace"
      });
    }

    if (errors.length > 0) {
      deferred.reject(errors);
    } else {
      deferred.resolve(model);
    }

    return deferred.promise;
  };

  vm.form.sanitize = function (model) {
    var deferred = $q.defer();
    var cleanModel = model;

    cleanModel.username = model.username.trim();
    cleanModel.password = model.password.trim();

    deferred.resolve(cleanModel);

    return deferred.promise;
  };

  vm.signIn = function () {
    vm.form.validate(vm.form.model)
      .catch(function (errors) {
        // Validation error

        for (var i in errors) {
          toastr.error(errors[i].message, 'Form invalid');
        }

        return Promise.reject(errors);
      })
      .then(vm.form.sanitize)
      .then(function (model) {
        return Api.load().then(function (client) {
          client.api.sessions.createSession({
            Authorization: 'Basic ' + btoa(model.username + ':' + md5.createHash(model.password))
          })
            .then(function (response) {
              // Login successful
              localStorage.setObject('user', {username: response.data.username, token: response.data.token});

              $state.go('dashboard');
            })
            .catch(function (response) {
              // Login failed
              var msg = 'Invalid Credentials';

              switch (response.status) {
                case 500:
                  msg = 'Server inaccessible';
                  break;
              }

              toastr.error(msg, 'SignIn Failed');
            });
        });
      });
  };
}
```

#### Sign Out (sessions.deleteSession)
```javascript
angular.module('myApp.pages.signOut')
  .controller('SignOutPageCtrl', SignOutPageCtrl);

/** @ngInject */
function SignOutPageCtrl(localStorage, $state, Api, User) {
  Api.load().then(function (client) {
    client.api.sessions.deleteSession({
      token: User.GetToken()
    });
  });

  localStorage.clear();

  $state.go('dashboard');
}
```

#### Working with entities
```javascript
angular.module('myApp.pages.entities')
  .controller('EntitiesPageCtrl', EntitiesPageCtrl);

/** @ngInject */
function EntitiesPageCtrl(Api, User, $q) {
    var vm = this;
    
    vm.entities = {
      count: 0,
      pageCount: 0,
      list: []
    };
    
    // Get filtered and paginated list of entities
    vm.loadEntities = function (search, page, pageSize) {
      return Api.load().then(function (client) {
        var query = {
          token: User.GetToken()
        };

        // Search
        if (undefined !== search) {
          if (undefined !== search.keyword) {
            query.keyword = search.keyword;
          }
        }

        // Pagination - Page Number
        if (undefined !== page) {
          query.page = page;
        }

        // Pagination - Page Size
        if (undefined !== pageSize) {
          query.pageSize = pageSize;
        }

        var deferred = $q.defer();
        
        client.api.entities.getEntities(query)
          .then(function (response) {
            vm.entities.count = response.data.count;
            vm.entities.pageCount = response.data.pageCount;
            vm.entities.list = [];

            for (var i in response.data.entities) {
              var entity = response.data.entities[i];
              vm.entities.list.push({
                id: entity.entityId,
                name: entity.name
              });
            }
            
            deferred.resolve(vm.entities);
          })
          .catch(function (response) {
            deferred.reject(response);
          });
        
        return deferred.promise;
      });
    };
    
    // Delete an entity
    vm.deleteEntity = function (id) {
      Api.load().then(function (client) {
        var query = {
          token: User.GetToken(),
          entityId: id
        };

        client.api.entities.deleteEntity(query)
          .then(function (response) {
            // Your entity has been deleted
          })
          .catch(function (response) {
            // Prompt user: delete failed
          });
      });
    };
    
    vm.loadEntities()
      .then(function () {
          // Your vm.entities is ready
      });
}
```

## Requirements
* AngularJS 1.4+

## API

```javascript
object AngularSwagger2Client(Object jsonObject[, Object defaultStaticData[, Array defaultDynamicData]])
```

### Params

#### *`object`* jsonObject **`required`**
This param is required and expect a json object of swagger.
> **IMPORTANT:** Only accepts the OpenAPI/Swagger Specification version 2.0.

#### *`object`* defaultStaticData **`optional`**
This parameter only accepts an object with keys and their respective values that will be used by default in all API's.
> **IMPORTANT:** Parameters that have not been defined in the `parameterObject` or `securityRequirementObject` will not be used.

#### *`array`* defaultDynamicData **`optional`**
This parameter only accepts an array with the list of localStorage keys. These keys are processed at runtime to ensure current values are obtained.
> **IMPORTANT:** Parameters that have not been defined in the `parameterObject` or `securityRequirementObject` will not be used.


## Thanks:
* [@pouyanh](https://github.com/pouyanh) - [Basic-Authentication](https://github.com/olaferlandsen/angular-swagger2-client/pull/2), [security](https://github.com/olaferlandsen/angular-swagger2-client/pull/3) and [improves](https://github.com/olaferlandsen/angular-swagger2-client/pull/4).
* [@TomStanczyk](https://github.com/TomStanczyk) - fix bower error.

This project is based on the [angular-swaggerific](https://github.com/TradeRev/angular-swaggerific) repository.

