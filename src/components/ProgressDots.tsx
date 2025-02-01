import React from 'react';

interface ProgressDotsProps {
    currentStep: number;
    totalSteps: number;
}

const ProgressDots: React.FC<ProgressDotsProps> = ({ currentStep, totalSteps }) => {
    return (
        <div className="flex justify-center mt-4">
            {Array.from({ length: totalSteps }, (_, index) => (
                <span
                    key={index}
                    className={`w-3 h-3 mx-1 rounded-full ${index < currentStep ? 'bg-blue-600' : 'bg-gray-300'}`}
                ></span>
            ))}
        </div>
    );
};

export default ProgressDots;
