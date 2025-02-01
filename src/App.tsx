import React, {useState} from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import SelfieUploadScreen from './components/SelfieUploadScreen';
import DNIFrontUploadScreen from './components/DNIFrontUploadScreen';
import DNISideUploadScreen from './components/DNISideUploadScreen';
import CompletionScreen from './components/CompletionScreen';
import ProgressDots from './components/ProgressDots';
import {useAppContext} from './AppContext';

interface AppProps {
    onComplete: (data: any) => void;
}

const App: React.FC<AppProps> = ({onComplete}) => {
    const {state} = useAppContext();
    const [step, setStep] = useState<number>(1);

    const nextStep = () => {
        if (step === 5) {
            onComplete(state); // Llama al callback con el estado actual en el último paso
        } else {
            setStep(step + 1);
        }
    };

    const prevStep = () => setStep(step - 1);

    const renderScreen = () => {
        switch (step) {
            case 1:
                return <WelcomeScreen onNext={nextStep}/>;
            case 2:
                return <SelfieUploadScreen onNext={nextStep} onBack={prevStep}/>;
            case 3:
                return <DNIFrontUploadScreen onNext={nextStep} onBack={prevStep}/>;
            case 4:
                return <DNISideUploadScreen onNext={nextStep} onBack={prevStep}/>;
            case 5:
                return <CompletionScreen onComplete={onComplete}/>;
            default:
                return <WelcomeScreen onNext={nextStep}/>;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
            <div className="bg-white shadow-lg rounded-lg p-6 max-w-md w-full mx-4">
                {renderScreen()}
                <footer className="mt-4">
                    <ProgressDots currentStep={step} totalSteps={5}/>
                </footer>
            </div>
        </div>
    );
};


export default App;