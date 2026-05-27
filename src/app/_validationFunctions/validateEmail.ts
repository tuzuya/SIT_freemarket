export default function validateEmail(email: string): string | null {
    const regex = /^.+@shibaura-it\.ac\.jp$/;
    const isValid = regex.test(email);
    if(isValid == false){
        return ("大学のメールアドレスを入力して下さい");
    }else{
        return null;
    }
}
