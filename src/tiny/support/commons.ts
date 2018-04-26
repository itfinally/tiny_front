import { EventEmitter, HashMap, Map } from "jcdt";

export let GLOBAL_CACHE: Map<string, any> = new HashMap();
export let GLOBAL_EVENT_EMITTER: EventEmitter = new EventEmitter();

let devAddress = "http://127.0.0.1:8080";
export let address = devAddress;

// cache key
export let VUE_KEY = "vue";
export let ROUTER_KEY = "router";
export let MENU_ITEMS = "menu-items";
export let USER_PERMISSIONS = "user-permission";
export let USER_ROLES = "user-roles";

// login flag
export let TOKEN = "token";
export let IS_RE_LOGIN = "is-reLogin";

// event name
export let MENU_INITIALIZE = "menu-initialize";         // -> args: (menus: Map<MenuId, Menu>)
export let FRAME_SCROLL = "frame-scroll";               // -> args: (direct: String [ 'down' or 'up' ])
export let OPEN_MASK = "open-mask";                     // -> args: (message: String)
export let CLOSE_MASK = "close-mask";                   // -> no args
export let UPDATE_TAB = "update-tab";                   // -> args: (vue instance)
export let SECURITY_INITIALIZE = "security-initialize"; // -> no args