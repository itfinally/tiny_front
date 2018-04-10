<script>
  import { GLOBAL_EVENT_EMITTER, UPDATE_TAB } from "@/tiny/support/commons";

  export default {
    name: "BasicPage",
    data() {
      return {
        metadata: {
          routerPath: "",
          path: ""
        },
        entityStatus: [ {
          status: 1,
          name: "正常"
        }, {
          status: -1,
          name: "已删除"
        } ]
      };
    },
    methods: {
      castMillisToString( millis ) {
        let specifiedTime = new Date( millis ),
          year = specifiedTime.getFullYear(),
          mouth = specifiedTime.getMonth() + 1,
          day = specifiedTime.getDate(),
          hour = specifiedTime.getHours(),
          minutes = specifiedTime.getMinutes(),
          seconds = specifiedTime.getSeconds(),

          date = `${year}/${mouth < 9 ? "0" + mouth : mouth}/${day < 9 ? "0" + day : day}`,
          time = `${hour < 9 ? "0" + hour : hour}:${minutes < 9 ? "0" + minutes : minutes}:${seconds < 9 ? "0" + seconds : seconds}`;

        return `${date} ${time}`;
      },
      getRouterPath() {
        let metadata = this.metadata;

        if ( "" === metadata.routerPath ) {
          let currentPath = this.$route.path,
            matched = this.$route.matched;

          matched.some( matcher => {
            let isMatch = matcher.regex.test( currentPath );
            if ( isMatch ) {
              metadata.routerPath = matcher.path;
            }

            return isMatch;
          } );

          if ( "" === metadata.routerPath ) {
            throw new IllegalStateException( "Matched path is not found." );
          }
        }

        return metadata.routerPath;
      },
      updatePath( path ) {
        if ( this.metadata.path === path ) {
          return;
        }

        let args = [ this.metadata.path, path, this.getRouterPath() ];

        if ( !GLOBAL_EVENT_EMITTER.emit( UPDATE_TAB, ...args ) ) {
          GLOBAL_EVENT_EMITTER.delayEmit( UPDATE_TAB, ...args );
        }

        this.$router.replace( path );
        this.metadata.path = path;
      }
    }
  }
</script>