"use client";
// 変更前: import HeaderMenuBtn from "../HeaderMenu/HeaderMenuBtn";
// 変更後: import HeaderMenuBtn from "../HeaderMenuBtn/HeaderMenuBtn";
// 理由: 元のパスは存在しないファイルを参照していたため、正しいパスに修正
import HeaderMenuBtn from "../HeaderMenuBtn/HeaderMenuBtn";
import styles from "./HambargerMenu.module.css"

interface HambargerMenuProps {
    open: boolean;
}

export default function HambargerMenu({open}: HambargerMenuProps){
    return (
    <>
    {/* 変更前: iconSorce={...} / 変更後: iconSource={...}
        理由: TypeScriptではHeaderMenuBtnのprop名がiconSourceであるため、
        元コードのタイポ（iconSorce）を修正 */}
    <nav className={`${styles.HambargerMenu} ${open ? styles.active : ""}`}>
        <ul className={styles.MenuList}>
            <li className={styles.MenuItem}><HeaderMenuBtn iconSource={'/cart.png'} word={'購入する'}/></li>
            <li className={styles.MenuItem}><HeaderMenuBtn iconSource={'/sell/picturebutton.png'} word={'出品する'}/></li>
            <li className={styles.MenuItem}><HeaderMenuBtn iconSource={'/like/heart_white.png'} word={'いいね'}/></li>
            <li className={styles.MenuItem}><HeaderMenuBtn iconSource={'/mypage/person.png'} word={'マイページ'}/></li>
            <li className={styles.MenuItem}><HeaderMenuBtn iconSource={'/search_result/icon_boy.png'} word={'ログイン・会員登録'}/></li>
        </ul>
    </nav>
    </>
    );
}
