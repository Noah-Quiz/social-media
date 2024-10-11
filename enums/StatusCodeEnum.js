/**
 * @swagger
 * components:
 *   schemas:
 *     StatusCodes:
 *       type: object
 *       properties:
 *         100:
 *           type: string
 *           description: Continue - The server has received the request headers, and the client should proceed to send the request body.
 *         101:
 *           type: string
 *           description: Switching Protocols - The requester has asked the server to switch protocols.
 *         102:
 *           type: string
 *           description: Processing - The server is processing the request but no response is available yet.
 *         103:
 *           type: string
 *           description: Early Hints - The server is sending preliminary information.
 *         200:
 *           type: string
 *           description: OK - The request has succeeded.
 *         201:
 *           type: string
 *           description: Created - The request has succeeded and a new resource has been created.
 *         202:
 *           type: string
 *           description: Accepted - The request has been accepted for processing, but the processing is not yet complete.
 *         203:
 *           type: string
 *           description: Non-Authoritative Information - The server successfully processed the request, but is returning information from a cached copy rather than the original source.
 *         204:
 *           type: string
 *           description: No Content - The server successfully processed the request, but is not returning any content.
 *         205:
 *           type: string
 *           description: Reset Content - The server successfully processed the request, but is requesting the client to reset the document view.
 *         206:
 *           type: string
 *           description: Partial Content - The server is delivering only part of the resource due to a range header sent by the client.
 *         207:
 *           type: string
 *           description: Multi-Status - The message body contains multiple independent response codes.
 *         208:
 *           type: string
 *           description: Already Reported - The members of a DAV binding have already been enumerated in a previous reply to this request.
 *         226:
 *           type: string
 *           description: IM Used - The server has fulfilled a request for the resource, and the response is a representation of the result of one or more instance-manipulations applied to the current instance.
 *         300:
 *           type: string
 *           description: Multiple Choices - Indicates multiple options for the resource that the client may follow.
 *         301:
 *           type: string
 *           description: Moved Permanently - This and all future requests should be directed to the given URI.
 *         302:
 *           type: string
 *           description: Found - The resource resides temporarily under a different URI.
 *         303:
 *           type: string
 *           description: See Other - The response to the request can be found under another URI using the GET method.
 *         304:
 *           type: string
 *           description: Not Modified - Indicates that the resource has not been modified since the last request.
 *         305:
 *           type: string
 *           description: Use Proxy - The requested resource is available only through a proxy, the address for which is provided in the response.
 *         307:
 *           type: string
 *           description: Temporary Redirect - The request should be repeated with another URI, but future requests should still use the original URI.
 *         308:
 *           type: string
 *           description: Permanent Redirect - The request and all future requests should be repeated using another URI.
 *         400:
 *           type: string
 *           description: Bad Request - The server cannot or will not process the request due to a client error.
 *         401:
 *           type: string
 *           description: Unauthorized - Authentication is required and has failed or has not yet been provided.
 *         402:
 *           type: string
 *           description: Payment Required - Reserved for future use.
 *         403:
 *           type: string
 *           description: Forbidden - The request was valid, but the server is refusing action.
 *         404:
 *           type: string
 *           description: Not Found - The requested resource could not be found.
 *         405:
 *           type: string
 *           description: Method Not Allowed - A request method is not supported for the requested resource.
 *         406:
 *           type: string
 *           description: Not Acceptable - The requested resource is only capable of generating content not acceptable according to the Accept headers sent in the request.
 *         407:
 *           type: string
 *           description: Proxy Authentication Required - The client must first authenticate itself with the proxy.
 *         408:
 *           type: string
 *           description: Request Timeout - The server timed out waiting for the request.
 *         409:
 *           type: string
 *           description: Conflict - The request could not be completed due to a conflict with the current state of the target resource.
 *         410:
 *           type: string
 *           description: Gone - The resource requested is no longer available and will not be available again.
 *         411:
 *           type: string
 *           description: Length Required - The server refuses to accept the request without a defined Content-Length.
 *         412:
 *           type: string
 *           description: Precondition Failed - The server does not meet one of the preconditions that the requester put on the request.
 *         413:
 *           type: string
 *           description: Payload Too Large - The request is larger than the server is willing or able to process.
 *         414:
 *           type: string
 *           description: URI Too Long - The URI provided was too long for the server to process.
 *         415:
 *           type: string
 *           description: Unsupported Media Type - The request entity has a media type which the server or resource does not support.
 *         416:
 *           type: string
 *           description: Range Not Satisfiable - The client has asked for a portion of the file, but the server cannot supply that portion.
 *         417:
 *           type: string
 *           description: Expectation Failed - The server cannot meet the requirements of the Expect request-header field.
 *         418:
 *           type: string
 *           description: I'm a teapot - Any attempt to instruct a teapot to brew coffee should result in the error "418 I'm a teapot".
 *         421:
 *           type: string
 *           description: Misdirected Request - The request was directed at a server that is not able to produce a response.
 *         422:
 *           type: string
 *           description: Unprocessable Entity - The request was well-formed but was unable to be followed due to semantic errors.
 *         423:
 *           type: string
 *           description: Locked - The resource that is being accessed is locked.
 *         424:
 *           type: string
 *           description: Failed Dependency - The request failed due to failure of a previous request.
 *         425:
 *           type: string
 *           description: Too Early - Indicates that the server is unwilling to risk processing a request that might be replayed.
 *         426:
 *           type: string
 *           description: Upgrade Required - The client should switch to a different protocol.
 *         428:
 *           type: string
 *           description: Precondition Required - The origin server requires the request to be conditional.
 *         429:
 *           type: string
 *           description: Too Many Requests - The user has sent too many requests in a given amount of time.
 *         431:
 *           type: string
 *           description: Request Header Fields Too Large - The server is unwilling to process the request because either an individual header field, or all the header fields collectively, are too large.
 *         451:
 *           type: string
 *           description: Unavailable For Legal Reasons - The user requests an illegal resource, such as a web page censored by a government.
 *         500:
 *           type: string
 *           description: Internal Server Error - A generic error message, given when an unexpected condition was encountered.
 *         501:
 *           type: string
 *           description: Not Implemented - The server does not support the functionality required to fulfill the request.
 *         502:
 *           type: string
 *           description: Bad Gateway - The server was acting as a gateway or proxy and received an invalid response from the upstream server.
 *         503:
 *           type: string
 *           description: Service Unavailable - The server is currently unable to handle the request due to temporary overload or scheduled maintenance.
 *         504:
 *           type: string
 *           description: Gateway Timeout - The server was acting as a gateway or proxy and did not receive a timely response from the upstream server.
 *         505:
 *           type: string
 *           description: HTTP Version Not Supported - The server does not support the HTTP protocol version that was used in the request message.
 *         506:
 *           type: string
 *           description: "Variant Also Negotiates - The server has an internal configuration error: transparent content negotiation for the request results in a circular reference."
 *         507:
 *           type: string
 *           description: Insufficient Storage - The server is unable to store the representation needed to complete the request.
 *         508:
 *           type: string
 *           description: Loop Detected - The server detected an infinite loop while processing a request.
 *         510:
 *           type: string
 *           description: Not Extended - Further extensions to the request are required for the server to fulfill it.
 *         511:
 *           type: string
 *           description: Network Authentication Required - The client needs to authenticate to gain network access.
 */

