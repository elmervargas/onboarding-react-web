import React, {useEffect} from 'react';
import detectPlatform from "../service/PlatformDetector";
import {v4 as uuidv4} from 'uuid';
import {useAppContext} from "../AppContext";

interface WelcomeScreenProps {
    onNext: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({onNext}) => {
    const {state, setState} = useAppContext();

    useEffect(() => {
        const platform = detectPlatform();
        setState(prevState => ({...prevState, uuid: uuidv4(), platform}));
        // Añade la clase para bloquear el scroll
        document.body.classList.add('no-scroll');

        // Remueve la clase al desmontar el componente
        return () => {
            document.body.classList.remove('no-scroll');
        };
    }, []);
    return (

        <div className="text-center">
            <h1 className="text-2xl font-bold text-blue-600 mb-4">¡Bienvenido al proceso de onboarding!</h1>
            <p className="text-gray-800 mb-6 text-center leading-relaxed font-sans text-sm">
                Este proceso es rápido y sencillo, solo te tomará unos minutos. Ten a mano tu DNI y prepárate para
                tomarte una selfie. ¡Estamos aquí para guiarte en cada paso!
            </p>
            <button
                onClick={onNext}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition duration-300"
            >
                Comenzar
            </button>
        </div>
    );
};

export default WelcomeScreen;
