import yargs from "yargs";
import { hideBin } from 'yargs/helpers';
import rdfSerializer from "rdf-serialize";
import { createReadStream, createWriteStream } from "fs";
import rdfParser from "rdf-parse";

const run = async (): Promise<void> => {
  console.time('Time to serialize:');

  const yargv = yargs(hideBin(process.argv))
    .option('input', { describe: 'The input file containing RDF', type: 'string' })
    .option('inputFormat', {
      describe: 'The input RDF serialization',
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
    .option('outputFormat', {
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
    .demandOption(['input', 'output', 'inputFormat', 'outputFormat'])

  const params = await yargv.parse();

  const inputStream = rdfParser.parse(createReadStream(params.input), { contentType: params.inputFormat });
  const serializeStream = rdfSerializer.serialize(inputStream, { contentType: params.outputFormat });
  serializeStream.pipe(createWriteStream(params.output));

  console.timeEnd('Time to serialize:');
}

run().catch(error => console.error(error));