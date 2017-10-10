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

#### Install via NPM
```bash
npm install angular-swagger2-client
```
#### Install via Bower
```bash
bower install angular-swagger2-client
```

* Include the required libraries in your `index.html`:

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

```javascript
angular.module('myApp', [
	'angular-swagger2-client'
])
```

* Prepare you swagger

```javascript
angular.module('myApp', [
	'angular-swagger2-client'
]).run(function($rootScope, AngularSwagger2Client) {
	$rootScope.api = new AngularSwagger2Client(YouSwaggerJson);
})
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

