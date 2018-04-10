<template>
  <Row type="flex" justify="center" style="width: 100%; margin: .5rem 0;">
    <Page show-total show-elevator show-sizer
          :total="this.total"
          :current="this.current"
          :page-size="this.pageSize"
          :placement="this.placement"
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
      pageSize: {
        type: Number,
        default: 10,
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
    methods: {
      pageChange( page ) {
        this.$emit( "on-change", page, this.pageSize );
      },
      pageSizeChange( pageSize ) {
        this.$emit( "on-change", this.current, pageSize );
      },
      getPageData() {
        return {
          page: this.current - 1,
          size: this.pageSize
        };
      },
      init( pageData ) {
        if ( !pageData ) {
          return;
        }

        if ( pageData.page ) {
          this.current = pageData.page;
        }

        if ( pageData.size ) {
          this.pageSize = pageData.size;
        }
      }
    }
  }
</script>