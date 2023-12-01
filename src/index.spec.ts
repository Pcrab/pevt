import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import createPEvt from "./index";

const wait = () => new Promise((resolve) => resolve(undefined));

const testMsg = "testMsg";
describe("test pevt", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    test("create pevt", () => {
        const pevt = createPEvt<{ test: string }>();
        pevt.on("test", (msg: string) => {
            expect(msg).toBe(testMsg);
        });
        pevt.emit("test", testMsg);
    });

    test("sync emit", () => {
        const pevt = createPEvt<{ test: string }>();
        let flag = false;
        const mockFn = vi.fn().mockImplementation((msg: string) => {
            expect(msg).toBe(testMsg);
            flag = true;
        });
        pevt.on("test", mockFn);
        pevt.emit("test", testMsg);
        expect(flag).toBeTruthy();
    });

    test("async emit", async () => {
        const pevt = createPEvt<{ test: string }>({ type: "async" });
        let flag = false;
        pevt.on("test", async (msg: string) => {
            await wait();
            expect(msg).toBe(testMsg);
            flag = true;
        });
        const promise = pevt.emit("test", testMsg);
        expect(flag).toBeFalsy();
        await promise;
        expect(flag).toBeTruthy();
    });

    test("promise", async () => {
        const pevt = createPEvt<{ test: string }>({ type: "promise" });
        let flag = false;
        pevt.on("test", (msg: string) => {
            flag = true;
            expect(msg).toBe(testMsg);
        });
        const promise = pevt.emit("test", testMsg);
        expect(flag).toBeFalsy();
        await promise;
        expect(flag).toBeFalsy();
        await vi.advanceTimersByTimeAsync(0);
        expect(flag).toBeTruthy();
    });
});
