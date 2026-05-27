export default function validateRequired(value: string): string | null {
    const content = value.trim();
    if(content == ""){
        return "ここは入力必須です";
    }else{
        return null;
    }
}
