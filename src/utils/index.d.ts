import { SoilDatabase } from "..";
import { UpdateObject } from "../services/types";
export declare const createGetUpdateObjectFunction: <T extends SoilDatabase, T2 extends keyof SoilDatabase>() => {
    updateObjects: UpdateObject<T, T2>[];
    getUpdateObject: (incrementCount?: boolean) => UpdateObject<T, T2>;
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
export declare const sleep: (ms: number) => Promise<unknown>;
