<template>
  <Row type="flex" justify="center" style="width: 100%; margin: .5rem 0;">
    <Page show-total show-elevator show-sizer
          :total="localTotal"
          :current="localCurrent"
          :page-size="localPageSize"
          :placement="placement"
          @on-change="pageChange"
          @on-page-size-change="pageSizeChange"
          style="display: inline-block;"></Page>
  </Row>
</template>

<script>
  export default {
    name: "Paging",
    props: {
      current: {
        type: Number,
        default: 1,
        required: false
      },
      pageSize: {
        type: Number,
        default: 10,
        required: false
      },
      total: {
        type: Number,
        default: 1,
        required: false
      },
      placement: {
        type: String,
        default: "top",
        required: false
      },
      pageSizeOpts: {
        type: Array,
        default() {
          return [ 10, 30, 50, 70, 90 ];
        },
        required: false
      }
    },
    data() {
      return {
        localTotal: this.total,
        localCurrent: this.current,
        localPageSize: this.pageSize,
      };
    },
    watch: {
      total( val ) {
        this.localTotal = val;
      }
    },
    methods: {
      pageChange( page ) {
        this.localCurrent = page;
        this.$emit( "on-change", this.getCursors() );
      },
      // 更改页大小时 localCurrent 会被重置为 1, 可能是组件给刷新了?
      // 干脆自己设置
      pageSizeChange( pageSize ) {
        this.localCurrent = 1;
        this.localPageSize = pageSize;
        this.$emit( "on-change", this.getCursors() );
      },
      init( details ) {
        if ( !details ) {
          return;
        }

        if ( details.page ) {
          this.localCurrent = details.page;
        }

        if ( details.size ) {
          this.localPageSize = details.size;
        }
      },
      reset() {
        this.localCurrent = 1;
        this.localPageSize = 10;
      },
      // 用于后台请求的方法
      getCursors() {
        return {
          beginRow: ( this.localCurrent - 1 ) * this.localPageSize,
          row: this.localPageSize
        };
      },
      // 用于前端更新 url 的方法
      getPagingDetails() {
        return {
          page: this.localCurrent,
          size: this.localPageSize
        }
      }
    }
  }
</script>