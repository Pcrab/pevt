export type PEvtHandler<T> = (msg: T) => void | Promise<void>;

export type ExecType = "async" | "sync" | "promise";

export interface PEvtOpts {
    /**
     * whether to wait all handlers to finish before continuing
     */
    type: ExecType;
}

export interface PEvt<T extends Record<string, unknown>> {
    on: <K extends keyof T>(name: K, handler: PEvtHandler<T[K]>) => void;
    emit: <K extends keyof T>(
        name: K,
        msg: T[K],
        execType?: ExecType,
    ) => undefined | Promise<PromiseSettledResult<void>[]>;
    off: <K extends keyof T>(name: K, handler?: PEvtHandler<T[K]>) => void;
}

const createPEvt = <T extends Record<string, unknown>>(evtOpts?: PEvtOpts) => {
    type AllEvents = {
        [k in keyof T]?: PEvtHandler<T[k]>[];
    };
    const allEvents: AllEvents = {};

    const eventBus: PEvt<T> = {
        on: (name, handler) => {
            (allEvents[name] = allEvents[name] ?? []).push(handler);
        },
        emit: (name, msg, execType?) => {
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
                        }, 0);
                        return;
                    }
                }
            }
            return;
        },
        off: (name, handler?) => {
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

    return eventBus;
};

export default createPEvt;
