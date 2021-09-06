import {CID} from "ipfs-http-client";

export interface IIndexer {
    exists(cid: CID): Promise<boolean>

    isFileInFolder(folder: CID, file: CID, filename: string): Promise<boolean>

    touchByCid(cid: CID): Promise<void>

    addFolder(cid: CID): Promise<void>

    addFile(cid: CID): Promise<void>

    addFileToFolder(folder: CID, file: CID, filename: string): Promise<void>
}