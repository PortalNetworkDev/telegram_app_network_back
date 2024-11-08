import { FastifyPluginAsync } from "fastify";
import fileSystem from "fs";
import crypto from "crypto";
import createPlugin from "fastify-plugin";

//TODO: remove ts ignore after made models_tasks typed
export default createPlugin<FastifyPluginAsync>(async function (fastify, ops) {
  const pathForWatch = `${process.cwd()}/db/`;
  const filesForWatching = ["catsimport.csv", "tasksimport.csv"];

  const updateNecessaryDbTables = (fileName: string) => {
    if (fileName === filesForWatching[0]) {
      // @ts-ignore: Unreachable code error
      fastify.models_tasks.reimportCat(`${pathForWatch}/catsimport.csv`);
    }
    if (fileName === filesForWatching[1]) {
      // @ts-ignore: Unreachable code error
      fastify.models_tasks.reimportTasks(`${pathForWatch}/tasksimport.csv`);
    }
  };

  const fileWatcher = () => {
    const fileHashes = new Map();

    fileSystem.watch(pathForWatch, (event, fileName) => {
      if (
        event === "change" && fileName && 
        filesForWatching.some((name) => name === fileName)
      ) {
        const hashCreator = crypto.createHash("md5");
        const readStream = fileSystem.readFileSync(
          `${pathForWatch}${fileName}`
        );

        let currentHash = null;

        hashCreator.update(readStream);
        currentHash = hashCreator.digest("hex");

        if (
          fileHashes.has(fileName) &&
          currentHash === fileHashes.get(fileName)
        ) {
          return;
        }

        fileHashes.set(fileName, currentHash);
        updateNecessaryDbTables(fileName);
      }
    });
  };
  fileWatcher();
});
