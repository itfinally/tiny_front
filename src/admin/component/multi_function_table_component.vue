<script>
    import parent from "@admin/component/base_component";
    import { CoreUtils, HashMap, Dates } from "@core";
    import { ResponseStatusEnum, DataStatusEnum } from "@admin/tools/constant";
    import { ComponentNotImplementException } from "@admin/tools/exception";

    export default {
        name: "MultiFunctionTableComponent",
        extends: parent,
        methods: {
            async tableInitializer( tableRefName ) {
                let [ page, range, condition ] = await this.getMultiFunctionDetail( tableRefName ),
                    currentParams = this.$router.history.current.params;

                if ( CoreUtils.isNone( currentParams.metadata ) ) {
                    this.beforeQuery( page, range, condition );
                    return;
                }

                let metadata = JSON.parse( currentParams.metadata );
                if ( typeof metadata !== "object" ) {
                    this.beforeQuery( page, range, condition );
                    return;
                }

                // index 2 is condition
                let receptor = this.getCondition( condition ) ? this.getCondition( condition ) : condition;
                Object.keys( metadata[ 2 ] ).forEach( key => {
                    if ( key in receptor ) {
                        receptor[ key ] = metadata[ 2 ][ key ];
                    }
                } );

                [ page, range, condition ] = metadata;
                this.beforeQuery( page, range, condition, true );
            },

            getMultiFunctionDetail( name ) {
                let tableComponent = this.$refs[ name ],
                    request = new Promise( resolve => tableComponent.$once( "table-condition-response",
                        ( page, range, condition ) => resolve( [ page, range, condition ] ) ) );

                tableComponent.$emit( "table-condition-request" );

                return request;
            },

            async refresh( tableRefName ) {
                let [ page, range, condition ] = await this.getMultiFunctionDetail( tableRefName ),
                    customCondition = this.getCondition( condition );

                this.beforeQuery( page, range, customCondition ? customCondition : condition );
            },

            // flag 'isComeFromMetadata' is
            beforeQuery( page, range, condition, isComeFromMetadata = false ) {
                let pureCondition = Object.create( null ),
                    customCondition = this.getCondition( condition );

                // use custom condition if have one.
                if ( customCondition && !isComeFromMetadata ) {
                    condition = customCondition;
                }

                Object.keys( condition ).forEach( key => pureCondition[ key ] =
                    ( condition[ key ] instanceof Date ? condition[ key ].getTime() : condition[ key ] ) );

                // refresh tab
                this.url = this.beforeUrlUpdate( encodeURIComponent( JSON.stringify( [ page, range, pureCondition ] ) ) );

                // refresh router
                this.$router.replace( this.url );
                setTimeout( () => this.query( page, range, condition ), 0 );
            },

            // return custom condition in this method
            getCondition( condition ) {
                return null;
            },

            // return custom url with metadata in this method
            beforeUrlUpdate( expressionMetadata ) {
                throw new ComponentNotImplementException( `component '${this.$router.history.current.path}' is not be implement.` );
            },

            // query data in this method
            query( page, range, condition ) {
                throw new ComponentNotImplementException( `component '${this.$router.history.current.path}' is not be implement.` )
            },

            async changeStatus( row, status, requestCallBack ) {
                let response = ( await requestCallBack() ).body;

                if ( response.statusCode !== ResponseStatusEnum.SUCCESS.statusCode ) {
                    this.$Message.warning( { "content": `${status === DataStatusEnum.DELETE.status ? "删除" : "恢复"}失败` } );
                    return;
                }

                row.status = status;
                row.statusName = DataStatusEnum.getNameByStatus( status );

                row.deleteTime = status !== DataStatusEnum.DELETE.status ? "" :
                    Dates.toLocalDateTimeString( ( Date.now || new Date().getTime )() );

                this.$Message.success( { "content": `${status === DataStatusEnum.DELETE.status ? "删除" : "恢复"}成功` } );
            },

            async removeAll( tableRefName, tableField, selected, requestCallBack ) {
                let response = ( await requestCallBack() ).body;

                if ( response.statusCode !== ResponseStatusEnum.SUCCESS.statusCode ) {
                    this.$Message.warning( { "content": `删除失败 -> ${response.message}` } );

                } else {
                    let data,
                        rows = new HashMap();

                    this.$refs[ tableRefName ][ tableField ].data.map( item => rows.put( item.id, item ) );

                    // only modify by table data rows
                    selected.forEach( item => {
                        data = rows.get( item.id );

                        data.status = DataStatusEnum.DELETE.status;
                        data.statusName = DataStatusEnum.getNameByStatus( data.status );
                        data.deleteTime = Dates.toLocalDateTimeString( ( Date.now || new Date().getTime )() )
                    } );

                    this.$Message.success( { "content": "删除成功" } );
                }
            }
        }
    }
</script>