((angular:any) => {
    /**
     * @return object
     * */
    function Utils ():any {
        let fn = {};
        fn = {
            /**
             * @param {*} value
             * */
            isNull      :   (value:any):boolean => {return null === value},
            /**
             * @param {*} value
             * */
            isUndefined :   (value:any):boolean => {return undefined === value},
            /**
             * @param {*} value
             * */
            isEmpty     :   (value: any)   :boolean => {
                if (value === null || value === undefined) return true;
                else if (angular.isArray(value) || typeof value ==='string') return value.length == 0;
                else if (angular.isObject(value)) return Object.keys(value).length == 0;
                else if (typeof value ==='number') return value === 0;
                else return String(value).length === 0;
            },
            /**
             * @param {*} value
             * */
            isString    :   (value: any)   :boolean => {return typeof value === 'string'},
            /**
             * @param {*} value
             * */
            isInteger   :   (value: any)   :boolean => {return Number (value) === value && value % 1 === 0},
            /**
             * @param {*} value
             * */
            isLong      :   (value: any)   :boolean => {return Number (value) === value && value % 1 === 0},
            /**
             * @param {*} value
             * */
            isFloat     :   (value: any) :boolean => {return Number (value) === value && value % 1 !== 0},
            /**
             * @param {*} value
             * */
            isBoolean   :   (value: any) :boolean            => {return value === true || value === false},
            /**
             * @param {string} from
             * @param {object} to
             * */
            replace     :   (from : string, to: any) :string => {
                if (to === undefined || to === null) to = {};

                if (!angular.isObject(to))
                    throw new Error('Utils.replace: second param: requiere a object:' + typeof to );
                if (from.length == 0)
                    throw new Error('Utils.replace: first param: requiere a input text');
                const properties = from.match(/[^{}]+(?=\})/g) || [];
                for (let property in properties) {
                    let value = '';
                    if (to.hasOwnProperty(property))
                        value = to[property];
                    from = from.replace('{' + property + '}', value)
                }
                return from;
            },
            /**
             * @param {*} array
             * @param {*} value
             * */
            contains    :   (array: any, value: any) :boolean=> {return array.indexOf(value) >= 0},
            /**
             *  Remove repeat item in array
             *
             * @param {*} value
             * @return Array
             * */
            unique      :   (value:any):any => {
                let a = value.concat();
                for(let i=0; i<a.length; ++i) {
                    for(let j=i+1; j<a.length; ++j) {
                        if(a[i] === a[j])
                            a.splice(j--, 1);
                    }
                }
                return a;
            },
            /**
             * Get datatype of a value
             *
             * @param {*} value
             * @return string
             * */
            getDataType :   function (value:any):string {
                if (angular.isArray(value)) return 'array';
                else if (angular.isObject(value)) return 'object';
                else if (this.isInteger(value)) return 'integer';
                else if (this.isFloat(value)) return 'float';
                else if (this.isBoolean(value)) return 'boolean';
                else if (this.isLong(value)) return 'long';
                return 'undefined';
            },
            /**
             * Check if datatype of value is same to...
             *
             * @param {*} value
             * @param {string} datatype
             * @return boolean
             * */
            isDatatype  :   function (value:any, datatype:string):boolean {
                if (datatype === 'double') datatype = 'float';
                else if (datatype === 'long') datatype = 'integer';
                return this.getDataType(value) === datatype;
            }
        };
        return fn;
    }
    angular
        .module('angular-swagger2-client', [])
        .factory('Utils', Utils)
        .factory('AngularSwagger2Client', AngularSwagger2Client);
    //AngularSwagger2Client.$inject = ['$http', 'Utils', '$httpParamSerializer', '$q'];
    /**
     *
     * @param {*} $http
     * @param {*} Utils
     * @param {*} $httpParamSerializer
     * @param {*} $q
     * */
    function AngularSwagger2Client  ($http:any, Utils:any, $httpParamSerializer:any, $q:any):any {
        let self = this;
        let swaggerObject:SwaggerObject;
        let defaultDataObject:SwaggerObject;
        let localStorageKeysArray:SwaggerObject;
        /**
         *
         * @param {object} jsonObject
         * @param {object} defaultData
         * @param {Array} localStorageKeys
         * */
        let AngularSwagger2Client = function (jsonObject:any, defaultData:any, localStorageKeys:any):any {
            this.api = {};
            this.host = {};
            this.localStorageKeys = localStorageKeys ||[];
            this.defaultData = defaultData ||{};
            if (!jsonObject || jsonObject === '') {
                throw new Error("Invalid json Object.");
            }
            defaultDataObject = defaultData || {};
            localStorageKeysArray = localStorageKeys || [];
            swaggerObject = jsonObject;
            return this.init();
        };
        /**
         * */
        AngularSwagger2Client.prototype.init = function () {
            let self:any = this;

            let scheme  = 'http';
            if (swaggerObject.schemes.indexOf('https') > -1) {
                scheme += 's';
            }
            self.host    = scheme + '://' + swaggerObject.host
                    .replace(/\/+/, '/')
                    .replace(/(^\/+|\/+$)/, '') + '/';

            angular.forEach(swaggerObject.paths, function (paths:any, key:any) {
                angular.forEach(paths, function (path:any, innerKey:any) {
                    let namespace: any;

                    if (!path.hasOwnProperty('tags')) {
                        namespace = key.split('/')[1];
                        if (Utils.isEmpty(namespace)) {
                            namespace = swaggerObject.basePath.split('/')[1];
                        }
                    }
                    else {
                        namespace = path.tags[0];
                    }

                    namespace = namespace.replace (/[{}]/g, "");
                    if (!self.api[namespace]) {
                        self.api[namespace] = {};
                    }

                    if (!path.operationId) {
                        path.operationId = innerKey;
                    }
                    /**
                     * Store all api params to prepare before call it
                     * @property {object} swaggerRequest
                     * */
                    let swaggerRequest:any = {
                        uri     : key.replace(/\/+/g, '/').replace(/(^\/|\/$)/g, '').trim(),
                        data    : {
                            //paths       : [],
                            headers     : [],
                            formData    : [],
                            query       : []
                        },
                        consumes: [],
                        params  : {},
                        input   : {},
                        config  : {},
                        localStorage:localStorageKeysArray
                    };

                    /**
                     *
                     * */
                    if (path.hasOwnProperty('consumes') && !Utils.isEmpty(path.consumes)) {
                        angular.forEach(path.consumes, function (item:string) {
                            swaggerRequest.consumes.push(String(item).toLowerCase().trim())
                        });
                    }

                    /**
                     * Process parameters by api based on parametersDefinitionsObject and parameterObject
                     * @link http://swagger.io/specification/#parametersDefinitionsObject
                     * @link http://swagger.io/specification/#parameterObject
                     * */
                    angular.forEach(path.parameters, function (param:any) {
                        if (swaggerRequest.data.hasOwnProperty(param.in)){
                            let expected = param.type;
                            switch (param.type) {
                                case 'double':
                                    param.type = 'float';
                                    break;
                                case 'long':
                                    param.type = 'integer';
                                    break;
                                case 'byte':
                                case 'binary':
                                case 'date':
                                case 'dateTime':
                                case 'password':
                                    param.type = 'string';
                                    break;
                                default:
                                    expected = param.type;
                                    break;
                            }
                            swaggerRequest.params[param.name] = {
                                "name"      :   param.name,
                                "required"  :   param.required === true,
                                "type"      :   param.type || 'string',
                                "expected"  :   expected,
                                "in"        :   param.in,
                                "format"    :   param.format || 'string'
                            };
                            swaggerRequest.data[param.in].push(param.name);

                        }
                    });
                    /**
                     * Process security definitions based on securityDefinitionsObject and securitySchemeObject
                     * @link http://swagger.io/specification/#securityDefinitionsObject
                     * @link http://swagger.io/specification/#securitySchemeObject
                     * */
                    if (swaggerObject.hasOwnProperty('securityDefinitions')) {
                        angular.forEach(path.security, function (rule:any) {
                            angular.forEach(rule, function (value:any, property:any) {
                                if (swaggerObject.securityDefinitions.hasOwnProperty(property)) {
                                    let security = swaggerObject.securityDefinitions[property];
                                    swaggerRequest.params[security.name] = {
                                        "required":   true,
                                        "type"    :   'string',
                                        "in"      :   security.in,
                                        "format"  :   security.type
                                    };
                                    if (swaggerRequest.data.hasOwnProperty(security.in)) {
                                        swaggerRequest.data[security.in].push(security.name);
                                    }
                                }
                            })
                        });
                    }
                    /**
                     * Create a api function
                     * @param {object} data - This object need contains all params you need passed
                     * @param {object} config - If you need set you own config, you need set a object based on $http
                     * @link https://docs.angularjs.org/api/ng/service/$http
                     * */
                    self.api[namespace][path.operationId] = function(data:any, config:any) {
                        if (angular.isObject(data) && data !== null) {
                            swaggerRequest.input = angular.extend({}, swaggerRequest.input, data);
                        }

                        if (angular.isObject(config) && config !== null) {
                            swaggerRequest.config = angular.extend({}, swaggerRequest.config, config);
                        }
                        return self.trigger(
                            key,
                            innerKey,
                            swaggerRequest
                        );
                    };
                })
            });
        };
        /**
         *
         * @param {string} path
         * @param {string} method
         * @param {object} swaggerRequest
         * */
        AngularSwagger2Client.prototype.trigger = function(path:string, method:string, swaggerRequest:any):any {


            let serializedUriQuery:any;
            let self:any = this;


            if (angular.isObject(defaultDataObject)) {
                swaggerRequest.input = angular.extend({}, defaultDataObject, swaggerRequest.input)
            }
            angular.forEach(swaggerRequest.localStorage, function (name:any) {
                /**
                 * If name exists on swaggerRequst.input, so no need set it.
                 * */
                if (swaggerRequest.input.hasOwnProperty(name)) {
                    return false;
                }
                let value = window.localStorage.getItem(name) || window.localStorage[name] || null;
                if (value !== null && value !== undefined) {
                    swaggerRequest.input[name] = value;
                }
            });


            //
            let properties = swaggerRequest.uri.match(/[^{}]+(?=\})/g);

            angular.forEach(properties, function (property:any) {
                let value = '';
                if (swaggerRequest.input.hasOwnProperty(property)) {
                    value = swaggerRequest.input[property];
                    //delete swaggerRequest.input[property];
                }
                swaggerRequest.uri = swaggerRequest.uri.replace('{' + property + '}', value);
            });

            //
            let finalResponse:any = {
                uri         :   swaggerRequest.uri,
                status      :   null,
                statusText  :   null,
                data        :   null,
                validation  :   [],
                values      :   swaggerRequest.input,
                params      :   swaggerRequest.params
            };



            /**
             * By default, $http don't set content-type:application/x-www-form-urlencoded for POST and PUT
             * So, if you need send a POST or PUT, angular-swagger2-client set this header.
             * Learn more about this case in the link
             * @link http://stackoverflow.com/a/20276775/901197
             * */
            if (method === 'post' || method === 'put') {
                /**
                 * Enable file upload
                 * */
                if (swaggerRequest.consumes.indexOf('multipart/form-data') > -1 && swaggerRequest.data.formData.length > 0) {
                    swaggerRequest.data.headers['content-type'] = 'multipart/form-dataf-8';
                }
                else {
                    swaggerRequest.data.headers['content-type'] = 'application/x-www-form-urlencoded';
                }
            }

            /**
             * Prepare formData only if the method is POST, PUT, CONNECT or PATCH
             * @todo learn more about when, where and how to use form data
             */
            if (['post', 'put', 'connect', 'patch'].indexOf(method) > -1) {
                angular.forEach(swaggerRequest.data.formData, function (name:string, index:any) {
                    if (swaggerRequest.input.hasOwnProperty(name)) {
                        swaggerRequest.data.formData[name] = swaggerRequest.input[name];
                        /**
                         * If the parameter is found, it must be removed so that it is not reused in another parameter,
                         * otherwise it could generate a totally unnecessary conflict.
                         * */
                        delete swaggerRequest.input[name];
                    }
                    /**
                     * The user may enter data that is not required or not used and this should not represent an error.
                     * **/
                    else {
                        delete swaggerRequest.data.formData[index];
                    }
                });
                /**
                 * After searching and assigning the values to formData, it is necessary to convert formData
                 * into a valid notation.
                 * */
                swaggerRequest.data.formData = $httpParamSerializer(swaggerRequest.data.formData);
            }
            /**
             * Prepare query params for all methods and only if it have one or more items
             * */
            if (swaggerRequest.data.query.length > 0) {
                let httpQueryObject:any = {};
                angular.forEach(swaggerRequest.data.query, function (name:string, index:any) {
                    if (swaggerRequest.input.hasOwnProperty(name)) {
                        httpQueryObject[name] = swaggerRequest.input[name];
                        delete swaggerRequest.input[name];
                    } else {
                        delete swaggerRequest.data.query[index];
                    }
                });
                finalResponse.uri += '?' + $httpParamSerializer(httpQueryObject);
            }
            /**
             * Apply a pre-validator: check required, data type and format
             * */
            angular.forEach (swaggerRequest.params, function (item:any, param:any) {
                /**
                 * Check if is required
                 * */
                if (!swaggerRequest.input.hasOwnProperty(param) && param.required === true) {
                    finalResponse.validation.push(
                        param.name +  ' is required and should be a ' + item.expected
                    );
                }
                /**
                 * Check data type
                 * */
                else if (swaggerRequest.input.hasOwnProperty(param)) {
                    if (!Utils.isDatatype(swaggerRequest.input[param], param.type)) {
                        finalResponse.validation.push(
                            param.name + ' should be a ' + param.expected
                        )
                    }
                }
                /**
                 * @todo Check format
                 * */
            });
            let httpConfig = angular.extend({
                url     :   this.host + finalResponse.uri,
                method  :   method,
                data    :   swaggerRequest.data.formData,
                headers :   swaggerRequest.data.headers
            }, swaggerRequest.config);

            // prepare promise
            let defered = $q.defer ();
            let promise = defered.promise;
            // If you have validation errors, you can't send xhr
            if (finalResponse.validation.length > 0) {
                defered.reject (finalResponse);
            }
            else {
                $http (httpConfig).then (function (response:any) {
                    finalResponse.status        = response.status;
                    finalResponse.statusText    = response.statusText;
                    finalResponse.data          = response.data;
                    defered.resolve (finalResponse);
                }, function (response:any) {
                    finalResponse.status = response.status;
                    finalResponse.statusText = response.statusText;
                    finalResponse.data = response.data;
                    defered.reject (finalResponse);
                });
            }

            return promise;
        };
        return AngularSwagger2Client;
    }
})(angular);

