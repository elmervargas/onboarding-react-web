# Proyecto de onboarding

La aplicación es una aplicación web desarrollada en React que utiliza el servicio AWS Rekognition para analizar y procesar imágenes. Para que funcione correctamente, es necesario configurar algunos servicios y permisos en AWS.

## Requisitos

- Node.js (versión 22.11.0 LTS)
- npm (versión 10.9.0 o superior)

## Instalación

1. Instala las dependencias:

    ```bash
    npm install
    ```

## Configuración

1. Crea un archivo `.env` en la raíz del proyecto y agrega las siguientes variables de entorno:

    ```env
    REACT_APP_AWS_REGION=tu_region
    REACT_APP_COGNITO_IDENTITY_POOL_ID=tu_cognito_identity_pool_id
    ```

   Asegúrate de reemplazar `tu_cognito_identity_pool_id` con el ID real de tu pool de identidades de Cognito.

### Identity Pool en AWS Cognito:
1. Crear un Identity Pool en Amazon Cognito.
2. Configurar los roles de IAM asociados al Identity Pool.
Rol con permisos de lectura: Agregar la policy AmazonRekognitionReadOnlyAccess al rol que se utilizará para la aplicación.


## Compilación

Para compilar la aplicación, ejecuta:

```bash
npm run build
```

## Ejecución

Para ejecutar la aplicación en modo de desarrollo, ejecuta:

```bash  
npm start
```

## Notas Adicionales
Este proyecto utiliza react-webcam para capturar imágenes desde la cámara del dispositivo. Es importante asegurarse de que la conexión tenga un certificado válido (HTTPS) para que el navegador habilite correctamente la cámara.

