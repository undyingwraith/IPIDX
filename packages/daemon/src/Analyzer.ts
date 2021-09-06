import {CID, IPFSHTTPClient} from "ipfs-http-client";
import {IIndexer} from "./IIndexer";

export class Analyzer {
    constructor(
        private node: IPFSHTTPClient,
        private index: IIndexer,
    ) {
    }

    public analyze(cid: CID) {
        return this.node.object.stat(cid)
            .then((stat: StatResult) => {
                return stat.DataSize === 2 ? this.analyzeDirectory(stat) : this.analyzeFile(stat);
            })
    }

    private analyzeFile(stat: StatResult) {
        return this.index.exists(stat.Hash)
            .then(exists => {
                if(!exists) {
                    return this.index.addFile(stat.Hash)
                } else {
                    return this.index.touchByCid(stat.Hash)
                }
            })
    }

    private analyzeDirectory(stat: StatResult) {
        return this.index.exists(stat.Hash)
            .then(exists => {
                if(!exists) {
                    return this.index.addFolder(stat.Hash)
                } else {
                    return this.index.touchByCid(stat.Hash)
                }
            })
            .then(async () => {
                for await (const file of this.node.ls(stat.Hash)) {
                    console.log(file.path, file)
                    await this.analyze(file.cid)

                    if(!await this.index.isFileInFolder(stat.Hash, file.cid, file.name)) {
                        await this.index.addFileToFolder(stat.Hash, file.cid, file.name)
                    }
                }
            })
    }
}

export interface StatResult {
    Hash: CID
    NumLinks: number
    BlockSize: number
    LinksSize: number
    DataSize: number
    CumulativeSize: number
}