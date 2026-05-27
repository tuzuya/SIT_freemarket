"use client";
import styles from "./SendBtn.module.css";

export default function SendBtn(){
    return (
        <>
            <div className={styles.sendBtnBox}>
                <button type="submit" className={styles.sendBtn}>
                  検索
                </button>
            </div>
        </>
    );
}
