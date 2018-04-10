<template>
  <Modal v-model="open" :title="title" :closable="false" width="720px" @on-ok="ok" @on-cancel="cancel">
    <DataTransfer ref="transfer" :data="data" :target-keys="targetKeys" :titles="metadata"
                  :list-style="{width: '19.75rem', height: '18rem'}"/>
  </Modal>
</template>

<script>
  import DataTransfer from "@/tiny/components/data_transfer";

  export default {
    name: "TransferModal",
    components: { DataTransfer },
    props: {
      metadata: {
        type: Array,
        default() {
          return [ "源列表", "目的列表" ];
        }
      },
      value: {
        type: Boolean
      },
      title: {
        default: "",
        type: String,
      },
      data: {
        type: Array,
        required: true
      },
      targetKeys: {
        type: Array,
        required: true
      }
    },
    watch: {
      value( isOpen ) {
        if ( isOpen ) {
          // 每次打开 modal 前都要清空上次的记录
          this.$refs[ "transfer" ].clear();
        }

        this.open = isOpen;
      }
    },
    data() {
      return {
        open: false
      };
    },
    methods: {
      getRemoved() {
        return this.$refs[ "transfer" ].getRemoved();
      },
      getAdded() {
        return this.$refs[ "transfer" ].getAdded();
      },
      ok() {
        this.$emit( "on-ok", this.getAdded(), this.getRemoved() );
        this.open = false;
      },
      cancel() {
        this.$emit( "on-cancel" );
        this.open = false;
      },
      hasChange() {
        return this.$refs[ "transfer" ].hasChange();
      }
    }
  };
</script>