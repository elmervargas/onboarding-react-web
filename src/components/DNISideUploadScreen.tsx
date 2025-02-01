import React, {useCallback, useEffect, useRef, useState} from 'react';
import {RekognitionService} from '../service/DetectText'; // Importa tu clase RekognitionService
import {useAppContext} from '../AppContext';
import LoadingOverlay from "./LoadingOverlay";
import Webcam from "react-webcam";
import {sendImageToSentry, sendJsonToSentry} from "../service/SentryService"; // Importa el contexto


interface DNISideUploadScreenProps {
    onNext: () => void;
    onBack: () => void;
}

const videoConstraints = {
    width: {ideal: 1920},
    height: {ideal: 1080},
    facingMode: 'environment', // Usa 'user' para la cámara frontal
};

const DNISideUploadScreen: React.FC<DNISideUploadScreenProps> = ({onNext, onBack}) => {
    const [dniSidePreview, setDniSidePreview] = useState<string | null>(null); // Para la vista previa
    const {state, setState} = useAppContext(); // Usa el contexto
    const webcamRef = useRef<Webcam | null>(null);
    const [showWebcam, setShowWebcam] = useState<boolean>(true); // Estado para controlar la visibilidad de la webcam
    const rekognitionService = new RekognitionService();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false); // Estado de carga
    const isAndroid = state.platform === 'Android';

    const sendDniBackImageToSentry = (imageSrc: string, uuid: string) => {
        try {
            const filename = `dni_back_${uuid}.png`; // Crear un nombre de archivo basado en el UUID
            const tags = {
                screen: "DocumentCapture",
                action: "captureDNIBack",
                documentType: "DNI", // Etiquetas personalizadas
            };

            const extraData = {
                userId: "1234",
                deviceInfo: navigator.userAgent,
            };

            sendImageToSentry(imageSrc, filename, uuid, tags, extraData);
        } catch (error) {
            console.error("Error al enviar la imagen trasera del DNI a Sentry:", error);
        }
    };
    const sendRekognitionResponseToSentry = (detectTextResponse: object, uuid: string) => {
        try {
            const tags = {
                screen: "DocumentCapture",
                action: "captureDNIBack",
                documentType: "DNI",
            };
            const extraData = {
                userId: "1234",
                deviceInfo: navigator.userAgent,
            };
            const rekognitionResponseFilename = `rekognition_response_${uuid}.json`;
            sendJsonToSentry(detectTextResponse, rekognitionResponseFilename, uuid, tags, extraData);
        } catch (error) {
            console.error("Error al enviar la respuesta de Rekognition a Sentry:", error);
        }
    };
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            // Mostrar vista previa usando URL.createObjectURL
            setDniSidePreview(URL.createObjectURL(file));

            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setState(prevState => ({...prevState, dniBackBase64: base64String.split(',')[1]})); // Actualiza el estado global
                setShowWebcam(false); // Oculta la webcam después de capturar la foto

                sendDniBackImageToSentry(base64String, state.uuid!);
            };
            reader.onerror = (error) => {
                console.error("Error al leer el archivo:", error);
            };

            reader.readAsDataURL(file);
        }
    };
    const capturePhoto = useCallback(() => {
        if (webcamRef.current) {
            const canvas = webcamRef.current.getCanvas();
            if (canvas) {
                const imageSrc = canvas.toDataURL('image/png', 1.0);

                setDniSidePreview(imageSrc); // Muestra la foto capturada en la vista previa
                setState(prevState => ({...prevState, dniBackBase64: imageSrc!.split(',')[1]})); // Actualiza el estado global con la selfie
                setShowWebcam(false); // Oculta la webcam después de capturar la foto

                sendDniBackImageToSentry(imageSrc!, state.uuid!);
            }
        }
    }, [setState, state.uuid]);

    const retakePhoto = () => {
        setDniSidePreview(null); // Elimina la vista previa de la foto
        setState(prevState => ({...prevState, dniBackBase64: null})); // Elimina la foto capturada del estado global
        setShowWebcam(true); // Vuelve a mostrar la webcam para tomar una nueva foto
    }

    useEffect(() => {
        if (state.dniBackBase64) {
            setDniSidePreview(`data:image/jpeg;base64,${state.dniBackBase64}`);
            setShowWebcam(false);

        }
    }, [state.dniBackBase64]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!state.dniBackBase64) {
            console.error('No se ha cargado ninguna imagen.');
            return;
        }
        setLoading(true); // Inicia el estado de carga
        setError(null); // Resetear el mensaje de error

        try {
            const detectTextResponse = await rekognitionService.detectTextFromBase64Image(state.dniBackBase64);
            sendRekognitionResponseToSentry(detectTextResponse, state.uuid!);

            const detectedTexts = detectTextResponse.TextDetections
                ?.filter(detection => detection.Type === 'LINE')
                .map(detection => detection.DetectedText || '') || [];

             const keyPoints = ["direccion", "departamento", "provincia", "distrito"];

            const containsKeyPoints = Array.isArray(detectedTexts) && detectedTexts.length > 0 &&
                detectedTexts.some(text =>
                    keyPoints.some(keyword => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(keyword))
                );
            if (!containsKeyPoints) {
                setError('No se encontró una imagen valida.');
                setLoading(false);
                return;
            }
            const existingMapData = new Map(state.mapData);

            for (let key of keyPoints) {
                const extractedData = rekognitionService.findClosestTextLineBelow(detectTextResponse, key);
               if (extractedData!=null)
                existingMapData.set(key, extractedData ?? "");
            }
            setState(prevState => ({
                ...prevState,
                mapData: existingMapData,

            }));
            onNext();
        } catch (error) {
            console.error('Error al detectar texto:', error);
            setError('Ocurrió un error al detectar el texto en la imagen.');
        } finally {
            setLoading(false);
        }
    };

    return (

        <div className="flex flex-col items-center justify-center space-y-8 px-4">
            <h1 className="text-2xl font-bold text-blue-600 mb-4 text-center mx-auto">Captura de Documento de
                Identidad</h1>
            <ol className="text-gray-800 text-left leading-relaxed font-sans text-xs list-decimal list-inside">
                <li className="mb-4">Ubica el documento sobre una superficie plana, con buena iluminación; evita sombras
                    y reflejos.
                </li>
                <li className="mb-4">La imagen debe ser completa y mostrar todos los detalles.</li>
                <li className="mb-4">Asegurar que la imagen sea clara y legible.</li>
            </ol>
            {loading ? (
                <LoadingOverlay/>
            ) : (
                <div className="flex flex-col items-center space-y-4">
                    {showWebcam && (
                        <>
                            {isAndroid && (
                                <>
                                    <button
                                        className="flex flex-col items-center w-full p-4 bg-blue-50 border-2 border-blue-200 border-dashed rounded-lg cursor-pointer hover:border-blue-400 transition"
                                        onClick={capturePhoto}
                                    >
                                        <span className="text-sm text-blue-600 font-medium">Captura de Imagen posterior</span>
                                    </button>
                                    {!dniSidePreview && (
                                        <Webcam
                                            className="w-80 h-40 shadow-lg object-cover border-2 border-blue-600 rounded-lg"
                                            ref={webcamRef}
                                            audio={false} // Deshabilitar audio ya que solo queremos capturar la imagen
                                            screenshotFormat="image/png" // Cambia a PNG para evitar compresión
                                            videoConstraints={videoConstraints}
                                            forceScreenshotSourceSize={true} // Forzar el tamaño de la captura de pantalla al tamaño del video fuente
                                            screenshotQuality={1} // Set to 1 for the highest quality
                                            onUserMediaError={() => {
                                                setError('No se pudo acceder a la cámara. Por favor, verifica los permisos en tu navegador.');
                                                alert('Por favor, habilita los permisos de cámara en la configuración de tu navegador.');
                                            }}
                                        />
                                    )}
                                </>
                            )}
                            <label
                                className={`flex flex-col items-center w-full p-4 border-2 border-blue-200 border-dashed rounded-lg cursor-pointer transition ${isAndroid ? 'bg-gray-200 text-black hover:border-black' : 'bg-blue-50 text-blue-600 hover:border-blue-400'}`}>
                                <span className={`text-sm ${isAndroid ? 'text-black' : 'text-blue-600'} font-medium`}>Seleccionar archivo</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    required
                                    className="hidden"
                                />
                            </label>

                        </>
                    )}
                </div>
            )}

            {dniSidePreview && (
                <div className="flex flex-col items-center space-y-4">
                    <img
                        src={dniSidePreview}
                        alt="Vista previa de la fotografia"
                        className="w-80 h-40 shadow-lg object-cover border-2 border-blue-600 rounded-lg"
                    />
                    <button
                        onClick={retakePhoto}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded transition duration-300"
                    >
                        Retomar Foto
                    </button>
                </div>
            )}

            {loading && <LoadingOverlay/>} {/* Indicador de carga */}

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <span className="block sm:inline">{error}</span>
                </div>
            )} {/* Mostrar mensaje de error */}

            <div className="flex space-x-4 mt-6">
                <button
                    onClick={onBack}
                    className="w-32 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-6 rounded-lg shadow-sm transition duration-300 font-semibold"
                >
                    Atrás
                </button>
                <button
                    onClick={handleSubmit}
                    className={`w-32 py-2 px-6 rounded-lg shadow-lg transition duration-300 font-semibold ${
                        state.dniBackBase64 ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-400 text-gray-700 cursor-not-allowed'
                    }`}
                    disabled={!state.dniBackBase64}>
                    Siguiente
                </button>
            </div>
        </div>
    );
};

export default DNISideUploadScreen;
