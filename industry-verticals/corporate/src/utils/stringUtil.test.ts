import { maskString } from "./stringUtils";

describe('stringUtil-01: Test various input parameters', () => {
    it('should return null on a null string', () => {
        
        let str = "";
        const result = maskString(str);
        expect(result).toEqual("");
    });

    it('should return "**" on a one or two character string', () => {

        let str = "1";
        let result = maskString(str);
        expect(result).toEqual("*");

        str = "12";
        result = maskString(str);
        expect(result).toEqual("**");
    });

    it('should return "1*3" on the string "123"', () => {
        let str = "123";
        let result = maskString(str);
        expect(result).toEqual("1*3");
    });

    it('should return "1**4" on the string "1234"', () => {
        let str = "1234";
        let result = maskString(str);
        expect(result).toEqual("1**4");
    });

    it('should return "1***5" on the string "12345"', () => {
        let str = "12345";
        let result = maskString(str);
        expect(result).toEqual("1***5");
    });

    it('should return "1****6" on the string "123456"', () => {
        let str = "123456";
        let result = maskString(str);
        expect(result).toEqual("1****6");
    });

    it('should return "1*****7" on the string "1234567"', () => {
        let str = "1234567";
        let result = maskString(str);
        expect(result).toEqual("1*****7");
    });

    it('should return "1*****7" on the string "1234567"', () => {
        let str = "1234567";
        let result = maskString(str);
        expect(result).toEqual("1*****7");
    });

    it('should return "123***78" on the string "12345678"', () => {
        let str = "12345678";
        let result = maskString(str);
        expect(result).toEqual("123***78");
    });

    it('should return "123****89" on the string "123456789"', () => {
        let str = "123456789";
        let result = maskString(str);
        expect(result).toEqual("123****89");
    });

    it('should return "123*****90" on the string "1234567890"', () => {
        let str = "1234567890";
        let result = maskString(str);
        expect(result).toEqual("123*****90");
    });

    it('should return "123-----90" on the string "1234567890" with replacementCharacter of "-"', () => {
        let str = "1234567890";
        let result = maskString(str, 3, 2, "-");
        expect(result).toEqual("123-----90");
    });

    it('should return "12******90" on the string "1234567890" when visibleStart is 2', () => {
        let str = "1234567890";
        let result = maskString(str, 2);
        expect(result).toEqual("12******90");
    });

});