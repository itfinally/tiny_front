<script>
  export default {
    name: "basic_component",
    data() {
      return {
        entityStatus: [ {
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
    }
  }
</script>