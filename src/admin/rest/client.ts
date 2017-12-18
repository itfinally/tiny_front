import "ts-promise";

import {
    Args,
    GetMapping,
    PostMapping,
    RequestMapping,
    fetchClient,
    ResponseBody,
    RequestBody
} from "@/retrofitjs";

import retrofit from "./retrofit";
import { CoreUtils } from "@core/lang";
import {
    GLOBAL_CACHE,
    ResponseStatusEnum,
    IS_RE_LOGIN,
    ROUTER_KEY,
    TOKEN,
    VUE_KEY,
    REQUEST_ADDRESS
} from "@admin/tools/constant";

export function authentication( account: string, password: String, validCode?: string,
                                successFunc = () => null, failFunc = () => null ) {
    let baseContent = `${account}:${password}`;

    fetchClient( `${REQUEST_ADDRESS}/verifies/login`, {
        "method": "POST",
        "headers": {
            "Authorization": `Basic ${CoreUtils.base64Encoder( baseContent )}`
        },
        "body": `validCode=${validCode}`

    } ).then( ( response: Response ) => response.ok ? response.json() : Promise.reject( response ) )
        .then( ( response: any ) => {
            if ( response.statusCode !== ResponseStatusEnum.SUCCESS.statusCode ) {
                GLOBAL_CACHE.get( VUE_KEY ).$Message.error( { "content": `登录失败, ${response.message}` } );
                failFunc();
                return;
            }

            // save token
            localStorage.setItem( TOKEN, response.result );

            // go back if reLogin is true
            if ( GLOBAL_CACHE.get( IS_RE_LOGIN ) ) {
                GLOBAL_CACHE.remove( IS_RE_LOGIN );
                GLOBAL_CACHE.get( ROUTER_KEY ).go( -1 );
                return;
            }

            successFunc();
            GLOBAL_CACHE.get( ROUTER_KEY ).replace( { "path": "/index" } );

        } ).catch( ( response: Response ) => {
        GLOBAL_CACHE.get( VUE_KEY ).$Message.error( { "content": "登陆失败, 请查看控制台了解更多信息" } );
        response.json().then( response => console.log( response ) );
    } );
}


/// Http client declare


@RequestMapping( "/menu" )
class MenuClient {

    @ResponseBody()
    @Args( "name", "isLeaf" )
    @PostMapping( "/added_root_menu/:name" )
    public addRootMenu( name: string, isLeaf: boolean ): Promise<any> {
        return <any>null;
    }

    @ResponseBody()
    @PostMapping( "/added_menu" )
    @Args( "parentId", "name", "isLeaf" )
    public addMenu( parentId: string, name: string, isLeaf: boolean ): Promise<any> {
        return <any>null;
    }

    @ResponseBody()
    @Args( "itemId" )
    @PostMapping( "/remove_menu_item" )
    public removeMenuItem( itemId: string ): Promise<any> {
        return <any>null;
    }

    @ResponseBody()
    @Args( "itemIds" )
    @RequestBody( "itemIds" )
    @PostMapping( "/remove_multi_menu_item" )
    public removeMultiMenuItem( itemIds: string[] ): Promise<any> {
        return <any>null;
    }

    @ResponseBody()
    @Args( "itemId" )
    @PostMapping( "/recover_menu_item" )
    public recoverMenuItem( itemId: string ): Promise<any> {
        return <any>null;
    }

    @ResponseBody()
    @Args( "itemIds" )
    @RequestBody( "itemIds" )
    @PostMapping( "/recover_menu_multi_item" )
    public recoverMenuMultiItem( itemIds: string[] ): Promise<any> {
        return <any>null;
    }

    @ResponseBody()
    @GetMapping( "/get_menu_tree" )
    public getMenuTree(): Promise<any> {
        return <any>null;
    }

    @ResponseBody()
    @Args( "menuId" )
    @GetMapping( "/query_menu_item_roles/:menuId" )
    public queryMenuItemRoles( menuId: string ): Promise<any> {
        return <any>null;
    }
}

@RequestMapping( "/authorization" )
class AuthorizationClient {

    @ResponseBody()
    @Args( "name", "description" )
    @PostMapping( "/add_permission" )
    public addPermission( name: string, description: string ): Promise<any> {
        return <any>null;
    }

    @ResponseBody()
    @PostMapping( "/add_role" )
    @Args( "name", "description" )
    public addRole( name: string, description: string ): Promise<any> {
        return <any>null;
    }

    @ResponseBody()
    @RequestBody( "roleIds" )
    @Args( "authorityId", "roleIds" )
    @PostMapping( "/grant_role_to/:authorityId" )
    public grantRoleTo( authorityId: string, roleIds: string[] ): Promise<any> {
        return <any>null;
    }

    @ResponseBody()
    @RequestBody( "permissionIds" )
    @Args( "roleId", "permissionIds" )
    @PostMapping( "/grant_permission_to/:roleId" )
    public grantPermissionTo( roleId: string, permissionIds: string[] ): Promise<any> {
        return <any>null;
    }

    @ResponseBody()
    @GetMapping( "/get_roles" )
    public getRoles(): Promise<any> {
        return <any>null;
    }

    @ResponseBody()
    @GetMapping( "/get_permissions" )
    public getPermissions(): Promise<any> {
        return <any>null;
    }

    @ResponseBody()
    @Args( "account" )
    @GetMapping( "/get_user_roles/:account" )
    public getUserRoles( account: string ): Promise<any> {
        return <any>null;
    }
}

export let
    menuClient: MenuClient = retrofit.create( MenuClient ),
    authorizationClient: AuthorizationClient = retrofit.create( AuthorizationClient );