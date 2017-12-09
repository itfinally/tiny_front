import { Args, GetMapping, PostMapping, RequestMapping, fetchClient, ResponseBody } from "@retrofitjs/index";

import retrofit from "./retrofit";
import { CoreUtils } from "@core/index";
import { GLOBAL_CACHE } from "@admin/contants";
import { ResponseStatusEnum } from "@admin/tools/enum";
import { IS_RE_LOGIN, ROUTER_KEY, TOKEN, VUE_KEY, REQUEST_ADDRESS } from "@admin/config/cache_key";

export function authentication( account, password, validCode = null, failFunc = () => {
} ) {
    let baseContent = `${account}:${password}`;

    fetchClient( `${REQUEST_ADDRESS}/verifies/login`, {
        "method": "POST",
        "headers": {
            "Authorization": `Basic ${CoreUtils.base64Encoder( baseContent )}`
        },
        "body": `validCode=${validCode}`

    } ).then( response => response.ok ? response.json() : Promise.reject( response ) ).then( response => {
        if ( response.statusCode !== ResponseStatusEnum.SUCCESS.statusCode ) {
            GLOBAL_CACHE.get( VUE_KEY ).$Message.error( { "content": `登录失败, ${response.message}` } );
            failFunc();
            return;
        }

        // save token
        localStorage.setItem( TOKEN, response.result );

        // go back if reLogin is true
        if ( GLOBAL_CACHE.once( IS_RE_LOGIN ) ) {
            GLOBAL_CACHE.get( ROUTER_KEY ).go( -1 );
            return;
        }

        GLOBAL_CACHE.get( ROUTER_KEY ).replace( { "path": "/index" } );

    } ).catch( response => {
        GLOBAL_CACHE.get( VUE_KEY ).$Message.error( { "content": "登陆失败, 请查看控制台了解更多信息" } );
        response.json().then( response => console.log( response ) );
    } );
}

@RequestMapping( "/menu" )
export let menuClient = retrofit.create( class MenuClient {

    @ResponseBody()
    @Args( "name", "isLeaf" )
    @PostMapping( "/added_root_menu" )
    addRootMenu( name, isLeaf ) {
    }

    @ResponseBody()
    @PostMapping( "/added_menu" )
    @Args( "parentId", "name", "isLeaf" )
    addMenu( parentId, name, isLeaf ) {
    }

    @ResponseBody()
    @Args( "itemId" )
    @PostMapping( "/remove_menu_item" )
    removeMenuItem( itemId ) {
    }

    @ResponseBody()
    @Args( "itemIds" )
    @PostMapping( "/remove_multi_menu_item" )
    removeMultiMenuItem( itemIds ) {
    }

    @ResponseBody()
    @GetMapping( "/get_menu_tree" )
    getMenuTree() {
    }
} );