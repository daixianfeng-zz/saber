
export function calcSize(size) {
    if(isNaN(size)){
        return '';
    }
    if(+size > 1024 * 1024 * 1024 * 1024){
        return `${(+size / (1024 * 1024 * 1024 * 1024)).toFixed(1)} TB`;
    }else if(+size > 1024 * 1024 * 1024){
        return `${(+size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    }else if(+size > 1024 * 1024){
        return `${(+size / (1024 * 1024)).toFixed(1)} MB`;
    }else if(+size > 1024){
        return `${(+size / (1024)).toFixed(0)} KB`;
    }else {
        return `1 KB`;
    }
}
export function toPer(num, f) {
    if(isNaN(num)){
        return '';
    }
    let perNum = +num;
    const fBit = f >= 0 && f <= 10 ? f : 2;
    perNum = `${(perNum*100).toFixed(fBit)} %`;
    return perNum;
}
export function limitLength (item, num) {
    let length = num;
    if(isNaN(num) || num <= 0){
        length = 15;
    }
    if(typeof item !== 'string'){
        return '';
    }else if (item.length > length){
        return `${item.substr(0,length)}...`
    }else{
        return item;
    }
}