export class UrlSafeBase64 {
    static convert(base64: string) {
        return base64
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=/g, "")
    }

    static revert(urlSafeBase64: string) {
        var str = urlSafeBase64.replace(/-/g, "+").replace(/_/g, "/")
        while (str.length % 4) {
            str += "="
        }
        return str
    }
}
