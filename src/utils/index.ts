import { SoilDatabase, UpdateObject } from "../services/types";

const FIREBASE_MAX_UPDATE_LIMIT = 999;

export const createGetUpdateObjectFunction = <T2 extends keyof SoilDatabase>() => {
  let updateCount = 0;
  const updateObjects: UpdateObject<T2>[] = [];

  // Group the number of updates that will trigger a firebase function so that we remain under the `FIREBASE_MAX_UPDATE_LIMIT`
  const getUpdateObject = (incrementCount: boolean = true) => {
    if (incrementCount) updateCount += 1;

    const updateObjectIndex = Math.floor(updateCount / FIREBASE_MAX_UPDATE_LIMIT);
    if (!updateObjects[updateObjectIndex]) updateObjects[updateObjectIndex] = {};

    return updateObjects[updateObjectIndex];
  };

  return { updateObjects, getUpdateObject };
};

/**
 * Convenience method for blocking for a specified time.
 *
 * Usage:
 *   await sleep(5000); // block for 5 seconds
 *
 * Note:
 *   Consider the following block
 *    await sleep(1000);
 *    foo();
 *    bar();
 *
 *   This is equivalent to
 *     setTimeout(() => {
 *       foo();
 *       bar();
 *     }, 1000)
 *   however, it is a little easier to read.
 *
 * @param ms: number of milliseconds to sleep
 */
export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
