export const showToast = (message: string, type?: 'error' | 'log' | 'network' | 'success') => {
    window.dispatchEvent(new CustomEvent('app-toast', { detail: { message, type: type || 'success' } }))
}

export const getFormattedDate = () => {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    return `${dd}-${mm}-${yyyy}-${hh}-${min}-${ss}`;
}

export const cleanString = (str: string) => {
    return str.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').toLowerCase();
}

export const getCleanDomain = (urlString: string) => {
    try {
        let parsedUrlString = urlString;
        if (!parsedUrlString.startsWith('http')) {
            parsedUrlString = `http://${parsedUrlString}`;
        }
        const url = new URL(parsedUrlString);
        let hostname = url.hostname.replace(/^www\./, '');
        return cleanString(hostname) || 'unknown-domain';
    } catch {
        return 'unknown-domain';
    }
}