const StatusCodeEnums = {
  Continue_100: 100,
  SwitchingProtocols_101: 101,
  Processing_102: 102,
  EarlyHints_103: 103,

  OK_200: 200,
  Created_201: 201,
  Accepted_202: 202,
  NonAuthoritativeInformation_203: 203,
  NoContent_204: 204,
  ResetContent_205: 205,
  PartialContent_206: 206,
  MultiStatus_207: 207,
  AlreadyReported_208: 208,
  IMUsed_226: 226,

  MultipleChoice_300: 300,
  MovedPermanently_301: 301,
  Found_302: 302,
  SeeOther_303: 303,
  NotModified_304: 304,
  UseProxy_305: 305,
  TemporaryRedirect_307: 307,
  PermanentRedirect_308: 308,

  BadRequest_400: 400,
  Unauthorized_401: 401,
  PaymentRequired_402: 402,
  Forbidden_403: 403,
  NotFound_404: 404,
  MethodNotAllowed_405: 405,
  NotAcceptable_406: 406,
  ProxyAuthenticationRequired_407: 407,
  RequestTimeout_408: 408,
  Conflict_409: 409,
  Gone_410: 410,
  LengthRequired_411: 411,
  PreconditionFailed_412: 412,
  PayloadTooLarge_413: 413,
  URITooLong_414: 414,
  UnsupportedMediaType_415: 415,
  RangeNotSatisfiable_416: 416,
  ExpectationFailed_417: 417,
  ImATeapot_418: 418,
  MisdirectedRequest_421: 421,
  UnprocessableEntity_422: 422,
  Locked_423: 423,
  FailedDependency_424: 424,
  TooEarly_425: 425,
  UpgradeRequired_426: 426,
  PreconditionRequired_428: 428,
  TooManyRequests_429: 429,
  RequestHeaderFieldsTooLarge_431: 431,
  UnavailableForLegalReasons_451: 451,

  InternalServerError_500: 500,
  NotImplemented_501: 501,
  BadGateway_502: 502,
  ServiceUnavailable_503: 503,
  GatewayTimeout_504: 504,
  HTTPVersionNotSupported_505: 505,
  VariantAlsoNegotiates_506: 506,
  InsufficientStorage_507: 507,
  LoopDetected_508: 508,
  NotExtended_510: 510,
  NetworkAuthenticationRequired_511: 511,
};

module.exports = StatusCodeEnums;
