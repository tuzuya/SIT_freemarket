"use client";
import styles from "./HambargerBtn.module.css"

interface HambargerBtnProps {
    onClick: () => void;
    open: boolean;
}

export default function HambargarBtn({onClick, open}: HambargerBtnProps){
    return <>
        <button onClick={onClick} className={` ${styles.HambargarBtn} ${open ? styles.active : ""}`}>
            <span className={`${styles.HambargarBar} ${open ? styles.active : ""}`}></span>
            <span className={`${styles.HambargarBar} ${open ? styles.active : ""}`}></span>
            <span className={`${styles.HambargarBar} ${open ? styles.active : ""}`}></span>
        </button>
    </>
}
