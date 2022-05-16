export default function (str) {
    let enc = "";
    for (let i = 0; i < str.length; i++) {
        enc += "\\" + str.charCodeAt(i);
    }
    return enc;
}
