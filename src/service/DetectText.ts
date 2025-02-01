import AWS from 'aws-sdk';

const identityPoolId = process.env.REACT_APP_COGNITO_IDENTITY_POOL_ID;

if (!identityPoolId) {
    throw new Error('REACT_APP_COGNITO_IDENTITY_POOL_ID no está definido en las variables de entorno');
}

const credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: identityPoolId
});
AWS.config.credentials = credentials;
AWS.config.update({
    region: process.env.REACT_APP_AWS_REGION, // Región desde las variables de entorno
    credentials: credentials,
});

export class RekognitionService {
    private rekognition: AWS.Rekognition;

    constructor() {
        this.rekognition = new AWS.Rekognition();
    }

    async detectTextFromBase64Image(base64Image: string): Promise<AWS.Rekognition.DetectTextResponse> {
        const byteArray = this.base64ToUint8Array(base64Image);
        const params = {
            Image: {
                Bytes: byteArray.buffer,
            },
        };

        try {
            return await this.rekognition.detectText(params).promise();                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     return await this.rekognition.detectText(params).promise();
        } catch (error) {
            console.error('Error detecting text:', error);
            throw error;
        }
    }

    findClosestTextLineBelow = (
        data: AWS.Rekognition.DetectTextResponse,
        refText: string
    ): string | undefined => {
        if (!data.TextDetections || data.TextDetections.length === 0) {
            console.log("No se encontraron detecciones de texto.");
            return undefined;
        }
        // Filtrar detecciones de texto con "Type": "LINE"
        const lineDetections = data.TextDetections.filter(detection => detection.Type === "LINE");

        let refTop: number | undefined;
        let refLeft: number | undefined;

        for (const detection of lineDetections) {
            if (detection.DetectedText?.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(refText.toLowerCase())) {
                refTop = detection.Geometry?.BoundingBox?.Top;
                refLeft = detection.Geometry?.BoundingBox?.Left;
                break;
            }
        }

        if (refTop === undefined || refLeft === undefined) {
            console.log(`Texto clave "${refText}" no encontrado.`);
            return undefined;
        }

        const marginOfError = 0.00; // Define a 5% margin of error
        const textsBelow = lineDetections.filter((detection) => {
            const detectionTop = detection.Geometry?.BoundingBox?.Top;
            return detectionTop !== undefined && detectionTop > refTop! - marginOfError;
        });

        if (textsBelow.length === 0) {
            console.log(`No se encontraron textos debajo del texto clave "${refText}".`);
            return undefined;
        }

        let closestText = textsBelow[0];
        let minDistance = Math.sqrt(
            Math.pow((textsBelow[0].Geometry?.BoundingBox?.Top || 0) - (refTop - marginOfError), 2) +
            Math.pow((textsBelow[0].Geometry?.BoundingBox?.Left || 0) - refLeft, 2)
        );

        for (const detection of textsBelow) {
            const detectionTop = detection.Geometry?.BoundingBox?.Top || 0;
            const detectionLeft = detection.Geometry?.BoundingBox?.Left || 0;
            const distance = Math.sqrt(
                Math.pow(detectionTop - refTop, 2) +
                Math.pow(detectionLeft - refLeft, 2)
            );
            if (distance < minDistance) {
                closestText = detection;
                minDistance = distance;
            }
        }

        return closestText.DetectedText;
    };

    private base64ToUint8Array(base64: string): Uint8Array {
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        return new Uint8Array(byteNumbers);
    }
}