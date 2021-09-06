import {CID, create} from "ipfs-http-client";
import {Indexer} from "./Indexer";
import {Analyzer} from "./Analyzer";

const OrientDBClient = require("orientjs").OrientDBClient;


const node = create({url: 'http://localhost:5001/api/v0'})

node.bitswap.stat().then(r => {
    console.log(r)
})

let db: any, client: any
OrientDBClient.connect({
    host: "localhost",
    port: 2424
})
    .then((cl: any) => {
        client = cl
        return cl.session({
            name: 'IPIDX',
            username: 'root',
            password: 'MuchSecure'
        })
    })
    .then((session: any) => {
        db = session
        const indexer = new Indexer(db)
        const analyzer = new Analyzer(node, indexer)
        // const cid = CID.parse('QmP7UYTMQFhsiRHfbgPgEngALzXWroSRVkEyWSbJTd23yf')
        const cid = CID.parse('bafybeid26vjplsejg7t3nrh7mxmiaaxriebbm4xxrxxdunlk7o337m5sqq')
        // const cid = CID.parse('bafk2bzacedvgu7brnjiu2as6552ardqbopdfo5s4swdp4lkknzrkuakscgl4u')
        console.log('cid: ', cid)
        return cid ? analyzer.analyze(cid) : Promise.reject('Invalid cid')
        // await analyzer.analyze(CID.asCID('QmP7UYTMQFhsiRHfbgPgEngALzXWroSRVkEyWSbJTd23yf'))
    })
    .then(() => {
        return db?.close();
    })
    .then(() => {
        return client?.close()
    })
    .then(() => {
        console.log("Client closed");
    })
    .catch((e: any) => {
        console.error(`Fatal error occurred: ${e}`)
    })
    .finally(() => {
        console.log('IPIDX daemon stopped!')
    })
