let login = ( r => require.ensure( [], () => r( require( "@admin/view/index/login.vue" ) ), "index" ) ),
    index = ( r => require.ensure( [], () => r( require( "@admin/view/index/index.vue" ) ), "index" ) ),

    // testing page
    test = ( r => require.ensure( [], () => r( require( "@admin/view/index/test.vue" ) ), "index" ) ),

    // authentication
    menuManager = ( r => require.ensure( [], () => r( require( "@admin/view/authentication/menu_manager.vue" ) ), "authentication" ) ),
    permission = ( r => require.ensure( [], () => r( require( "@admin/view/authentication/permission.vue" ) ), "authentication" ) ),
    user = ( r => require.ensure( [], () => r( require( "@admin/view/authentication/user.vue" ) ), "authentication" ) ),
    role = ( r => require.ensure( [], () => r( require( "@admin/view/authentication/role.vue" ) ), "authentication" ) );

function prefixWith( prefix, routers ) {
    routers.forEach( router => router.path = `${prefix}/${router.path}`.replace( /\/{2,}/g, "/" ) );
    return routers;
}

export default [ {
    "path": "/",
    "redirect": "/login"
}, {
    "path": "/login/:test?",
    "component": login
}, {
    "path": "/test",
    "component": test
}, {
    "path": "/index",
    "component": index,
    "children": [
        ...prefixWith( "auth", [ {
            "path": "permission/:metadata?",
            "component": permission
        }, {
            "path": "menu_manager",
            "component": menuManager
        }, {
            "path": "user/:metadata?",
            "component": user
        }, {
            "path": "role/:metadata?",
            "component": role
        } ] )
    ]
} ];