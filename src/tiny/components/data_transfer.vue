<template>
  <Row>
    <Transfer :titles="titles" :data="data" :target-keys="used"
              :list-style="listStyle" @on-change="transfer" :render-format="itemRender"
              :filterable="true" :filter-method="filter"></Transfer>
  </Row>
</template>
<script>
  import { HashSet } from "jcdt";

  export default {
    name: "DataTransfer",
    props: {
      data: {
        type: Array,
        required: true
      },
      targetKeys: {
        type: Array,
        required: true
      },
      listStyle: {
        type: Object,
        default() {
          return {};
        }
      },
      titles: {
        type: Array,
        default() {
          return [ "源列表", "目的列表" ];
        }
      }
    },
    watch: {
      targetKeys( theNew ) {
        this.used = theNew;
      }
    },
    data() {
      return {
        used: [],

        adds: new HashSet(),
        removed: new HashSet(),

        filterMetadata: {
          verifyExp: new RegExp( "" ),
          isEmpty: /^$|^\s+$/,
          verifyString: ""
        }
      };
    },
    methods: {
      transfer( usedKeys, direction, movingKeys ) {
        switch ( direction ) {
          case "left":
            movingKeys.forEach( id => this.adds.contains( id ) ? this.adds.remove( id ) : this.removed.add( id ) );
            break;

          case "right":
            movingKeys.forEach( id => this.removed.contains( id ) ? this.removed.remove( id ) : this.adds.add( id ) );
            break;

          default:
            throw IllegalStateException( `IView given an error direction -> ${direction}` )
        }

        this.used = usedKeys;
      },
      itemRender( item ) {
        return item.label && item.description ? `${item.label} - ${item.description}` : item.label
      },
      filter( item, searchText ) {
        let metadata = this.filterMetadata;

        if ( metadata.isEmpty.test( searchText ) ) {
          return true;
        }

        if ( metadata.verifyString !== searchText ) {
          metadata.verifyExp = new RegExp( searchText );
          metadata.verifyString = searchText;
        }

        if ( item.label && item.description ) {
          return metadata.verifyExp.test( `${item.label} - ${item.description}` );
        }

        if ( item.label || item.description ) {
          return metadata.verifyExp.test( item.label ? item.label : item.description );
        }

        return false;
      },
      getRemoved() {
        return this.removed.toArray();
      },
      getAdded() {
        return this.adds.toArray();
      },
      clear() {
        this.adds.clear();
        this.removed.clear();
      },
      hasChange() {
        return !( this.adds.isEmpty() && this.removed.isEmpty() );
      }
    }
  }
</script>