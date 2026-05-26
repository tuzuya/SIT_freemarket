"use client"
import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../Header/Header";
import validateEmail from "../../_validationFunctions/validateEmail";
import validatePassword from "../../_validationFunctions/validatePassword";
import validateConfirmPassword from "../../_validationFunctions/validateConfirmPassword";
import validateRequired from "@/app/_validationFunctions/validateRequired";
import style from "./SignUpForm.module.css";
import Link from "next/link";

// ★修正1：createClient関数をインポート
import { createClient } from "@/utils/supabase/client";

interface FormValues {
    nickname: string;
    email: string;
    password: string;
    confirmPassword: string;
}

interface FormErrors {
    nickname: string | null;
    email: string | null;
    password: string | null;
    confirmPassword: string | null;
}

interface FormTouched {
    nickname: boolean;
    email: boolean;
    password: boolean;
    confirmPassword: boolean;
}

interface FormRequired {
    nickname: string | null;
    email: string | null;
    password: string | null;
    confirmPassword: string | null;
}

export default function SignUpForm(){
    // ★修正2：コンポーネントの中で実行して supabase インスタンスを作る
    const supabase = createClient();

    const [values, setValues] = useState<FormValues>({
        nickname:"",
        email:"",
        password:"",
        confirmPassword:"",
    });
    const [errors, setErrors] = useState<FormErrors>({
        nickname:null,
        email:null,
        password:null,
        confirmPassword:null,
    });
    const [touched, setTouched] = useState<FormTouched>({
        nickname:false,
        email:false,
        password:false,
        confirmPassword:false,
    });
    const [required, setRequired] = useState<FormRequired>({
        nickname:null,
        email:null,
        password:null,
        confirmPassword:null,
    });

    const router = useRouter();

    // Supabase Auth への登録用関数
    const supabaseRegistration = async(email: string, password: string, nickname: string) => {
        // ここで上で作った supabase インスタンスを使います
        //変数の宣言時に、data: authDataなどと書くことで名前を変更して書くことができる。
        //supabaseは基本的に全て「data, error」でしかデータをやり取りしないので、基本的にdata,errorで受け取り、必要に応じて名前を変更するべき
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email,
            password: password,
            // ユーザーメタデータとしてニックネームを保存することも可能
            options: {
                data: {
                    user_name: nickname,
                }
            }
        })

        if(authError){
            console.error("supabase authの認証エラー:", authError.message);
            alert("会員登録に失敗しました: " + authError.message)
            return false; // 失敗したことを返す
        }

        if(authData.user){
            const{ error: profileError } = await supabase
                .from("profiles")
                .insert({
                    id: authData.user.id,
                    user_name: nickname,
                })

            if(profileError){
                console.error("プロフィール作成エラー:", profileError.message)
                return false;
            }else{
                console.log("登録完了！")
                return true; // 成功したことを返す
            }
        }
    }

    const handleSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const emptyRequiredValues ={
            nickname: validateRequired(values.nickname),
            email: validateRequired(values.email),
            password: validateRequired(values.password),
            confirmPassword: validateRequired(values.confirmPassword),
        }
        const isEmpty = Object.values(emptyRequiredValues).some(Boolean);
        setRequired(emptyRequiredValues);

        const submitErrors = {
            nickname: null,
            email: validateEmail(values.email),
            password: validatePassword(values.password),
            confirmPassword: validateConfirmPassword(values.password, values.confirmPassword),
        }
        const isError = Object.values(submitErrors).some(Boolean);
        setErrors(submitErrors);

        if(isEmpty || isError){
            console.log("バリデーション失敗、エラー表示");
        }else{
            // ★修正3：バリデーション成功時のみ実行する
            const isSuccess = await supabaseRegistration(values.email, values.password, values.nickname);

            if(isSuccess) {
                console.log("Supabase登録成功、ページ遷移");
                router.push("/purchase");
            }
        }
        // ★注意：以前ここにあった supabaseRegistration(...) は削除しました
        // ここにあると、エラーがあっても実行されてしまっていました。

        console.log("入力されたデータ:", values);
    }

    const handleChange = (fieldName: keyof FormValues, newValue: string) => {
        setValues((prev) => ({
            ...prev,
            [fieldName]: newValue
        }))
        setErrors((prev) => ({
            ...prev,
            [fieldName]:null
        }))
    }

    return(
        <form onSubmit={handleSubmit} className={style.formContainer}>
           {/* 中身は変更なしのため省略、元のまま記述してください */}
           {/* ...入力フォームのJSX... */}
           <label className={style.inputContainer}>
               <label className={style.inputLabel}>
                   <span className={style.labelText}>ニックネーム</span>
                   <span className={style.requiredBadge}>必須</span>
                   <span className={style.supplement}>※&nbsp;ニックネームを設定しなかった場合イニシャルがプロフィールに表示</span>
               </label>
               <input
                   type="text"
                   placeholder="例) shiba"
                   value={values.nickname}
                   onChange={(e) => handleChange("nickname", e.target.value)}
                   className={style.inputBox}
               />
               <div className={style.errorMessage}>
                   {required.nickname && (<div>{required.nickname}</div>)}
               </div>
           </label>

           <label className={style.inputContainer}>
               <label className={style.inputLabel}>
                   <span className={style.labelText}>G-mail</span>
                   <span className={style.requiredBadge}>必須</span>
                   <span className={style.supplement}>※&nbsp;大学のメールアドレスを入力</span>
               </label>
               <input
                   type="email"
                   placeholder="例) AX00000@shibaura-it.ac.jp"
                   value={values.email}
                   onChange={(e) => handleChange("email", e.target.value)}
                   onBlur={(e) => {
                       setErrors((prev) => ({
                           ...prev,
                           email: validateEmail(e.target.value)
                       }));
                       setTouched((prev) => ({
                           ...prev,
                           email: true
                       }));
                   }}
                   className={style.inputBox}
               />
               <div className={style.errorMessage}>
                   {touched.email && errors.email && (<div>{errors.email}</div>)}
                   {required.email && (<div>{required.email}</div>)}
               </div>
           </label>

           <label className={style.inputContainer}>
               <label className={style.inputLabel}>
                   パスワード
                   <span className={style.requiredBadge}>必須</span>
               </label>
               <input
                   type="password"
                   placeholder="8文字以上"
                   value={values.password}
                   onChange={(e) => handleChange("password", e.target.value)}
                   onBlur={(e) => {
                       setErrors((prev) => ({
                           ...prev,
                           password: validatePassword(e.target.value)
                       }));
                       setTouched((prev) => ({
                           ...prev,
                           password: true
                       }));
                   }}
                   className={style.inputBox}
               />
               <div className={style.errorMessage}>
                   {touched.password && errors.password && (<div>{errors.password}</div>)}
                   {required.password && (<div>{required.password}</div>)}
               </div>
           </label>

           <label className={style.inputContainer}>
               <label className={style.inputLabel}>
                   パスワード(確認用)
               <span className={style.requiredBadge}>必須</span>
               </label>
               <input
                   type="password"
                   placeholder="もう一度パスワードを入力して下さい"
                   value={values.confirmPassword}
                   onChange={(e) => handleChange("confirmPassword", e.target.value)}
                   onBlur={(e) => {
                       setErrors((prev) => ({
                           ...prev,
                           confirmPassword: validateConfirmPassword(values.password, e.target.value)
                       }));
                       setTouched((prev) => ({
                           ...prev,
                           confirmPassword: true
                       }));
                   }}
                   className={style.inputBox}
               />
               <div className={style.errorMessage}>
                   {touched.confirmPassword && errors.confirmPassword && (<div>{errors.confirmPassword}</div>)}
                   {required.confirmPassword && (<div>{required.confirmPassword}</div>)}
               </div>
           </label>
           <div className={style.signInLinkContainer}>
               <p>すでにアカウントをお持ちですか？</p>
               <Link href="/signin" className={style.signInLink}>サインインはこちら</Link>
           </div>

           <footer className={style.formFooter}>
               <button type="submit" className={style.setButton}>会&nbsp;員&nbsp;登&nbsp;録</button>
           </footer>
        </form>
    )
}
