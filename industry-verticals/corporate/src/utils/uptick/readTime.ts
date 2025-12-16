import { useI18n } from 'next-localization';

export function formatReadTime(readTime: string, contentType: string = "article") {
    const { t } = useI18n();
    const readTimeValue = readTime && !isNaN(Number(readTime)) ? Number(readTime) : null;
    let translationKey = "";
    switch (contentType.toLocaleLowerCase()) {

        case "podcast":
        case "video": 
        case "workshop":
            translationKey = "minwatch"; 
            break;

        case "article": 
        case "case study":
        case "news":
        case "ebook":
        default: 
            translationKey = "minread"; 
            break;
    }
    const readTimeText = readTimeValue ? `${readTimeValue} ${t(translationKey)}` : '';
    
    return readTimeText;
}
