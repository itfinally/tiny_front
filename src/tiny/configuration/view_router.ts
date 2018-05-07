let errCallback = ( err: any ) => window.console.log( `Loading chunk failed, err => ${err}` );

let login = ( resolve: Function ) => require.ensure( [], require => resolve( require( "@/tiny/view/main/login.vue" ) ), errCallback, "entrance" ),
  console = ( resolve: Function ) => require.ensure( [], require => resolve( require( "@/tiny/view/main/console.vue" ) ), errCallback, "entrance" ),

  permission = ( resolve: Function ) => require.ensure( [], require => resolve( require( "@/tiny/view/authentication/permission.vue" ) ), errCallback, "authentication" ),
  role = ( resolve: Function ) => require.ensure( [], require => resolve( require( "@/tiny/view/authentication/role.vue" ) ), errCallback, "authentication" ),
  department = ( resolve: Function ) => require.ensure( [], require => resolve( require( "@/tiny/view/authentication/department.vue" ) ), errCallback, "authentication" ),
  menu = ( resolve: Function ) => require.ensure( [], require => resolve( require( "@/tiny/view/authentication/menu.vue" ) ), errCallback, "authentication" ),

  accessLog = ( resolve: Function ) => require.ensure( [], require => resolve( require( "@/tiny/view/authentication/access_log.vue" ) ), errCallback, "system" );

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
  }, {
    "path": "access_log/:metadata?",
    "component": accessLog
  } ] )
} ];