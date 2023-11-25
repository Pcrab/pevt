export type PEvtHandler<T> = (msg: T) => void | Promise<void>;

export type ExecType = "async" | "sync" | "promise";

export interface PEvtOpts {
    /**
     * whether to wait all handlers to finish before continuing
     */
    type: ExecType;
    /**
     * whether to mount the event bus on window
     */
    mountOnWindow?: boolean;
}

const createPEvt = <T extends Record<string, unknown>>(evtOpts?: PEvtOpts) => {
    type AllEvents = {
        [k in keyof T]?: PEvtHandler<T[k]>[];
    };
    const allEvents: AllEvents = {};

    const eventBus = {
        on: <K extends keyof T>(name: K, handler: PEvtHandler<T[K]>) => {
            (allEvents[name] ?? (allEvents[name] = [])).push(handler);
        },
        emit: <K extends keyof T>(
            name: K,
            msg: T[K],
            execType?: ExecType,
        ): undefined | Promise<PromiseSettledResult<void>[]> => {
            const handlers = allEvents[name];
            if (handlers) {
                const type: ExecType = execType ?? evtOpts?.type ?? "sync";

                switch (type) {
                    case "sync": {
                        handlers.forEach((handler) => {
                            handler(msg);
                        });
                        return;
                    }
                    case "async": {
                        const promises = handlers.map((handler) => {
                            return handler(msg);
                        });
                        return Promise.allSettled(promises);
                    }
                    case "promise": {
                        setTimeout(() => {
                            handlers.forEach((handler) => {
                                handler(msg);
                            });
                        });
                        return;
                    }
                }
            }
            return;
        },
        off: <K extends keyof T>(name: K, handler?: PEvtHandler<T[K]>) => {
            const handlers = allEvents[name];
            if (handlers && handler) {
                const idx = handlers.indexOf(handler);
                if (idx !== -1) {
                    handlers.splice(idx, 1);
                }
            } else {
                allEvents[name] = [];
            }
        },
    };

    interface Window {
        __PEvt?: typeof eventBus;
    }

    if (evtOpts?.mountOnWindow) {
        (window as Window).__PEvt = eventBus;
    }

    return eventBus;
};

export default createPEvt;
