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

export async function authentication( account: string, password: String, validCode?: string,
                                      successFunc = () => null, failFunc = () => null ) {
    let baseContent = `${account}:${password}`,

        response: Response = await fetchClient( `${REQUEST_ADDRESS}/verifies/login`, {
            "method": "POST",
            "headers": {
                "Authorization": `Basic ${CoreUtils.base64Encoder( baseContent )}`
            },
            "body": `validCode=${validCode}`

        } );

    let content: any = await response.json();

    if ( !response.ok ) {
        GLOBAL_CACHE.get( VUE_KEY ).$Message.error( { "content": "登陆失败, 请查看控制台了解更多信息" } );
        console.warn( content );
        return;
    }

    if ( content.statusCode !== ResponseStatusEnum.SUCCESS.statusCode ) {
        GLOBAL_CACHE.get( VUE_KEY ).$Message.error( { "content": `登录失败, ${content.message}` } );
        failFunc();
        return;
    }

    // save token
    localStorage.setItem( TOKEN, content.result );

    // go back if reLogin is true
    if ( GLOBAL_CACHE.get( IS_RE_LOGIN ) ) {
        GLOBAL_CACHE.remove( IS_RE_LOGIN );
        GLOBAL_CACHE.get( ROUTER_KEY ).go( -1 );
        return;
    }

    successFunc();
    GLOBAL_CACHE.get( ROUTER_KEY ).replace( { "path": "/index" } );
}


/// Http client declare

@ResponseBody()
@RequestMapping( "/menu" )
class MenuClient {

    @Args( "name", "isLeaf" )
    @PostMapping( "/added_root_menu" )
    public addRootMenu( name: string, isLeaf: boolean ): Promise<any> {
        return <any>null;
    }

    @PostMapping( "/added_menu" )
    @Args( "parentId", "name", "path", "isLeaf" )
    public addMenu( parentId: string, name: string, path: string, isLeaf: boolean ): Promise<any> {
        return <any>null;
    }

    @Args( "itemId" )
    @PostMapping( "/remove_menu_item" )
    public removeMenuItem( itemId: string ): Promise<any> {
        return <any>null;
    }

    @Args( "itemIds" )
    @RequestBody( "itemIds" )
    @PostMapping( "/remove_multi_menu_item" )
    public removeMultiMenuItem( itemIds: string[] ): Promise<any> {
        return <any>null;
    }

    @Args( "itemId" )
    @PostMapping( "/recover_menu_item" )
    public recoverMenuItem( itemId: string ): Promise<any> {
        return <any>null;
    }

    @Args( "itemIds" )
    @RequestBody( "itemIds" )
    @PostMapping( "/recover_menu_multi_item" )
    public recoverMenuMultiItem( itemIds: string[] ): Promise<any> {
        return <any>null;
    }

    @Args( "menuId", "name", "path" )
    @PostMapping( "/update_menu" )
    public updateMenu( menuId: string, name: string, path: string ): Promise<any> {
        return <any>null;
    }

    @GetMapping( "/get_menu_tree" )
    public getMenuTree(): Promise<any> {
        return <any>null;
    }
}

@ResponseBody()
@RequestMapping( "/menu_role" )
class MenuRoleClient {

    @Args( "menuId" )
    @GetMapping( "/query_menu_item_roles/:menuId" )
    public queryMenuItemRoles( menuId: string ): Promise<any> {
        return <any>null;
    }

    @Args( "menuId" )
    @GetMapping( "/query_available_role/:menuId" )
    public queryAvailableRole( menuId: string ): Promise<any> {
        return <any>null;
    }

    @RequestBody( "roleIds" )
    @Args( "menuItemId", "roleIds" )
    @PostMapping( "/add_role_menu/:menuItemId" )
    public addRoleMenu( menuItemId: string, roleIds: string[] ): Promise<any> {
        return <any>null;
    }

    @RequestBody( "roleIds" )
    @Args( "menuItemId", "roleIds" )
    @PostMapping( "/remove_role_menu/:menuItemId" )
    public removeRoleMenu( menuItemId: string, roleIds: string[] ): Promise<any> {
        return <any>null;
    }
}

@ResponseBody()
@RequestMapping( "/authorization" )
class AuthorizationClient {

    @Args( "name", "description" )
    @PostMapping( "/add_permission" )
    public addPermission( name: string, description: string ): Promise<any> {
        return <any>null;
    }

    @PostMapping( "/add_role" )
    @Args( "name", "description" )
    public addRole( name: string, description: string ): Promise<any> {
        return <any>null;
    }

    @RequestBody( "roleIds" )
    @Args( "authorityId", "roleIds" )
    @PostMapping( "/grant_role_to/:authorityId" )
    public grantRoleTo( authorityId: string, roleIds: string[] ): Promise<any> {
        return <any>null;
    }

    @RequestBody( "permissionIds" )
    @Args( "roleId", "permissionIds" )
    @PostMapping( "/grant_permission_to/:roleId" )
    public grantPermissionTo( roleId: string, permissionIds: string[] ): Promise<any> {
        return <any>null;
    }
}

@ResponseBody()
@RequestMapping( "/user" )
class UserDetailClient {
    @Args( "createStartTime", "createEndingTime", "updateStartTime", "updateEndingTime", "status", "nickname", "id", "page", "row" )
    @PostMapping( "/query_by_multi_condition" )
    public queryByMultiCondition( createStartTime: number, createEndingTime: number,
                                  updateStartTime: number, updateEndingTime: number,
                                  status: number, nickname: string, id: string,
                                  page: number, row: number ): Promise<any> {
        return <any>null;
    }

