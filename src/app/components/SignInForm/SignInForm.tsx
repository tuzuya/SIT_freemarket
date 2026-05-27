"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../Header/Header";
import validateEmail from "../../_validationFunctions/validateEmail";
import validatePassword from "../../_validationFunctions/validatePassword";
import validateRequired from "@/app/_validationFunctions/validateRequired";
import style from "./SignInForm.module.css";
import Link from "next/link";
// ★修正1: createClient関数をインポート（@を使って絶対パス指定）
import { createClient } from "@/utils/supabase/client";

interface FormValues {
    email: string;
    password: string;
}

interface FormErrors {
    email: string | null;
    password: string | null;
}

interface FormTouched {
    email: boolean;
    password: boolean;
}

interface FormRequired {
    email: string | null;
    password: string | null;
}

export default function SignInForm(){
    // ★修正2: コンポーネント内で実行して supabase インスタンスを作る
    const supabase = createClient();

    const [values, setValues] = useState<FormValues>({
        email:"",
        password:"",
    })
    const [errors, setErrors] = useState<FormErrors>({
        email:null,
        password:null,
    });

    const [touched, setTouched] = useState<FormTouched>({
        email:false,
        password:false,
    });
    const [required, setRequired] = useState<FormRequired>({
        email:null,
        password:null,
    });
    const [authError, setAuthError] = useState<string | null>(null);

    // ★修正3: loadingをただの変数から state に変更（ボタン連打防止用）
    const [isLoading, setIsLoading] = useState(false);

    const router  = useRouter();

    const supabaseAuthentication = async(email: string, password: string) => {
        setAuthError(null);
        setIsLoading(true); // ロード開始

        try{
            // ここで上で作った supabase インスタンスを使う
            //dataオブジェクトには、data.user や data.session が含まれる
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            })

            if(error){
                console.log("ログイン失敗:", error.message);
                // エラーメッセージを日本語化（必要であれば）
                if (error.message === "Invalid login credentials") {
                    setAuthError("メールアドレスまたはパスワードが間違っています。");
                } else {
                    setAuthError(error.message);
                }
                setIsLoading(false); // エラーならロード解除
                return;
            }

            if(data.user){
                console.log("ログイン成功, purchaseページへ遷移:", data.user);
                router.push("/purchase");
                // 成功時は画面遷移するので setIsLoading(false) はしなくてOK
            }
        }catch(err){
            console.error("予期しないエラー:", err);
            setAuthError("予期しないエラーが発生しました。");
            setIsLoading(false);
        }
    }

    const handleSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // 既に処理中なら何もしない（連打防止）
        if(isLoading) return;

        const emptyRequiredValues = {
            email: validateRequired(values.email),
            password: validateRequired(values.password)
        }
        const isEmpty = Object.values(emptyRequiredValues).some(Boolean);
        setRequired(emptyRequiredValues);

        const submitErrors = {
            email: validateEmail(values.email),
            password: validatePassword(values.password),
        };
        const isError = Object.values(submitErrors).some(Boolean);
        setErrors(submitErrors);

        if(isEmpty || isError){
            console.log("バリデーション失敗、エラー表示");
        }else{
            console.log("バリデーション成功");
            await supabaseAuthentication(values.email, values.password);
        }

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
        <>
            <form onSubmit={handleSubmit} className={style.formContainer}>
                <h1 className={style.appName}>芝浦教科書フリマ</h1>
                <div className={style.inputDiv}>
                    <label className={style.inputLabel}>
                        <input
                            type="email"
                            placeholder="大学のGmail"
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
                            {touched.email && errors.email && (<span>{errors.email}</span>)}
                            {required.email && (<span>{required.email}</span>)}
                        </div>
                    </label>

                    <label className={style.inputLabel}>
                        <input
                            type="password"
                            placeholder="パスワード"
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
                            {touched.password && errors.password && (<span>{errors.password}</span>)}
                            {required.password && (<span>{required.password}</span>)}
                        </div>
                    </label>
                    <div>
                        <p>初めてのご利用ですか？</p>
                        <Link href="/signup" className={style.signUpLink}>会員登録はこちらから</Link>
                    </div>
                    {authError && (
                        <div className={style.errorMessage} style={{color: "red", marginTop: "10px"}}>
                            {authError}
                        </div>
                    )}
                </div>


                <footer className={style.formFooter}>
                    {/* isLoading中はボタンを押せなくして、表示を変える */}
                    <button type="submit" className={style.setButton} disabled={isLoading}>
                        {isLoading ? "処理中..." : "ロ グ イ ン"}
                    </button>
                </footer>
            </form>
        </>
    )
}
