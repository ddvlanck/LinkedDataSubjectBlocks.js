import yargs from "yargs"
import { hideBin } from "yargs/helpers"
import SparqlClient = require('sparql-http-client');
import type * as RDF from '@rdfjs/types';
import rdfSerialize from 'rdf-serialize';
import { createWriteStream } from "fs";

const run = async (): Promise<void> => {
  const yargv = yargs(hideBin(process.argv))
    .option('endpoint', { describe: 'The SPARQL endpoint', type: 'string' })
    .option('query', { describe: 'The SPARQL query to execute', type: 'string' })
    .option('format', {
      describe: 'The output RDF serialization',
      choices: [
        'application/trig',
        'application/n-quads',
        'text/turtle',
        'application/n-triples',
        'text/n3',
        'application/ld+json'
      ]
    })
    .option('output', { describe: 'The name of the output file plus its extension', type: 'string' })
    .demandOption(['endpoint', 'format', 'output', 'query']);

  const params = await yargv.parse();
  const client = new SparqlClient({ endpointUrl: params.endpoint });

  const testQuery = `
  CONSTRUCT {
    ?s ?p ?o .
  }
  WHERE { 
    ?s ?p ?o .
  }`

  // The resultStream should contain quads (see testQuery)
  const resultStream = await client.query.construct(params.query);

  const serializedStream = rdfSerialize.serialize(resultStream, { contentType: params.format });
  serializedStream.pipe(
    createWriteStream(params.output)
  );
}

run().catch(error => console.error(error));