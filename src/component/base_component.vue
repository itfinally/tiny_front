<script>
  import {
    GLOBAL_CACHE, GLOBAL_EVENT_EMITTER, SECURITY_READY, UPDATE_MENU, USER_PERMISSIONS,
    USER_ROLES
  } from "@/tools/constant";
  import { CoreUtils } from "jcdt";

  export default {
    name: "parent",
    data() {
      return {
        url: "",
        oldUrl: "",

        statusList: [ {
          status: 1,
          name: "正常"
        }, {
          status: -1,
          name: "已删除"
        }, {
          status: 0,
          name: "全选"
        } ]
      };
    },
    watch: {
      url( newUrl ) {
        if ( this.oldUrl === this.url ) {
          return;
        }

        if ( !GLOBAL_EVENT_EMITTER.emit( UPDATE_MENU, this.oldUrl, newUrl, this ) ) {
          GLOBAL_EVENT_EMITTER.delayEmit( UPDATE_MENU, this.oldUrl, newUrl, this )
        }

        this.oldUrl = newUrl;
      }
    },
    methods: {
      getThisRouterPath() {
        return this.$router.history.current.path;
      },

      // date component variable is a string type by default,
      // but it will change to a number type when you selected.
      getMillisFromDatePicker( val ) {
        if ( CoreUtils.isNumber( val ) ) {
          return val;
        }

        if ( val instanceof Date ) {
          return val.getTime();
        }

        return 0;
      },

      async isForbidden( permissionName, showTip = false ) {
        if ( !GLOBAL_CACHE.containsKey( USER_PERMISSIONS ) ) {
          await new Promise( resolve => GLOBAL_EVENT_EMITTER.on( SECURITY_READY, () => resolve() ) );
        }

        let permissions = GLOBAL_CACHE.get( USER_PERMISSIONS ),
          hasPermission = permissions.contains( permissionName );

        if ( !hasPermission && showTip ) {
          this.$Message.error( { "content": "权限不足, 拒绝访问" } );
        }

        return !hasPermission;
      },

      async isForbiddenInRole( roleName, showTip = false ) {
        if ( !GLOBAL_CACHE.containsKey( USER_ROLES ) ) {
          await new Promise( resolve => GLOBAL_EVENT_EMITTER.on( SECURITY_READY, () => resolve() ) );
        }

        let role = GLOBAL_CACHE.get( USER_ROLES ),
          hasRole = role.contains( roleName );

        if ( !hasRole && showTip ) {
          this.$Message.error( { "content": "权限不足, 拒绝访问" } );
        }

        return !hasRole;
      },

      async getOwnPermissions() {
        if ( !GLOBAL_CACHE.containsKey( USER_PERMISSIONS ) ) {
          await new Promise( resolve => GLOBAL_EVENT_EMITTER.on( SECURITY_READY, () => resolve() ) );
        }

        return GLOBAL_CACHE.get( USER_PERMISSIONS );
      }
    }
  }
</script>