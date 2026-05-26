"use client";
import { useId } from "react";
import styles from "./FormField.module.css";

interface FormFieldProps {
    inputTitle: string;
    instructionalText?: string;
    inputType: string;
    inputValue: string;
    inputFunction: (value: string) => void;
    isRequired?: boolean;
}

//Todo: cssのためのclassNameは今後追加すること
export default function FormField({
    inputTitle,
    instructionalText = "",
    inputType,
    inputValue,
    inputFunction,
    isRequired=false,
    }: FormFieldProps){
        // 変更前: useId("") / 変更後: useId()
        // 理由: TypeScriptのuseId()は引数を受け付けないため
        const inputId = useId();
    return(
        <div>
            <label htmlFor={inputId}>
                <span>
                    <span>{inputTitle}</span>
                    {isRequired && (<span>必須</span>)}
                    {instructionalText && (<small>※{instructionalText}</small>)}
                </span>
                <input
                    id={inputId}
                    placeholder={inputTitle}
                    type={inputType}
                    value={inputValue}
                    onChange={(e) => inputFunction(e.target.value)}
                    required={isRequired}
                />
            </label>
        </div>
    );
}
