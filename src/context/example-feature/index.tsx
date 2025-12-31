import React, { createContext, useContext, useReducer, ReactNode, Dispatch } from 'react';

// Types
export interface ExampleState {
    count: number;
}

export type ExampleAction = { type: 'INCREMENT' } | { type: 'DECREMENT' };

const initialState: ExampleState = {
    count: 0,
};

// Reducer
export const exampleReducer = (state: ExampleState, action: ExampleAction): ExampleState => {
    switch (action.type) {
        case 'INCREMENT':
            return { count: state.count + 1 };
        case 'DECREMENT':
            return { count: state.count - 1 };
        default:
            return state;
    }
};

// Contexts
const ExampleStateContext = createContext<ExampleState | undefined>(undefined);
const ExampleDispatchContext = createContext<Dispatch<ExampleAction> | undefined>(undefined);

// Provider
export const ExampleProvider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(exampleReducer, initialState);

    return (
        <ExampleDispatchContext.Provider value={dispatch}>
            <ExampleStateContext.Provider value={state}>
                {children}
            </ExampleStateContext.Provider>
        </ExampleDispatchContext.Provider>
    );
};

// Hooks
export const useExampleState = () => {
    const context = useContext(ExampleStateContext);
    if (context === undefined) {
        throw new Error('useExampleState must be used within a ExampleProvider');
    }
    return context;
};

export const useExampleDispatch = () => {
    const context = useContext(ExampleDispatchContext);
    if (context === undefined) {
        throw new Error('useExampleDispatch must be used within a ExampleProvider');
    }
    return context;
};
