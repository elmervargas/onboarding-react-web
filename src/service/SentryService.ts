import * as Sentry from "@sentry/react";

interface ExtraData {
    userId?: string;
    deviceInfo?: string;
    description?: string;
    [key: string]: any;
}

const sendImageToSentry = (
    imageSrc: string,
    filename: string,
    uuid: string,
    tags: { [key: string]: string },
    extraData: ExtraData = {}
): void => {
    if (!imageSrc) {
        console.error("La imagen es inválida o no está definida.");
        return;
    }

    // Usa el scope actual para añadir el archivo adjunto y otros detalles
    Sentry.withScope((scope) => {
        // Convertir la imagen Base64 a Uint8Array
        const base64Data = imageSrc.split(',')[1]; // Remover el encabezado 'data:image/png;base64,'
        const binaryData = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

        // Añadir la imagen como un adjunto en formato Uint8Array
        scope.addAttachment({
            filename: filename, // Nombre personalizado del archivo
            data: binaryData, // Datos binarios en Uint8Array
            contentType: "image/png", // Tipo MIME
        });

        // Añadir información extra y tags personalizados
        scope.setExtras({
            uuid, // Añadir UUID a la información extra
            description: "User has captured the back side of their DNI",
            timestamp: new Date().toISOString(),
            ...extraData, // Otros datos adicionales que quieras añadir
        });

        // Setear etiquetas personalizadas
        scope.setTags({
            uuid, // Añadir el UUID también como etiqueta
            ...tags, // Combina las etiquetas proporcionadas
        });

        // Capturamos el mensaje para enviar a Sentry
        Sentry.captureMessage("DNI Back Image Captured", "info");
    });
};

const sendJsonToSentry = (
    jsonData: object,
    filename: string,
    uuid: string,
    tags: { [key: string]: string },
    extraData: ExtraData = {}
): void => {
    if (!jsonData) {
        console.error("El JSON es inválido o no está definido.");
        return;
    }

    // Convertir el JSON a una cadena
    const jsonString = JSON.stringify(jsonData);

    // Usa el scope actual para añadir el archivo adjunto y otros detalles
    Sentry.withScope((scope) => {
        // Añadir el JSON como un adjunto en formato Uint8Array
        const binaryData = new TextEncoder().encode(jsonString);

        scope.addAttachment({
            filename: filename, // Nombre personalizado del archivo
            data: binaryData, // Datos binarios en Uint8Array
            contentType: "application/json", // Tipo MIME
        });

        // Añadir información extra y tags personalizados
        scope.setExtras({
            uuid, // Añadir UUID a la información extra
            description: "User JSON data",
            timestamp: new Date().toISOString(),
            ...extraData, // Otros datos adicionales que quieras añadir
        });

        // Setear etiquetas personalizadas
        scope.setTags({
            uuid, // Añadir el UUID también como etiqueta
            ...tags, // Combina las etiquetas proporcionadas
        });

        // Capturamos el mensaje para enviar a Sentry
        Sentry.captureMessage("User JSON Data Captured", "info");
    });
};
export { sendImageToSentry, sendJsonToSentry };
