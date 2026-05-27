export default function validatePassword(password: string): string | null {
    const content = password;
    if(content.length < 8){
        return "パスワードは8文字以上で入力して下さい";
    }else{
        return null;
    }
}
