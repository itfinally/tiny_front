let login = ( r => require.ensure( [], () => r( require( "@admin/view/index/login.vue" ) ), "index" ) ),
    index = ( r => require.ensure( [], () => r( require( "@admin/view/index/index.vue" ) ), "index" ) ),

    // testing page
    test = ( r => require.ensure( [], () => r( require( "@admin/view/index/test.vue" ) ), "index" ) ),

    // authentication
    menuManager = ( r => require.ensure( [], () => r( require( "@admin/view/authentication/menu_manager.vue" ) ), "authentication" ) ),
    permission = ( r => require.ensure( [], () => r( require( "@admin/view/authentication/permission.vue" ) ), "authentication" ) );

function prefixWith( prefix, routers ) {
    return routers.map( router => {
        router.path = `${prefix}/${router.path}`.replace( /\/{2,}/g, "/" );
        return router;
    } );
}

export default [ {
    "path": "/",
    "redirect": "/login"
}, {
    "path": "/login",
    "component": login
}, {
    "path": "/test",
    "component": test
}, {
    "path": "/index",
    "component": index,
    "children": [
        ...prefixWith( "auth", [ {
            "path": "permission",
            "component": permission
        }, {
            "path": "menu_manager",
            "component": menuManager
        } ] )
    ]
} ];