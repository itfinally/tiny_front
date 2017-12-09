let login = ( r => require.ensure( [], () => r( require( "../view/index/login.vue" ) ), "index" ) ),
    index = ( r => require.ensure( [], () => r( require( "../view/index/index.vue" ) ), "index" ) );


export default [ {
    "path": "/",
    "redirect": "/login"
}, {
    "path": "/login",
    "component": login
}, {
    "path": "/index",
    "component": index
} ];