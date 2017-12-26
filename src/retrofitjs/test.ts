import "./core";
import { FetchRetrofit } from "@/retrofitjs/core";
import { GetMapping, RequestMapping } from "@/retrofitjs/base/decorators";

let retrofit: FetchRetrofit = new FetchRetrofit.Builder()
    .debug( true )
    .timeout( 0 )
    .baseUrl( "http://127.0.0.1:8080" )
    .addExceptionProcessor( (request, raise) => {
        console.log( "raise" );
        console.log( [request, raise] );
    } )
    .build();

@RequestMapping( "/menu" )
class TestClient {

    @GetMapping( "/get_menu_tree" )
    public getMenu(): Promise<any> {
        return <any>null;
    }
}

let client: TestClient = retrofit.create<TestClient>( TestClient );

(async () => {
    await client.getMenu();
    await client.getMenu();
})();