declare let angular: any;
interface Object {
    constructo:any;
}
interface LicenseObject {
    name    : string;
    url     : string;
}
interface ContactObject {
    name    : string;
    url     : string;
    email   : string;
}
interface InfoObject{
    title           : string;
    description     : string;
    termsOfService  : string;
    contact         : ContactObject;
    license         : LicenseObject;
    version         : string;
}
interface ExternalDocsObject {
    description : string;
    url         : string;
}
interface SwaggerObject{
    swagger     : string;
    info        : InfoObject;
    host        : string;
    basePath    : string;
    schemes     : any;
    consumes    : any;
    produces    : any;
    paths       : any;
    definitions : any;
    parameters  : any;
    responses   : any;
    securityDefinitions: any;
    security    : any;
    tags        : any;
    externalDocs: ExternalDocsObject;
}
interface AngularSwagger2Client {
    init ():any;
    $inject:any;
    api:any;
    scheme:any;
    host:any;
}
interface UtilsObject {
    isEmpty     (value:any):boolean;
    isString    (value:any):boolean;
    isInteger   (value:any):boolean;
    isFloat     (value:any):boolean;
    isDouble    (value:any):boolean;
    isLong      (value:any):boolean;
    isBoolean   (value:any):boolean;
    isArray     (value:any):boolean;
    isObject    (value:any):boolean;
    replace     (value:any):any;
    contains    (value:any):any;
}
interface SwaggerXhrRequestDataItem {
    name        :string;
    type        :string;
    format      :string;
    items       :any;
    maximun     :number;
    minimum     :number;
    maxLength   :number;
    minLength   :number;
    pattern     :string;
    maxItems    :number;
    minItems    :number;
    uniqueItems :boolean;
    multipleOf  :number;
    exclusiveMaximum:boolean;
    exclusiveMinimum:boolean;
    collectionFormat:string;
    allowEmptyValue :boolean;
    //in:string;
    //default:string;
    //enum:Array;
}
interface SwaggerXhrRequestData{
    headers : any,
    params  : any;
    paths   : any;
    query   : any;
    formData: any;
    original: any;
}
interface SwaggerXhrRequest {
    uri : string,
    data: SwaggerXhrRequestData;
}
