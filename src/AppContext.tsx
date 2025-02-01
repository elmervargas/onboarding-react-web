import React, {createContext, useContext, useState, ReactNode, useMemo} from 'react';

interface AppState {
    uuid: string | null;
    platform: string | null;
    dniFrontBase64: string | null;
    dniBackBase64: string | null;
    selfie: string | null;
    rawData:  string[] | null;
    mapData: Map<string, string> | null;
}

interface AppContextProps {
    state: AppState;
    setState: React.Dispatch<React.SetStateAction<AppState>>;
}

// Este es el contexto, que NO es un namespace
const AppContext = createContext<AppContextProps | undefined>(undefined);

interface AppProviderProps {
    children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({children}) => {
    const [state, setState] = useState<AppState>({
        uuid: null,
        platform: null,
        dniFrontBase64: null,
        selfie: null,
        dniBackBase64: null,
        rawData: null,
        mapData: null,
    });

    // Memorizar el valor del contexto para evitar renders innecesarios
    const contextValue = useMemo(() => ({state, setState}), [state]);

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
};

// Hook personalizado para consumir el contexto
export const useAppContext = (): AppContextProps => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};
