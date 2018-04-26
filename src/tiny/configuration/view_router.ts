let login = ( resolve: Function ) => require.ensure( [], require => resolve( require( "@/tiny/view/main/login.vue" ) ), "entrance" ),
  console = ( resolve: Function ) => require.ensure( [], require => resolve( require( "@/tiny/view/main/console.vue" ) ), "entrance" ),

  permission = ( resolve: Function ) => require.ensure( [], require => resolve( require( "@/tiny/view/authentication/permission.vue" ) ), "authentication" ),
  role = ( resolve: Function ) => require.ensure( [], require => resolve( require( "@/tiny/view/authentication/role.vue" ) ), "authentication" ),
  department = ( resolve: Function ) => require.ensure( [], require => resolve( require( "@/tiny/view/authentication/department.vue" ) ), "authentication" ),
  menu = ( resolve: Function ) => require.ensure( [], require => resolve( require( "@/tiny/view/authentication/menu.vue" ) ), "authentication" );

function prefixWith( prefix: string, routers: any[] ) {
  routers.forEach( router => router.path = `${prefix}/${router.path}`.replace( /\/{2,}/g, "/" ) );
  return routers;
}

export default [ {
  "path": "/",
  "redirect": "/login"
}, {
  "path": "/login",
  "component": login
}, {
  "path": "/console",
  "component": console,

  "children": prefixWith( "security", [ {
    "path": "permission/:metadata?",
    "component": permission
  }, {
    "path": "role/:metadata?",
    "component": role
  }, {
    "path": "department/:metadata?",
    "component": department
  }, {
    "path": "menu",
    "component": menu
  } ] )
} ];