    @Args( "createStartTime", "createEndingTime", "updateStartTime", "updateEndingTime", "status", "nickname", "id" )
    @PostMapping( "/count_by_multi_condition" )
    public countByMultiCondition( createStartTime: number, createEndingTime: number,
                                  updateStartTime: number, updateEndingTime: number,
                                  status: number, nickname: string, id: string ): Promise<any> {
        return <any>null;
    }

    @Args( "id", "status", "name" )
    @PostMapping( "/update_user_detail" )
    public updateUserDetail( id: string, status: number, name: string ): Promise<any> {
        return <any>null;
    }

    @RequestBody( "userIds" )
    @Args( "userIds", "status" )
    @PostMapping( "/update_user_status/:status" )
    public updateUserStatus( userIds: string[], status: number ): Promise<any> {
        return <any>null;
    }

    @Args( "user" )
    @PostMapping( "/register" )
    public register( user: string ): Promise<any> {
        return <any>null;
    }

    @RequestBody( "roleIds" )
    @Args( "userId", "roleIds" )
    @PostMapping( "/grant_roles_to/:userId" )
    public grantRolesTo( userId: string, roleIds: string[] ): Promise<any> {
        return <any>null;
    }
}

@ResponseBody()
@RequestMapping( "/permission" )
class PermissionClient {

    @Args( "createStartTime", "createEndingTime", "updateStartTime", "updateEndingTime", "status", "id", "page", "row" )
    @PostMapping( "/query_by_multi_condition" )
    public queryByMultiCondition( createStartTime: number, createEndingTime: number, updateStartTime: number, updateEndingTime: number,
                                  status: number, id: string, page: number, row: number ): Promise<any> {
        return <any>null;
    }

    @Args( "createStartTime", "createEndingTime", "updateStartTime", "updateEndingTime", "status", "id" )
    @PostMapping( "/count_by_multi_condition" )
    public countByMultiCondition( createStartTime: number, createEndingTime: number, updateStartTime: number, updateEndingTime: number,
                                  status: number, id: string ): Promise<any> {
        return <any>null;
    }

    @Args( "id", "name", "description", "status" )
    @PostMapping( "/update_permission_detail" )
    public updatePermissionDetail( id: string, name: string, description: string, status: number ): Promise<any> {
        return <any>null;
    }

    @RequestBody( "ids" )
    @Args( "ids", "status" )
    @PostMapping( "/update_permission_status/:status" )
    public updatePermissionStatus( permissionIds: string[], status: number ): Promise<any> {
        return <any>null;
    }

    @GetMapping( "/get_permissions" )
    public getPermissions(): Promise<any> {
        return <any>null;
    }

    @Args( "roleId" )
    @GetMapping( "/get_specific_role_permissions/:roleId" )
    public getSpecificRolePermissions( roleId: string ) : Promise<any> {
        return <any>null;
    }
}

@ResponseBody()
@RequestMapping( "/role" )
class RoleClient {
    @Args( "createStartTime", "createEndingTime", "updateStartTime", "updateEndingTime", "status", "id", "page", "row" )
    @PostMapping( "/query_by_multi_condition" )
    public queryByMultiCondition( createStartTime: number, createEndingTime: number, updateStartTime: number, updateEndingTime: number,
                                  status: number, id: string, page: number, row: number ): Promise<any> {
        return <any>null;
    }

    @Args( "createStartTime", "createEndingTime", "updateStartTime", "updateEndingTime", "status", "id" )
    @PostMapping( "/count_by_multi_condition" )
    public countByMultiCondition( createStartTime: number, createEndingTime: number, updateStartTime: number, updateEndingTime: number,
                                  status: number, id: string ): Promise<any> {
        return <any>null;
    }

    @Args( "id", "name", "description", "status" )
    @PostMapping( "/update_role_detail" )
    public updateRoleDetail( id: string, name: string, description: string, status: number ): Promise<any> {
        return <any>null;
    }

    @RequestBody( "ids" )
    @Args( "ids", "status" )
    @PostMapping( "/update_role_status/:status" )
    public updateRoleStatus( roleIds: string[], status: number ): Promise<any> {
        return <any>null;
    }

    @RequestBody( "permissionIds" )
    @Args( "roleId", "permissionIds" )
    @PostMapping( "/grant_permission_to/:roleId" )
    public grantPermissionsTo( roleId: string, permissionIds: string[] ): Promise<any> {
        return <any>null;
    }

    @GetMapping( "/get_roles" )
    public getRoles(): Promise<any> {
        return <any>null;
    }

    @Args( "userId" )
    @GetMapping( "/get_specific_user_roles/:userId" )
    public getSpecificUserRoles( userId: string ): Promise<any> {
        return <any>null;
    }
}

let
    menuClient: MenuClient = retrofit.create( MenuClient ),
    menuRoleClient: MenuRoleClient = retrofit.create( MenuRoleClient ),
    userDetailClient: UserDetailClient = retrofit.create( UserDetailClient ),
    authorizationClient: AuthorizationClient = retrofit.create( AuthorizationClient ),
    permissionClient: PermissionClient = retrofit.create( PermissionClient ),
    roleClient: RoleClient = retrofit.create( RoleClient );

export {
    menuClient, menuRoleClient, userDetailClient, authorizationClient,
    permissionClient, roleClient
};