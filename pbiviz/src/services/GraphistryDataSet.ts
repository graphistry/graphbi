import {GraphistryClient} from "./GraphistryClient"
import {GraphistryFile, GraphistryFileType} from "./GraphistryFile";
export class GraphistryDataSet
{
   
    
    //private _files:GraphistryFile[];
    private _nodeFiles:GraphistryFile[];
    private _edgeFiles:GraphistryFile[];
    private _bindings:Object;
    private _datasetID:string;


    private _graphistryClient:GraphistryClient;
    constructor()
    {
        this._graphistryClient= new GraphistryClient();
        this._nodeFiles = new Array();
        this._edgeFiles = new Array();
    }

    public GetGraphUrl():Promise<string> {
        const uploadedFiles = Promise.all(
            (this._nodeFiles.concat(this._edgeFiles)).map((file)=>{
                return file.CreateFile()
                    .then((response)=>{ 
                        if (response) {
                            return file.UploadData();
                        }
                        throw new Error("File creation failed 1");
                    })
                    .then((ok)=>{
                        if (!ok) {
                            throw new Error("File upload failed 2");
                        }
                        return file;
                    })
            }));
        return uploadedFiles.then((files)=>{
            console.debug("Uploaded Files", files);
            return files;
        }).then(() => {
            const fileBindings = {
                node_files: this._nodeFiles.map((file)=> file.fileID ),
                edge_files: this._edgeFiles.map((file)=> file.fileID )
            }
            const bindings = {...fileBindings, ...this._bindings};
            console.debug("combined Bindings", bindings);

            return this.CreateDataSet(bindings);
            /*
            return this._graphistryClient.Post("api/v2/files/",{
                file_type:this.FileType
            }).then((fileJsonResults)=>{
                this._fileId=fileJsonResults.file_id;
                this._fileCreated=true;
                return Promise.resolve(this._fileCreated);
            })
            return "ok"
            */
        })
    }

    public CreateDataSet(data:Object):Promise<string> {
        return this._graphistryClient.Post("api/v2/upload/datasets/",data)
        .then((dataJsonResults)=>{
            console.debug("DataSet Created", dataJsonResults);
            this._datasetID = dataJsonResults.data.dataset_id;
            //this._fileId=fileJsonResults.file_id;
            //this._fileCreated=true;
            return this._datasetID;
        })
    }

    public AddBindings(bindings: Object): void {
        this._bindings = bindings;
    }

    public AddFile(file: GraphistryFile) {
        if (file.Type === GraphistryFileType.Node) {
            this._nodeFiles.push(file);
        } else if (file.Type === GraphistryFileType.Edge) {
            this._edgeFiles.push(file);
        } else {
            throw new Error("Invalid File Type");
        }
    }
}