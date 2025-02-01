import React, {useEffect} from 'react';
import {useAppContext} from "../AppContext";
interface CompletionScreenProps {
    onComplete: (data: any) => void;
}
const CompletionScreen: React.FC<CompletionScreenProps> = ({ onComplete }) => {
    const { state } = useAppContext();

    useEffect(() => {
        // Añade la clase para bloquear el scroll
        document.body.classList.add('no-scroll');

        // Remueve la clase al desmontar el componente
        return () => {
            document.body.classList.remove('no-scroll');
        };
    }, []);

    useEffect(() => {
        if (state) {
            onComplete(state);
        }
    }, [onComplete, state]);


    return (
        <div className="text-center">
            <h2 className="text-4xl font-bold text-green-700 mb-4">¡Gracias por completar el proceso de onboarding!</h2>
            <p className="text-gray-700 text-lg mb-6">Nos estamos revisando tu información y pronto nos pondremos en
                contacto contigo para continuar con el siguiente paso. ¡Gracias por tu paciencia! </p>
        </div>

    );
};

export default CompletionScreen;
