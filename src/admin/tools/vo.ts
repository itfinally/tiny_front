import { ResponseStatusEnum } from "@admin/tools/constant";

class BaseResponseEntity<Entity extends BaseResponseEntity<Entity>> {
    protected message: string;
    protected statusCode: number;

    public constructor( o?: ResponseStatusEnum | BaseResponseEntity<Entity> ) {
        if( o instanceof ResponseStatusEnum ) {
            this.message = o.message;
            this.statusCode = o.statusCode;

        } else if ( o instanceof BaseResponseEntity) {
            this.message = o.message;
            this.statusCode = o.statusCode;
        }
    }
}

class CollectionResponseEntity extends BaseResponseEntity<CollectionResponseEntity> {

}