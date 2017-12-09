import { decorators } from "./component";

import Args = decorators.Args;
import Header = decorators.Header;
import Headers = decorators.Headers;
import RequestBody = decorators.RequestBody;
import ResponseBody = decorators.ResponseBody;

import MultiPart = decorators.MultiPart;
import PutMapping = decorators.PutMapping;
import GetMapping = decorators.GetMapping;
import PostMapping = decorators.PostMapping;
import DeleteMapping = decorators.DeleteMapping;
import RequestMapping = decorators.RequestMapping;

export { FetchRetrofit } from "./component";
export { fetchClient, retrofitFetchClient } from "./fetch";

export {
    Header, Headers, RequestMapping, RequestBody, ResponseBody, Args,
    MultiPart, PutMapping, GetMapping, PostMapping, DeleteMapping
};

export {
    DataType, Interceptor, RetrofitRequest,
    RetrofitResponse, RequestMethod, RequestHeader
} from "./support";