"use client";
import styles from "./HeaderMenuBtn.module.css"

interface HeaderMenuBtnProps {
    iconSource: string;
    word: string;
    onClick?: () => void;
}

export default function HeaderMenuBtn({iconSource, word, onClick}: HeaderMenuBtnProps){
    return (
        <>
            <label>
                <button className={styles.HeaderMenuBtn} onClick={() => onClick?.()}>
                    <div className={styles.MenuIconBox}>
                        <img src={iconSource} alt={word} className={styles.MenuIcon}/>
                    </div>
                    <p className={styles.MenuTxt}>{word}</p>
                </button>
            </label>
        </>
    );
}
