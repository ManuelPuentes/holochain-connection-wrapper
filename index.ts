//@ts-ignore
import { Connection } from '@holo-host/web-sdk';
import { AppWebsocket, CellId } from '@holochain/conductor-api';

export const HOLO = "HOLO";
export const HOLOCHAIN = "HOLOCHAIN";

export class HolochainConnection {

    holochain_conection!: AppWebsocket | Connection;
    cellId!: CellId;

    constructor(
        public connection_type: string, 
        public dnaHandle: string, 
        public APP_URL: string, 
        public timeout:number = 12000, 
        public signal_handler:any= ()=>{}
    ) {}

    async init(){

        if (this.connection_type == HOLO) {                

            this.holochain_conection = new Connection(
                this.APP_URL,
                this.signal_handler
            );

            await this.holochain_conection.ready();
            await this.holochain_conection.signIn();

            const appInfo = await this.holochain_conection.appInfo(this.dnaHandle);
            this.cellId = appInfo.cell_data[0].cell_id;

        } else {

            this.holochain_conection = await AppWebsocket.connect(
                this.APP_URL, 
                this.timeout, 
                this.signal_handler
            );

            const appInfo = await this.holochain_conection.appInfo({ installed_app_id: 'test-app',});
            this.cellId = appInfo.cell_data[0].cell_id;
        } 
        
    }

    async zomeCall(zome_name:string, fn_name: string, payload: any){

        console.log("El zomeCall");
        console.log(this.holochain_conection);
        

        if(this.connection_type == HOLO) {

            const result =  await this.holochain_conection.zomeCall( 
                this.dnaHandle,
                zome_name, 
                fn_name, 
                payload
            ); 

            console.log(result);

            return result;
    
        }else{

            return this.holochain_conection.callZome({
                cap: null as any,
                cell_id: this.cellId,
                zome_name: zome_name,
                fn_name: fn_name,
                payload: payload,
                provenance: this.cellId[1],
              });
        }
    }

}
