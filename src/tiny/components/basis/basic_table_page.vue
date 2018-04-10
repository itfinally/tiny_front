<script>
  import BasicPage from "@/tiny/components/basis/basic_page";
  import { CLOSE_MASK, GLOBAL_EVENT_EMITTER, OPEN_MASK } from "@/tiny/support/commons";
  import { EntityStatus, ResponseStatus } from "@/tiny/support/status";

  // 该组件是针对 IView 的 table 而编写的父组件
  export default {
    extends: BasicPage,
    name: "BasicTablePage",
    methods: {
      updatePath( conditions, pageData ) {
        // Url must contain the 'metadata' parameter name
        let routerPath = this.getRouterPath();
        if ( !/\/:metadata\?$/.test( routerPath ) ) {
          throw IllegalStateException( "Router require parameter of ':metadata'." );
        }

        let metadata = encodeURIComponent( JSON.stringify( [ conditions, pageData ] ) ),
          newPath = routerPath.replace( /\/(:metadata\?)$/, ( match, key ) => match.replace( key, metadata ) );

        // 通过 call 来调用被混合的组件的方法, 就像调用父类方法一样
        BasicPage.methods.updatePath.call( this, newPath );
      },
      // 这个函数是针对 IView 的 table 控件做单条数据的删除/恢复操作
      // row     table 回传的某行数据
      // request 某个请求函数, 返回值必须是个 Promise
      async removeOrRecoverRow( row, request ) {
        let tables = this.tables;
        tables.loading = true;

        try {
          let response,
            updateStatus = status => {
              row._status = status;
              row.status = EntityStatus.getNameByStatus( status );

              tables.loading = false;
              this.$Message.success( { content: "更新成功" } );
            };

          switch ( row._status ) {
            case EntityStatus.NORMAL.status:
              response = await request();
              if ( response.data.code === ResponseStatus.SUCCESS.code ) {
                updateStatus( EntityStatus.DELETE.status );
                row.updateTime = row.deleteTime = this.castMillisToString( Date.now() );

              } else {
                this.$Message.error( { content: `更新失败, ${response.data.message}` } );
              }

              return;

            case EntityStatus.DELETE.status:
              response = await request();
              if ( response.data.code === ResponseStatus.SUCCESS.code ) {
                updateStatus( EntityStatus.NORMAL.status );
                row.updateTime = this.castMillisToString( Date.now() );
                row.deleteTime = -1;

              } else {
                this.$Message.error( { content: `更新失败, ${response.data.message}` } );
              }

              return;

            default:
              console.error( "Row require define property of '_status'." )
          }

        } catch ( ignore ) {
        }

        tables.loading = false;
        this.$Message.error( { content: "更新失败" } );
      },
      async removeAllRow( rows, request ) {
        if ( rows.length <= 0 ) {
          this.$Message.warning( { content: "没有需要删除的数据" } );
          return;
        }

        GLOBAL_EVENT_EMITTER.emit( OPEN_MASK );

        let tables = this.tables, now = this.castMillisToString( Date.now() );

        tables.loading = true;

        try {
          let response = await request();
          if ( response.data.code === ResponseStatus.SUCCESS.code ) {
            rows.forEach( item => {
              item.updateTime = item.deleteTime = now;
              item._status = EntityStatus.DELETE.status;
              item.status = EntityStatus.getNameByStatus( item._status );
            } );

            tables.loading = false;
            this.$Message.success( { content: "更新成功" } );

          } else {
            this.$Message.error( { content: `更新失败, ${response.data.message}` } );
          }

          GLOBAL_EVENT_EMITTER.emit( CLOSE_MASK );
          return;

        } catch ( ignore ) {
        }

        tables.loading = false;
        GLOBAL_EVENT_EMITTER.emit( CLOSE_MASK );
        this.$Message.error( { content: "更新失败" } );
      },
      async recoverAllRow( rows, request ) {
        if ( rows.length <= 0 ) {
          this.$Message.warning( { content: "没有需要恢复的数据" } );
          return;
        }

        GLOBAL_EVENT_EMITTER.emit( OPEN_MASK );

        let tables = this.tables, now = this.castMillisToString( Date.now() );

        tables.loading = true;

        try {
          let response = await request();
          if ( response.data.code === ResponseStatus.SUCCESS.code ) {
            rows.forEach( item => {
              item.deleteTime = -1;
              item.updateTime = now;
              item._status = EntityStatus.NORMAL.status;
              item.status = EntityStatus.getNameByStatus( item._status );
            } );

            tables.loading = false;
            this.$Message.success( { content: "更新成功" } );

          } else {
            this.$Message.error( { content: `更新失败, ${response.data.message}` } );
          }

          GLOBAL_EVENT_EMITTER.emit( CLOSE_MASK );
          return;

        } catch ( ignore ) {
        }

        tables.loading = false;
        GLOBAL_EVENT_EMITTER.emit( CLOSE_MASK );
        this.$Message.error( { content: "更新失败" } );
      }
    }
  };
</script>