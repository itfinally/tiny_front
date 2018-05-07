<template>
  <Row>
    <Table v-if="this.data.length > 0" :loading="loading" :columns="finalColumns" :data="this.data"
           @on-selection-change="selectChange" ref="table" size="small"></Table>
    <Row v-if="this.data.length <= 0" type="flex" justify="center" align="middle"
         style="width: 100%; height: 10rem; border: 1px solid rgba(111,117,130,0.51);">
      <h3>暂无数据</h3>
    </Row>
  </Row>
</template>
<script>
  import { HashSet } from "jcdt";
  import BasicComponent from "@/tiny/components/basis/basic_component";

  export default {
    name: "DataTable",
    extends: BasicComponent,
    props: {
      addSelector: {
        type: Boolean,
        default: true,
        required: false
      },
      selectorFixed: {
        type: Boolean,
        default: true,
        required: false
      },
      addMetadata: {
        type: Boolean,
        default: true,
        required: false
      },
      loading: {
        type: Boolean,
        default: false,
        required: false
      },
      columns: {
        type: Array,
        required: true,
      },
      data: {
        type: Array,
        required: true
      }
    },
    data() {
      return {
        tables: {
          rows: [],
          defaultMetadata: [ {
            title: "Id",
            key: "id",
            width: 280
          }, {
            title: "状态",
            key: "status",
            width: 65
          }, {
            title: "创建日期",
            key: "createTime",
            width: 160
          }, {
            title: "更新日期",
            key: "updateTime",
            width: 160
          }, {
            title: "删除日期",
            key: "deleteTime",
            width: 160
          } ]
        }
      };
    },
    computed: {
      finalColumns() {
        let columns = this.columns.slice();
        if ( this.addMetadata ) {
          let metadata = this.tables.defaultMetadata.slice();
          while ( metadata.length > 0 ) {
            columns.unshift( metadata.pop() );
          }
        }

        if ( this.addSelector ) {
          columns.unshift( {
            type: "selection",
            align: "center",
            width: 60
          } );

          if ( this.selectorFixed ) {
            columns[ 0 ].fixed = "left";
          }
        }

        return columns;
      }
    },
    methods: {
      selectChange( rows ) {
        this.tables.rows = rows;
      },
      getAllSelected() {
        let selection = this.tables.rows;
        if ( selection.length <= 0 ) {
          return [];
        }

        let rows = [],
          rowIds = new HashSet(),
          tableDatas = this.data;

        selection.forEach( item => rowIds.add( item.id ) );
        for ( let index = 0, length = tableDatas.length; !rowIds.isEmpty() && index < length; index += 1 ) {
          if ( rowIds.contains( tableDatas[ index ].id ) ) {
            rows.push( tableDatas[ index ] );
          }
        }

        return rows;
      }
    }
  }
</script>