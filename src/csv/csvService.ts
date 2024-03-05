import * as fs from 'fs';
import * as zlib from 'zlib';

import axios from 'axios';
import csvParser from 'csv-parser';
import { logger } from '@log/logger'
import { LogContext } from '@log/log.enums';
import { pipeline } from 'stream';
import { promisify } from 'util';

const pipelineAsync = promisify(pipeline);

export type ColumnMap = {
  [key: string]: string;
}

export type SourceObject = {
  [sourceKey: string]: string;
};

export type DestinationObject = {
  [destinationKey: string]: string;
};

export function parseUrlForFileName(url: string): string | null {
  const urlObj = new URL(url);
  const segments = urlObj.pathname.split('/');
  return segments[segments.length - 1] || null;
}

export async function downloadCSV(url: string): Promise<string> {
  let downloadPath = `./data/${parseUrlForFileName(url)}`;    
  
  try {
    logger.log(`Fetching: '${url}'`, LogContext.CSVService);
    const response = await axios.get(url, { responseType: 'stream' });
    
    const fileStream = fs.createWriteStream(downloadPath)
    response.data.pipe(fileStream);

    await new Promise((resolve, reject) => {
      fileStream.on('finish', resolve);
      fileStream.on('error', reject);
    });

    logger.log(`Persisted to: '${downloadPath}'`, LogContext.CSVService);

  } catch(error) {
    logger.error(`Unable to download: '${url}'`, "", LogContext.CSVService);
    downloadPath = "";
  }

  return downloadPath;
};

async function unzipFile(filePath: string): Promise<string> {
  if (!filePath.endsWith('.gz')) {
    throw new Error('Invalid file extension. Only .gz files are supported.');
  }

  const decompressedFilePath = filePath.slice(0, -3); // Remove '.gz' extension

  try {
    await new Promise((resolve, reject) => {
      const compressedStream = fs.createReadStream(filePath);
      const decompressedStream = zlib.createGunzip();
      const writeStream = fs.createWriteStream(decompressedFilePath);

      compressedStream.on('error', (error) => reject(error));
      decompressedStream.on('error', (error) => reject(error));
      writeStream.on('error', (error) => reject(error));

      writeStream.on('finish', resolve);

      compressedStream.pipe(decompressedStream).pipe(writeStream);
    });

    return decompressedFilePath;
  } catch (error: any) {
    logger.error(`Failed to unzip file: '${filePath}'`, "", LogContext.CSVService);
    throw error;
  }
}

export async function parseCSV<T>(filePath: string, columnMap: ColumnMap): Promise<T[]> {
  const data: T[] = [];
  try {
    logger.log(`CSV parsing: '${filePath}'`, LogContext.CSVService);

    let readStream: fs.ReadStream;
    if(filePath.endsWith('.gz')) {
      const decompressedFilePath = await unzipFile(filePath);
      readStream = fs.createReadStream(decompressedFilePath);
    }
    else {
      readStream = fs.createReadStream(filePath);
    }

    await pipelineAsync(
      readStream,
      csvParser(),
      async (source) => {
        let line = 1;
        for await (const row of source) {
          const transformedObject = transformObject(row, columnMap) as T
          data.push(transformedObject);
          line++;
        }
      }
    );

  } catch (error) {
    logger.error(`Unable to parse csv: '${filePath}'`, "", LogContext.CSVService);
  }

  return data;
}

export function transformObject(sourceObject: SourceObject, columnMap: ColumnMap): DestinationObject {
  const destinationObject: DestinationObject = {};

  for (const destinationKey in columnMap) {
    const sourceKey = columnMap[destinationKey];

    if (sourceKey !== "") {
      destinationObject[destinationKey] = sourceObject[sourceKey];
    }
  }

  return destinationObject;
}