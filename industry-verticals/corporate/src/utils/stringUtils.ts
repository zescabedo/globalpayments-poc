
// Masks a string: example "abcdefghijklmop" => "abc***********op"
export function maskString(str: string, visibleStart: number = 3, visibleEnd: number = 2, replacementCharacter = "*"){
    if (!str) return str;
    if (str.length == 1) return "*";  // handle small strings so we don't hit problems on the next if statement
    if (str.length == 2) return "**";

    const threshold = Math.ceil((visibleStart + visibleEnd)*1.5);

    if (str.length < threshold) {
        visibleStart = 1;
        visibleEnd = 1;
    }
    const strlen = str.length;
    return str.replace(str.substring(visibleStart,strlen-visibleEnd), replacementCharacter.repeat(strlen-visibleStart-visibleEnd));
}
