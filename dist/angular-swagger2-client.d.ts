declare let angular: any;
interface Object {
    constructo: any;
}
interface LicenseObject {
    name: string;
    url: string;
}
interface ContactObject {
    name: string;
    url: string;
    email: string;
}
interface InfoObject {
    title: string;
    description: string;
    termsOfService: string;
    contact: ContactObject;
    license: LicenseObject;
    version: string;
}
interface ExternalDocsObject {
    description: string;
    url: string;
}
interface SwaggerObject {
    swagger: string;
    info: InfoObject;
    host: string;
    basePath: string;
    schemes: any;
    consumes: any;
    produces: any;
    paths: any;
    definitions: any;
    parameters: any;
    responses: any;
    securityDefinitions: any;
    security: any;
    tags: any;
    externalDocs: ExternalDocsObject;
}
interface AngularSwaggerClient {
    init(): any;
    $inject: any;
    api: any;
    scheme: any;
    host: any;
}
interface UtilsObject {
    isEmpty(value: any): boolean;
    isString(value: any): boolean;
    isInteger(value: any): boolean;
    isFloat(value: any): boolean;
    isDouble(value: any): boolean;
    isLong(value: any): boolean;
    isBoolean(value: any): boolean;
    isArray(value: any): boolean;
    isObject(value: any): boolean;
    replace(value: any): any;
    contains(value: any): any;
}
interface SwaggerXhrRequestDataItem {
    name: string;
    type: string;
    format: string;
    items: any;
    maximun: number;
    minimum: number;
    maxLength: number;
    minLength: number;
    pattern: string;
    maxItems: number;
    minItems: number;
    uniqueItems: boolean;
    multipleOf: number;
    exclusiveMaximum: boolean;
    exclusiveMinimum: boolean;
    collectionFormat: string;
    allowEmptyValue: boolean;
}
interface SwaggerXhrRequestData {
    headers: any;
    params: any;
    paths: any;
    query: any;
    formData: any;
    original: any;
}
interface SwaggerXhrRequest {
    uri: string;
    data: SwaggerXhrRequestData;
}
