import React, {useCallback, useEffect, useRef, useState} from 'react';
import Webcam from 'react-webcam';
import {useAppContext} from '../AppContext'; // Importa el contexto de la aplicación
import LoadingOverlay from "./LoadingOverlay"; // Importa el contexto
import * as Sentry from "@sentry/react";

interface SelfieUploadScreenProps {
    onNext: () => void;
    onBack: () => void;
}

const videoConstraints = {
    width: {ideal: 1920},
    height: {ideal: 1080},
    facingMode: 'user', // Usa 'user' para la cámara frontal
};

const SelfieUploadScreen: React.FC<SelfieUploadScreenProps> = ({onNext, onBack}) => {
    const {state, setState} = useAppContext(); // Usa el contexto de la aplicación
    const webcamRef = useRef<Webcam | null>(null);
    const [selfie, setSelfie] = useState<string | null>(null);
    const [showWebcam, setShowWebcam] = useState<boolean>(true); // Estado para controlar la visibilidad de la webcam
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const capturePhoto = useCallback(() => {
        if (webcamRef.current) {
            const canvas = webcamRef.current.getCanvas();
            const imageSrc = canvas!.toDataURL('image/png', 1.0);

            setState(prevState => ({...prevState, selfie: imageSrc})); // Actualiza el estado global con la selfie
            setShowWebcam(false); // Oculta la webcam después de capturar la foto
        }
    }, [webcamRef, setState]);

    const retakePhoto = () => {
        setState(prevState => ({...prevState, selfie: null})); // Elimina la foto capturada del estado global
        setShowWebcam(true); // Vuelve a mostrar la webcam para tomar una nueva foto
    };

    useEffect(() => {
        if (state.selfie) {
            setSelfie(`data:image/jpeg;base64,${state.selfie}`);
            setShowWebcam(false);
        }
    }, [state.selfie]);

    const handleUserMediaError = () => {
        const errorMessage = 'No se pudo acceder a la cámara. Por favor, verifica los permisos en tu navegador.';
        setError(errorMessage);
        alert('Por favor, habilita los permisos de cámara en la configuración de tu navegador.');
        Sentry.captureException(new Error(errorMessage));
    };
    return (

        <div className="flex flex-col items-center justify-center space-y-6">
            <h1 className="text-2xl font-bold text-blue-600 mb-4">Tómate una selfie</h1>
            <p className="text-gray-800 mb-6 text-center leading-relaxed font-sans text-sm">
                Asegúrate de que tu rostro esté bien iluminado y centrado en la imagen. Evita usar sombreros, gafas
                de sol u otros accesorios que puedan cubrir tu rostro. Mantén el teléfono a la altura de tus ojos y
                asegúrate de que tu fondo esté despejado para obtener una foto clara y nítida.
            </p>
            {loading ? (
                <LoadingOverlay/>
            ) : (
                <div className="flex flex-col items-center space-y-4">
                    {showWebcam && (
                        <>
                            <Webcam
                                className="w-40 h-40 rounded-full shadow-lg object-cover border-2 border-blue-600"
                                ref={webcamRef}
                                audio={false} // Deshabilitar audio ya que solo queremos capturar la imagen
                                screenshotFormat="image/png" // Cambia a PNG para evitar compresión
                                videoConstraints={videoConstraints}
                                screenshotQuality={1} // Set to 1 for the highest quality
                                forceScreenshotSourceSize={true} // Forzar el tamaño de la captura de pantalla al tamaño del video fuente
                                onUserMediaError={handleUserMediaError}
                            />
                            <button
                                onClick={capturePhoto}
                                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition duration-300"
                            >
                                Tomar Selfie
                            </button>
                        </>
                    )}
                </div>
            )}

            {state.selfie && (
                <div className="flex flex-col items-center space-y-4">
                    <img
                        src={state.selfie}
                        alt="Vista previa de la selfie"
                        className="w-40 h-40 rounded-full shadow-lg object-cover border-2 border-blue-600"
                    />
                    <button
                        onClick={retakePhoto}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded transition duration-300"
                    >
                        Retomar Selfie
                    </button>
                </div>
            )}

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex space-x-4 mt-6">
                <button
                    onClick={onBack}
                    className="w-32 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-6 rounded-lg shadow-sm transition duration-300 font-semibold">

                    Atrás
                </button>
                <button
                    onClick={onNext}
                    className={`w-32 py-2 px-6 rounded-lg shadow-lg transition duration-300 font-semibold ${
                        state.selfie ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-400 text-gray-700 cursor-not-allowed'
                    }`} disabled={!state.selfie}
                >
                    Siguiente
                </button>
            </div>
        </div>
    );
};

export default SelfieUploadScreen;