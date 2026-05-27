"use client";
import { useState } from "react";
import HambargerBtn from "../HambargerBtn/HambargerBtn";
import HeaderMenu from "../HeaderMenu/HeaderMenu";
import styles from "./Header.module.css";

interface HeaderProps {
    pageTitle: string;
    imgSrc?: string;
}

export default function Header( {pageTitle, imgSrc}: HeaderProps ){
    const [open,setOpen] = useState(false);


    return (
        <header className={styles.Header}>
            <div className={styles.HeaderTitleHolder}>
                <div className={styles.HeaderTitles}>
                    {imgSrc && <img className={styles.HeaderIcon} src={imgSrc} alt={pageTitle} />}
                    <h2 className={styles.HeaderTitle}>{pageTitle}</h2>
                </div>
                <HambargerBtn onClick={() => setOpen(!open)} open={open}/>
            </div>
            <HeaderMenu open={open} />
        </header>
    );
}
