<script>
    import { GLOBAL_EVENT_EMITTER, UPDATE_MENU } from "@/admin/tools/constant";
    import { CoreUtils } from "@/core";

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
            }
        }
    }
</script>