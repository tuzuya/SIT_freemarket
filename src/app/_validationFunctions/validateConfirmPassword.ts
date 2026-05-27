export default function validateConfirmPassword(password: string, confirmPassword: string): string | null {
    const content1 = password;
    const content2 = confirmPassword;
    if(content1 !== content2){
        return "パスワードが一致していません";
    }else{
        return null;
    }
}
