const detectPlatform = (): string => {
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isAndroid = /Android/i.test(navigator.userAgent);

    if (isIOS) {
        return 'iOS';
    } else if (isAndroid) {
        return 'Android';
    } else {
        return 'Web o dispositivo no identificado';
    }
};

export default detectPlatform;
