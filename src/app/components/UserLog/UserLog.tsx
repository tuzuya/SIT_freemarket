"use client";

import { usePathname } from "next/navigation";
import UserLogWords from "../UserLogWords/UserLogWords";
import styles from "./UseLog.module.css";


export default function UserLog(){
    const pathname = usePathname();
    const Logs=UserLogWords(pathname);
    return (
        <>
            <div className={styles.UserLogs}>
            {Logs.map((Log,index) => (
                <span key={index} className={styles.LogFolder}>
                    {Log.img && <img className={styles.LogIcons} src={Log.img} alt={Log.label} />}
                    {/* 変更前: styles[Log.state] / 変更後: styles[Log.state ?? ""]
                        理由: Log.stateがundefinedの場合、TypeScriptの厳格モードではエラーになるため、
                        undefinedのとき空文字にフォールバックするよう変更 */}
                    <p className={`${styles.LogLabel} ${styles[Log.state ?? ""]}`}>{Log.label}</p>
                    <p className={styles.LogArrow}>{index < Logs.length-1 && ">"}</p>
                </span>
            ))}
            </div>
        </>
    );
}
