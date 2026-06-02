"use client";
import HeaderMenuBtn from "../HeaderMenuBtn/HeaderMenuBtn";
import styles from "./HeaderMenu.module.css"
import { useRouter } from "next/navigation";

interface HeaderMenuProps {
    open: boolean;
}

export default function HeaderMenu({open}: HeaderMenuProps){
    const router = useRouter();

    return (
    <>
    <nav className={`${styles.HambargerMenu} ${open ? styles.active : ""}`}>
        <ul className={styles.MenuList}>
            <li className={styles.MenuItem}><HeaderMenuBtn iconSource={'/cart.png'} word={'購入する'} onClick={() => router.push("/purchase")}/></li>
            <li className={styles.MenuItem}><HeaderMenuBtn iconSource={'/sell/picturebutton.png'} word={'出品する'} onClick={() => router.push("/sell")}/></li>
            <li className={styles.MenuItem}><HeaderMenuBtn iconSource={'/like/heart_white.png'} word={'いいね'} onClick={() => router.push("/like")}/></li>
            <li className={styles.MenuItem}><HeaderMenuBtn iconSource={'/mypage/person.png'} word={'マイページ'}/></li>
            <li className={styles.MenuItem}><HeaderMenuBtn iconSource={'/search_result/icon_boy.png'} word={'ログイン・会員登録'} onClick={() => router.push("/signup")}/></li>
        </ul>
    </nav>
    </>
    );
}
